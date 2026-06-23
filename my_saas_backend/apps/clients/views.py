from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Client, Package, Payment
from .serializers import ClientSerializer, PackageSerializer, PaymentSerializer


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
        # Only this gym's clients - isolation guaranteed
        clients = Client.objects.filter(gym=request.user.gym).select_related('package', 'trainer')
        
        # Optional filters from query params
        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'all':
            clients = clients.filter(status=status_filter)

        search = request.query_params.get('search')
        if search:
            clients = clients.filter(name__icontains=search) | \
                      Client.objects.filter(gym=request.user.gym, phone__icontains=search) | \
                      Client.objects.filter(gym=request.user.gym, email__icontains=search)
            clients = clients.distinct()

        return Response(ClientSerializer(clients, many=True).data)

    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            # gym is always set from the logged-in user - cannot be spoofed
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
        serializer = ClientSerializer(obj, data=request.data, partial=True)
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


# ── Payments ──────────────────────────────────────────────────────────────────

class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, client_pk):
        # Verify client belongs to this gym
        try:
            client = Client.objects.get(pk=client_pk, gym=request.user.gym)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(client=client, gym=request.user.gym)
            # Return updated client with all payments
            return Response(ClientSerializer(client).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)