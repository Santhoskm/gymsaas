from django.db import models
from django.contrib.auth.models import AbstractUser

class Gym(models.Model):
    """Gym model - each gym has its own subdomain"""
    name = models.CharField(max_length=100)
    subdomain = models.CharField(max_length=50, unique=True)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    pincode = models.CharField(max_length=10)
    logo = models.ImageField(upload_to='gym_logos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'gyms'
        app_label = 'accounts'  # Add this
    
    def __str__(self):
        return f"{self.name} ({self.subdomain})"

class User(AbstractUser):
    ROLE_CHOICES = (
        ('superadmin', 'Super Admin'),
        ('gym_owner', 'Gym Owner'),
        ('manager', 'Manager'),
        ('receptionist', 'Receptionist'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='receptionist')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users'
        app_label = 'accounts'  # Add this
    
    def __str__(self):
        gym_name = f" - {self.gym.name}" if self.gym else ""
        return f"{self.username} ({self.get_role_display()}){gym_name}"