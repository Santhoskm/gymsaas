# from django.db import models
# from apps.accounts.models import Gym


# class Activity(models.Model):
#     gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='activities')
#     name = models.CharField(max_length=150)
#     duration = models.CharField(max_length=50)   # e.g. "3 months", "6 weeks"
#     gym_fee = models.DecimalField(max_digits=10, decimal_places=2)
#     trainer_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     description = models.TextField(blank=True)
#     icon = models.CharField(max_length=10, blank=True)  # emoji icon
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         db_table = 'activities'
#         app_label = 'activities'
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.name} - {self.gym.name}"

from django.db import models
from apps.accounts.models import Gym


class Activity(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=150)
    duration = models.CharField(max_length=50)
    gym_fee = models.DecimalField(max_digits=10, decimal_places=2)
    trainer_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'activities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.gym.name}"


class Program(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=150)        # e.g. Yoga, CrossFit, Zumba
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'programs'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.gym.name}"


class ProgramPackage(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='packages')
    name = models.CharField(max_length=100)        # e.g. Monthly, Quarterly
    duration_months = models.PositiveIntegerField() # 1, 3, 6, 12
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'program_packages'
        ordering = ['duration_months']

    def __str__(self):
        return f"{self.program.name} - {self.name} ₹{self.price}"