# # apps/activities/serializers.py

# from rest_framework import serializers
# from .models import Activity, Program, ProgramPackage


# class ActivitySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Activity
#         fields = [
#             "id", "name", "duration", "gym_fee", "trainer_fee",
#             "description", "icon", "is_active", "created_at",
#         ]
#         read_only_fields = ["id", "created_at"]


# class ProgramPackageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProgramPackage
#         fields = ["id", "name", "duration_months", "price", "is_active", "created_at"]
#         read_only_fields = ["id", "created_at"]


# class ProgramSerializer(serializers.ModelSerializer):
#     packages = ProgramPackageSerializer(many=True, read_only=True)

#     class Meta:
#         model = Program
#         fields = [
#             "id", "name", "description", "icon", "is_active",
#             "program_type",   # ← frontend uses this to guard PT visibility
#             "packages", "created_at",
#         ]
#         read_only_fields = ["id", "created_at"]

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

    class Meta:
        model = Program
        fields = [
            "id", "name", "description", "icon", "is_active",
            "program_type",
            "packages", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_packages(self, obj):
        active_pkgs = obj.packages.filter(is_active=True)
        return ProgramPackageSerializer(active_pkgs, many=True).data