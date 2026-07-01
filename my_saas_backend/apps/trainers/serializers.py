from rest_framework import serializers
from .models import Trainer

class TrainerSerializer(serializers.ModelSerializer):
    client_count = serializers.IntegerField(read_only=True)
    pt_client_count = serializers.SerializerMethodField()

    def get_pt_client_count(self, obj):
        return obj.clients.filter(status='active', personal_training=True).count()

    class Meta:
        model = Trainer
        fields = [
            'id', 'name', 'phone', 'email', 'specialty',
            'salary', 'joined', 'photo', 'status',
            'offers_personal_training',   # ← NEW
            'client_count', 'pt_client_count', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'joined': {'required': False},
            'phone': {'required': False},
        }