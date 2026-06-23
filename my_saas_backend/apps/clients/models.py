from django.db import models
from apps.accounts.models import Gym


class Package(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='packages')
    name = models.CharField(max_length=100)
    duration_months = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'packages'
        app_label = 'clients'

    def __str__(self):
        return f"{self.name} - {self.gym.name}"


class Client(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expiring', 'Expiring'),
        ('expired', 'Expired'),
        ('inactive', 'Inactive'),
    )

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True)
    join_date = models.DateField()
    expiry_date = models.DateField()
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True, related_name='clients')
    trainer = models.ForeignKey(
        'trainers.Trainer', on_delete=models.SET_NULL, null=True, blank=True, related_name='clients'
    )
    personal_training = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='client_photos/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        app_label = 'clients'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.gym.name}"

    def update_status(self):
        from datetime import date
        today = date.today()
        delta = (self.expiry_date - today).days
        if delta < 0:
            self.status = 'expired'
        elif delta <= 7:
            self.status = 'expiring'
        else:
            self.status = 'active'
        self.save(update_fields=['status'])


class Payment(models.Model):
    METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
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
        app_label = 'clients'
        ordering = ['-date']

    def __str__(self):
        return f"{self.client.name} - ₹{self.amount} on {self.date}"