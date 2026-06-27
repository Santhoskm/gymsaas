# apps/expenses/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(gym=request.user.gym).select_related('trainer')

        # Optional month filter e.g. ?month=2025-06
        month = request.query_params.get('month')
        if month:
            expenses = expenses.filter(date__startswith=month)

        # Optional type filter e.g. ?type=trainer_salary
        expense_type = request.query_params.get('type')
        if expense_type:
            expenses = expenses.filter(type=expense_type)

        serialized = ExpenseSerializer(expenses, many=True).data

        # Return monthly total alongside the list so frontend can show it directly
        total = expenses.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'expenses': serialized,
            'total': float(total),
        })

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gym=request.user.gym)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, gym):
        try:
            return Expense.objects.get(pk=pk, gym=gym)
        except Expense.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExpenseSerializer(obj).data)

    def put(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(obj, data=request.data, partial=True)
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