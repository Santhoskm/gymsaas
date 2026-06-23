from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'name', 'duration', 'gym_fee', 'trainer_fee',
            'description', 'icon', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']