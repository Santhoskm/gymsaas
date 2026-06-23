from django.db import models
from apps.accounts.models import Gym
import datetime

class Trainer(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='trainers')
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    specialty = models.CharField(max_length=100, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    joined = models.DateField(default=datetime.date.today)
    photo = models.ImageField(upload_to='trainer_photos/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    offers_personal_training = models.BooleanField(default=False)  # ← NEW
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trainers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.gym.name}"

    @property
    def client_count(self):
        return self.clients.filter(status='active').count()