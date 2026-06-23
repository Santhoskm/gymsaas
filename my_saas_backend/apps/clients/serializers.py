# from rest_framework import serializers
# from .models import Client, Package, Payment


# class PackageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Package
#         fields = ['id', 'name', 'duration_months', 'price', 'is_active']


# class PaymentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Payment
#         fields = ['id', 'amount', 'date', 'method', 'note', 'created_at']
#         read_only_fields = ['id', 'created_at']


# class ClientSerializer(serializers.ModelSerializer):
#     payments = PaymentSerializer(many=True, read_only=True)
#     package_name = serializers.CharField(source='package.name', read_only=True)
#     trainer_name = serializers.CharField(source='trainer.name', read_only=True)

#     class Meta:
#         model = Client
#         fields = [
#             'id', 'name', 'phone', 'email', 'address',
#             'join_date', 'expiry_date', 'status',
#             'package', 'package_name',
#             'trainer', 'trainer_name',
#             'personal_training', 'photo',
#             'payments', 'created_at',
#         ]
#         read_only_fields = ['id', 'status', 'created_at']

#     def create(self, validated_data):
#         # Auto-calculate status on creation
#         client = super().create(validated_data)
#         client.update_status()
#         return client

#     def update(self, instance, validated_data):
#         client = super().update(instance, validated_data)
#         client.update_status()
#         return client

from rest_framework import serializers
from .models import Client, Package, Payment


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'name', 'duration_months', 'price', 'is_active']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'date', 'method', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClientSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    trainer_offers_pt = serializers.BooleanField(
        source='trainer.offers_personal_training', read_only=True  # ← frontend uses this
    )
    program_package_name = serializers.CharField(
        source='program_package.name', read_only=True
    )
    program_name = serializers.CharField(
        source='program_package.program.name', read_only=True
    )

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'phone', 'email', 'address',
            'join_date', 'expiry_date', 'status',
            'package', 'package_name',
            'program_package', 'program_package_name', 'program_name',
            'trainer', 'trainer_name', 'trainer_offers_pt',
            'personal_training', 'photo',
            'payments', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']
        extra_kwargs = {
            'join_date': {'required': False},
            'expiry_date': {'required': False},
            'phone': {'required': False},
        }

    def create(self, validated_data):
        client = super().create(validated_data)
        client.update_status()
        return client

    def update(self, instance, validated_data):
        client = super().update(instance, validated_data)
        client.update_status()
        return client