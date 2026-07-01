# apps/clients/views.py

import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Client, Package, Payment, MembershipHistory
from .serializers import ClientSerializer, PackageSerializer, PaymentSerializer, MembershipHistorySerializer


# ── Packages ──────────────────────────────────────────────────────────────────

class PackageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        packages = Package.objects.filter(gym=request.user.gym)
        return Response(PackageSerializer(packages, many=True).data)

    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gym=request.user.gym)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PackageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, gym):
        try:
            return Package.objects.get(pk=pk, gym=gym)
        except Package.DoesNotExist:
            return None

    def put(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PackageSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Clients ───────────────────────────────────────────────────────────────────

class ClientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clients = Client.objects.filter(gym=request.user.gym).select_related(
            'package', 'trainer', 'program_package__program'
        )

        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'all':
            clients = clients.filter(status=status_filter)

        # Filter PT clients only
        pt_filter = request.query_params.get('pt')
        if pt_filter == 'true':
            from django.db.models import Q
            clients = clients.filter(
                Q(personal_training=True) |
                Q(program_package__program__program_type='personal_training')
            ).distinct()

        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            clients = clients.filter(
                Q(name__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            ).distinct()

        return Response(ClientSerializer(clients, many=True).data)

    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.save(gym=request.user.gym)
            return Response(ClientSerializer(client).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, gym):
        try:
            return Client.objects.get(pk=pk, gym=gym)
        except Client.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ClientSerializer(obj).data)

    def put(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        history_action = data.pop('_history_action', [None])[0] if hasattr(data, 'pop') else data.pop('_history_action', None)
        amount_paid = data.pop('_amount_paid', [None])[0] if hasattr(data, 'pop') else data.pop('_amount_paid', None)
        history_note = data.pop('_history_note', [''])[0] if hasattr(data, 'pop') else data.pop('_history_note', '')

        serializer = ClientSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.validated_data['_history_action'] = history_action
            serializer.validated_data['_amount_paid'] = amount_paid
            serializer.validated_data['_history_note'] = history_note
            client = serializer.save()
            return Response(ClientSerializer(client).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Renew / Upgrade / Add-on ──────────────────────────────────────────────────

class ClientRenewView(APIView):
    """
    POST /api/clients/<pk>/renew/

    Handles three scenarios depending on `action` in the request body:
      'renewal'  — extend expiry date, keep same package
      'upgrade'  — change program package (+ optionally extend expiry)
      'addon'    — add a mid-cycle program (e.g. personal training) without
                   changing the base expiry; revenue counted in current month

    Revenue attribution via recognized_month:
      renewal / upgrade → last month of the new period (expiry_date)
      addon             → first day of current month (today's month)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, client_pk):
        try:
            client = Client.objects.get(pk=client_pk, gym=request.user.gym)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

        new_expiry = request.data.get('expiry_date')
        new_pkg = request.data.get('program_package')
        new_trainer = request.data.get('trainer')
        amount_paid = request.data.get('amount_paid')
        # Manually-set total amount to charge for this renewal/upgrade/addon.
        # Overrides the package's list price when provided — lets staff apply
        # discounts / custom quotes so the pending balance isn't forced to
        # always equal the package price.
        total_amount = request.data.get('total_amount')
        payment_method = request.data.get('payment_method', client.payment_method)
        note = request.data.get('note', '')
        requested_action = request.data.get('action', None)
        today = datetime.date.today()

        # personal_training is derived from the program package's type, not from
        # the trainer being assigned. Assigning a trainer who *can* do PT does
        # not, by itself, mean this client is enrolled in a PT program.
        # We only honor an explicit personal_training value from the request
        # when no program_package is being changed (e.g. a manual override);
        # otherwise it's recalculated below from the package itself.
        new_pt = client.personal_training
        explicit_pt = request.data.get('personal_training', None)
        if explicit_pt is not None and not new_pkg:
            new_pt = explicit_pt

        # Resolve action
        if requested_action in ('renewal', 'upgrade', 'addon'):
            action = requested_action
        elif new_pkg and str(new_pkg) != str(client.program_package_id or ''):
            action = 'upgrade'
        else:
            action = 'renewal'

        # Revenue attribution date
        if action == 'addon':
            recognized = today.replace(day=1)
        else:
            if new_expiry:
                try:
                    exp_date = datetime.date.fromisoformat(str(new_expiry))
                except ValueError:
                    exp_date = client.expiry_date
            else:
                exp_date = client.expiry_date
            recognized = exp_date

        # Update client fields
        if new_expiry and action != 'addon':
            if isinstance(new_expiry, str):
                new_expiry = datetime.date.fromisoformat(new_expiry)
            client.expiry_date = new_expiry

        if new_pkg:
            client.program_package_id = new_pkg
            # PT flag follows the package's program_type — set or unset to match,
            # regardless of which trainer is assigned.
            try:
                from apps.activities.models import ProgramPackage
                pkg_obj = ProgramPackage.objects.select_related('program').get(pk=new_pkg)
                new_pt = (pkg_obj.program.program_type == 'personal_training')
            except Exception:
                pkg_obj = None
                pass

        # Assigning/changing the trainer never changes the PT flag on its own.
        if new_trainer is not None:
            client.trainer_id = new_trainer or None

        client.personal_training = new_pt
        client.payment_method = payment_method
        client.save()
        client.update_status()

        # Charge the client for the (new) package price on renewal / upgrade /
        # addon. balance_due = total_due - total_paid; "Pay Balance" on the
        # client profile records further Payment rows against this charge.
        # A manually-provided total_amount overrides the package price so
        # staff can set the pending balance themselves (discounts, custom
        # quotes) instead of it always being auto-locked to list price.
        if total_amount is not None:
            try:
                client.charge(total_amount)
            except Exception:
                pass
        elif new_pkg:
            try:
                from apps.activities.models import ProgramPackage
                price = ProgramPackage.objects.get(pk=new_pkg).price
                client.charge(price)
            except Exception:
                pass

        # Write membership history
        MembershipHistory.objects.create(
            client=client,
            gym=client.gym,
            program_package=client.program_package,
            trainer=client.trainer,
            personal_training=client.personal_training,
            join_date=client.join_date,
            expiry_date=client.expiry_date,
            amount_paid=amount_paid,
            payment_method=payment_method,
            recognized_month=recognized,
            action=action,
            note=note,
        )

        # Create Payment record if amount given
        if amount_paid:
            Payment.objects.create(
                client=client,
                gym=client.gym,
                amount=amount_paid,
                date=today,
                method=payment_method,
                recognized_month=recognized,
                note=note or f'{action.capitalize()} payment',
            )

        return Response(ClientSerializer(client).data)


# ── Payments ──────────────────────────────────────────────────────────────────

class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, client_pk):
        try:
            client = Client.objects.get(pk=client_pk, gym=request.user.gym)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            # Use explicitly provided recognized_month, else fall back to payment date
            recognized = serializer.validated_data.get(
                'recognized_month',
                serializer.validated_data.get('date', datetime.date.today())
            )
            serializer.save(
                client=client,
                gym=request.user.gym,
                recognized_month=recognized,
            )
            return Response(ClientSerializer(client).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)