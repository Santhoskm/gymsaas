# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from .models import Client, Package, Payment, MembershipHistory
# from .serializers import ClientSerializer, PackageSerializer, PaymentSerializer, MembershipHistorySerializer
# import datetime


# # ── Packages ──────────────────────────────────────────────────────────────────

# class PackageListCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         packages = Package.objects.filter(gym=request.user.gym)
#         return Response(PackageSerializer(packages, many=True).data)

#     def post(self, request):
#         serializer = PackageSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(gym=request.user.gym)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class PackageDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk, gym):
#         try:
#             return Package.objects.get(pk=pk, gym=gym)
#         except Package.DoesNotExist:
#             return None

#     def put(self, request, pk):
#         obj = self.get_object(pk, request.user.gym)
#         if not obj:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         serializer = PackageSerializer(obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         obj = self.get_object(pk, request.user.gym)
#         if not obj:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         obj.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# # ── Clients ───────────────────────────────────────────────────────────────────

# class ClientListCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         clients = Client.objects.filter(gym=request.user.gym).select_related(
#             'package', 'trainer', 'program_package__program'
#         )
#         status_filter = request.query_params.get('status')
#         if status_filter and status_filter != 'all':
#             clients = clients.filter(status=status_filter)

#         search = request.query_params.get('search')
#         if search:
#             from django.db.models import Q
#             clients = clients.filter(
#                 Q(name__icontains=search) |
#                 Q(phone__icontains=search) |
#                 Q(email__icontains=search)
#             ).distinct()

#         return Response(ClientSerializer(clients, many=True).data)

#     def post(self, request):
#         serializer = ClientSerializer(data=request.data)
#         if serializer.is_valid():
#             client = serializer.save(gym=request.user.gym)
#             return Response(ClientSerializer(client).data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class ClientDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk, gym):
#         try:
#             return Client.objects.get(pk=pk, gym=gym)
#         except Client.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         obj = self.get_object(pk, request.user.gym)
#         if not obj:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         return Response(ClientSerializer(obj).data)

#     def put(self, request, pk):
#         obj = self.get_object(pk, request.user.gym)
#         if not obj:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

#         # Extract history meta-fields before passing to serializer
#         data = request.data.copy()
#         history_action = data.pop('_history_action', [None])[0] if hasattr(data, 'pop') else data.pop('_history_action', None)
#         amount_paid = data.pop('_amount_paid', [None])[0] if hasattr(data, 'pop') else data.pop('_amount_paid', None)
#         history_note = data.pop('_history_note', [''])[0] if hasattr(data, 'pop') else data.pop('_history_note', '')

#         serializer = ClientSerializer(obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             # Inject history hints into validated_data via a side-channel
#             serializer.validated_data['_history_action'] = history_action
#             serializer.validated_data['_amount_paid'] = amount_paid
#             serializer.validated_data['_history_note'] = history_note
#             client = serializer.save()
#             return Response(ClientSerializer(client).data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         obj = self.get_object(pk, request.user.gym)
#         if not obj:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         obj.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# # ── Renew / Upgrade (dedicated endpoints) ────────────────────────────────────

# class ClientRenewView(APIView):
#     """POST /api/clients/<pk>/renew/ — renews membership, writes history."""
#     permission_classes = [IsAuthenticated]

#     def post(self, request, client_pk):
#         try:
#             client = Client.objects.get(pk=client_pk, gym=request.user.gym)
#         except Client.DoesNotExist:
#             return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

#         new_expiry = request.data.get('expiry_date')
#         new_pkg = request.data.get('program_package')
#         new_trainer = request.data.get('trainer')
#         new_pt = request.data.get('personal_training', client.personal_training)
#         amount_paid = request.data.get('amount_paid')
#         payment_method = request.data.get('payment_method', client.payment_method)
#         note = request.data.get('note', '')

#         # Determine action: upgrade if package changed, renewal otherwise
#         action = 'upgrade' if new_pkg and str(new_pkg) != str(client.program_package_id or '') else 'renewal'

#         # Update client fields
#         if new_expiry:
#             if isinstance(new_expiry, str):
#                 new_expiry = datetime.date.fromisoformat(new_expiry)
#             client.expiry_date = new_expiry
#         if new_pkg:
#             client.program_package_id = new_pkg
#         if new_trainer is not None:
#             client.trainer_id = new_trainer or None
#         client.personal_training = new_pt
#         client.payment_method = payment_method
#         client.save()
#         client.update_status()

#         # Write membership history
#         MembershipHistory.objects.create(
#             client=client,
#             gym=client.gym,
#             program_package=client.program_package,
#             trainer=client.trainer,
#             personal_training=client.personal_training,
#             join_date=client.join_date,
#             expiry_date=client.expiry_date,
#             amount_paid=amount_paid,
#             payment_method=payment_method,
#             action=action,
#             note=note,
#         )

#         # Also create a payment record if amount given
#         if amount_paid:
#             Payment.objects.create(
#                 client=client,
#                 gym=client.gym,
#                 amount=amount_paid,
#                 date=datetime.date.today(),
#                 method=payment_method,
#                 note=note or f'{"Renewal" if action == "renewal" else "Package upgrade"} payment',
#             )

#         return Response(ClientSerializer(client).data)


# # ── Payments ──────────────────────────────────────────────────────────────────

# class PaymentCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, client_pk):
#         try:
#             client = Client.objects.get(pk=client_pk, gym=request.user.gym)
#         except Client.DoesNotExist:
#             return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

#         serializer = PaymentSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(client=client, gym=request.user.gym)
#             return Response(ClientSerializer(client).data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

    Handles three scenarios depending on the `action` field in the request:
      'renewal'  — extend expiry date, keep same package
      'upgrade'  — change package (and optionally extend expiry)
      'addon'    — add a mid-cycle program (e.g. personal training) without
                   changing the base expiry; revenue counted in the current month

    Revenue attribution via recognized_month:
      renewal / upgrade → last month of the new period (expiry_date)
      addon             → today (current month)
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
        new_pt = request.data.get('personal_training', client.personal_training)
        amount_paid = request.data.get('amount_paid')
        payment_method = request.data.get('payment_method', client.payment_method)
        note = request.data.get('note', '')

        # Caller can explicitly pass action='addon' for mid-cycle add-ons
        requested_action = request.data.get('action', None)

        # Auto-detect action if not explicitly set
        if requested_action in ('renewal', 'upgrade', 'addon'):
            action = requested_action
        elif new_pkg and str(new_pkg) != str(client.program_package_id or ''):
            action = 'upgrade'
        else:
            action = 'renewal'

        # Revenue attribution
        today = datetime.date.today()
        if action == 'addon':
            # Add-on revenue counts in the month it was purchased
            recognized = today
        else:
            # Base package / renewal revenue counts in the last month of the period
            # Parse new_expiry to a date if given, else use existing expiry
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
        if new_trainer is not None:
            client.trainer_id = new_trainer or None
        client.personal_training = new_pt
        client.payment_method = payment_method
        client.save()
        client.update_status()

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

        # Create a Payment record if amount was given
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
            # Default recognized_month to the payment date if not provided
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