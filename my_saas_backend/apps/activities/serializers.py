from rest_framework import serializers
from .models import Activity, Program, ProgramPackage


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'name', 'duration', 'gym_fee', 'trainer_fee',
            'description', 'icon', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProgramPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramPackage
        fields = ['id', 'name', 'duration_months', 'price', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProgramSerializer(serializers.ModelSerializer):
    packages = ProgramPackageSerializer(many=True, read_only=True)
    program_type_display = serializers.CharField(source='get_program_type_display', read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'program_type', 'program_type_display',
            'description', 'icon', 'is_active', 'packages', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']