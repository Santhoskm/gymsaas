from rest_framework import serializers
from .models import Client, Package, Payment, MembershipHistory


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'name', 'duration_months', 'price', 'is_active']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'date', 'method', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']


class MembershipHistorySerializer(serializers.ModelSerializer):
    program_package_name = serializers.CharField(source='program_package.name', read_only=True)
    program_name = serializers.CharField(source='program_package.program.name', read_only=True)
    package_duration = serializers.IntegerField(source='program_package.duration_months', read_only=True)
    package_price = serializers.DecimalField(
        source='program_package.price', max_digits=10, decimal_places=2, read_only=True
    )
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = MembershipHistory
        fields = [
            'id', 'action', 'action_display', 'note',
            'program_package', 'program_package_name', 'program_name',
            'package_duration', 'package_price',
            'trainer', 'trainer_name',
            'personal_training',
            'join_date', 'expiry_date',
            'amount_paid', 'payment_method',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ClientSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    membership_history = MembershipHistorySerializer(many=True, read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    trainer_offers_pt = serializers.BooleanField(
        source='trainer.offers_personal_training', read_only=True
    )
    program_package_name = serializers.CharField(source='program_package.name', read_only=True)
    program_name = serializers.CharField(source='program_package.program.name', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'phone', 'email', 'address',
            'join_date', 'expiry_date', 'status',
            'package', 'package_name',
            'program_package', 'program_package_name', 'program_name',
            'trainer', 'trainer_name', 'trainer_offers_pt',
            'personal_training',
            'payment_method', 'payment_method_display',
            'photo',
            'payments', 'membership_history', 'created_at',
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
        # Write first history entry
        MembershipHistory.objects.create(
            client=client,
            gym=client.gym,
            program_package=client.program_package,
            trainer=client.trainer,
            personal_training=client.personal_training,
            join_date=client.join_date,
            expiry_date=client.expiry_date,
            payment_method=client.payment_method,
            action='new',
            note='Initial enrollment',
        )
        return client

    def update(self, instance, validated_data):
        # Detect if program_package or expiry_date has changed — if so, write history
        old_pkg = instance.program_package_id
        old_expiry = instance.expiry_date
        action = validated_data.pop('_history_action', None)
        amount_paid = validated_data.pop('_amount_paid', None)
        history_note = validated_data.pop('_history_note', '')

        client = super().update(instance, validated_data)
        client.update_status()

        new_pkg = client.program_package_id
        new_expiry = client.expiry_date

        # Write history if package or expiry changed
        pkg_changed = old_pkg != new_pkg
        expiry_changed = old_expiry != new_expiry

        if action or pkg_changed or expiry_changed:
            resolved_action = action or ('upgrade' if pkg_changed else 'renewal')
            MembershipHistory.objects.create(
                client=client,
                gym=client.gym,
                program_package=client.program_package,
                trainer=client.trainer,
                personal_training=client.personal_training,
                join_date=client.join_date,
                expiry_date=client.expiry_date,
                payment_method=client.payment_method,
                amount_paid=amount_paid,
                action=resolved_action,
                note=history_note,
            )
        return client
