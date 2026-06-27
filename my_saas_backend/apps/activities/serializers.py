# apps/activities/serializers.py

from rest_framework import serializers
from .models import Activity, Program, ProgramPackage


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            "id", "name", "duration", "gym_fee", "trainer_fee",
            "description", "icon", "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ProgramPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramPackage
        fields = ["id", "name", "duration_months", "price", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProgramSerializer(serializers.ModelSerializer):
    # Only return active packages so the frontend never shows deleted/inactive ones
    packages = serializers.SerializerMethodField()
    # Human-readable program_type label
    program_type_display = serializers.CharField(source='get_program_type_display', read_only=True)
    # Number of active clients currently enrolled in this program
    client_count = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            "id", "name", "description", "icon", "is_active",
            "program_type", "program_type_display",
            "packages", "client_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_packages(self, obj):
        active_pkgs = obj.packages.filter(is_active=True)
        return ProgramPackageSerializer(active_pkgs, many=True).data

    def get_client_count(self, obj):
        """
        Count distinct active clients whose current program_package
        belongs to this program.
        """
        from apps.clients.models import Client
        return Client.objects.filter(
            program_package__program=obj,
            status__in=['active', 'expiring'],
        ).distinct().count()