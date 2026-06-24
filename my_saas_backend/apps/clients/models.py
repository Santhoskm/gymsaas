from django.db import models
from apps.accounts.models import Gym
import datetime


class Package(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='packages')
    name = models.CharField(max_length=100)
    duration_months = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'packages'

    def __str__(self):
        return f"{self.name} - {self.gym.name}"


class Client(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expiring', 'Expiring'),
        ('expired', 'Expired'),
        ('inactive', 'Inactive'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('upi', 'UPI'),
    )

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True)
    join_date = models.DateField(default=datetime.date.today)
    expiry_date = models.DateField(default=datetime.date.today)
    package = models.ForeignKey(
        Package, on_delete=models.SET_NULL, null=True, blank=True, related_name='clients'
    )
    program_package = models.ForeignKey(
        'activities.ProgramPackage', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='clients'
    )
    trainer = models.ForeignKey(
        'trainers.Trainer', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='clients'
    )
    personal_training = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    photo = models.ImageField(upload_to='client_photos/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.gym.name}"

    def update_status(self):
        today = datetime.date.today()
        delta = (self.expiry_date - today).days
        if delta < 0:
            self.status = 'expired'
        elif delta <= 7:
            self.status = 'expiring'
        else:
            self.status = 'active'
        self.save(update_fields=['status'])


class MembershipHistory(models.Model):
    """
    Immutable audit log of every enrollment, renewal, or package upgrade.
    Client table always holds the *current* active membership.
    """
    ACTION_CHOICES = (
        ('new', 'New Enrollment'),
        ('renewal', 'Renewal'),
        ('upgrade', 'Package Upgrade'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('upi', 'UPI'),
    )

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='membership_history')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='membership_history')
    program_package = models.ForeignKey(
        'activities.ProgramPackage', on_delete=models.SET_NULL, null=True, blank=True
    )
    trainer = models.ForeignKey(
        'trainers.Trainer', on_delete=models.SET_NULL, null=True, blank=True
    )
    personal_training = models.BooleanField(default=False)
    join_date = models.DateField()
    expiry_date = models.DateField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='new')
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'membership_history'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.client.name} — {self.get_action_display()} on {self.created_at.date()}"


class Payment(models.Model):
    METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('upi', 'UPI'),
    )

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-date']

    def __str__(self):
        return f"{self.client.name} - ₹{self.amount} on {self.date}"
