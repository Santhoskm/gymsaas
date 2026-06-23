from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'type', 'description', 'amount', 'date',
            'trainer', 'trainer_name', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']