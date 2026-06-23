from django.db import models
from apps.accounts.models import Gym


class Expense(models.Model):
    TYPE_CHOICES = (
        ('trainer_salary', 'Trainer Salary'),
        ('equipment', 'Equipment'),
        ('utilities', 'Utilities'),
        ('maintenance', 'Maintenance'),
        ('marketing', 'Marketing'),
        ('supplies', 'Supplies'),
        ('rent', 'Rent'),
        ('other', 'Other'),
    )

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='expenses')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    # Optional: link to trainer if this is a salary expense
    trainer = models.ForeignKey(
        'trainers.Trainer', on_delete=models.SET_NULL, null=True, blank=True, related_name='salary_expenses'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expenses'
        app_label = 'expenses'
        ordering = ['-date']

    def __str__(self):
        return f"{self.type} - ₹{self.amount} ({self.gym.name})"