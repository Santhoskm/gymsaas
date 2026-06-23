from rest_framework import serializers
from .models import Trainer

class TrainerSerializer(serializers.ModelSerializer):
    client_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Trainer
        fields = [
            'id', 'name', 'phone', 'email', 'specialty',
            'salary', 'joined', 'photo', 'status',
            'offers_personal_training',   # ← NEW
            'client_count', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'joined': {'required': False},
            'phone': {'required': False},
        }