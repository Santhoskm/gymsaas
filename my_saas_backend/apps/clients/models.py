# apps/clients/models.py

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

    @property
    def is_pt_client(self):
        """
        True if client has personal_training flag OR their current program
        is of type 'personal_training'.
        """
        if self.personal_training:
            return True
        if (
            self.program_package
            and hasattr(self.program_package, 'program')
            and self.program_package.program.program_type == 'personal_training'
        ):
            return True
        return False


class MembershipHistory(models.Model):
    """
    Immutable audit log of every enrollment, renewal, package upgrade, or add-on.

    recognized_month:
        The month this payment should appear in revenue reports.
        - For new enrollment / renewal / upgrade: set to expiry_date (the LAST month
          of that subscription period).
        - For a mid-cycle add-on (e.g. personal training added in July):
          set to the date the add-on was purchased (current month).
        - Auto-set in save() if not explicitly provided.
    """
    ACTION_CHOICES = (
        ('new', 'New Enrollment'),
        ('renewal', 'Renewal'),
        ('upgrade', 'Package Upgrade'),
        ('addon', 'Add-on'),
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

    # Revenue attribution: which month should this payment count toward?
    # For base packages → expiry_date (last month of membership)
    # For add-ons       → purchase date (current month)
    recognized_month = models.DateField(
        null=True, blank=True,
        help_text=(
            "Month this payment is attributed to in revenue reports. "
            "Defaults to expiry_date for base packages, today for add-ons."
        )
    )

    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='new')
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'membership_history'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Auto-set recognized_month if not provided:
        # add-ons count in the month they were purchased;
        # base packages (new / renewal / upgrade) count in the month they expire.
        if self.recognized_month is None:
            if self.action == 'addon':
                self.recognized_month = datetime.date.today().replace(day=1)
            else:
                self.recognized_month = self.expiry_date
        super().save(*args, **kwargs)

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
    # Revenue attribution — same logic as MembershipHistory.recognized_month
    recognized_month = models.DateField(
        null=True, blank=True,
        help_text="Month this payment is attributed to in revenue reports."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-date']

    def save(self, *args, **kwargs):
        # Auto-set recognized_month to the payment date's month start if not given.
        # Views should always pass recognized_month explicitly; this is a safety fallback.
        if self.recognized_month is None:
            self.recognized_month = self.date if self.date else datetime.date.today()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.client.name} - ₹{self.amount} on {self.date}"