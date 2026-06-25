# # apps/activities/models.py

# from django.db import models
# from apps.accounts.models import Gym


# class Activity(models.Model):
#     gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="activities")
#     name = models.CharField(max_length=150)
#     duration = models.CharField(max_length=50)
#     gym_fee = models.DecimalField(max_digits=10, decimal_places=2)
#     trainer_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     description = models.TextField(blank=True)
#     icon = models.CharField(max_length=10, blank=True)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         db_table = "activities"
#         ordering = ["-created_at"]

#     def __str__(self):
#         return f"{self.name} - {self.gym.name}"


# class Program(models.Model):
#     PROGRAM_TYPE_CHOICES = (
#         ("general", "General"),
#         ("personal_training", "Personal Training"),
#     )

#     gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="programs")
#     name = models.CharField(max_length=150)
#     description = models.TextField(blank=True)
#     icon = models.CharField(max_length=10, blank=True)
#     is_active = models.BooleanField(default=True)
#     # program_type lets the frontend know to show PT only when trainer offers_personal_training=True
#     program_type = models.CharField(
#         max_length=30,
#         choices=PROGRAM_TYPE_CHOICES,
#         default="general",
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "programs"
#         ordering = ["name"]

#     def __str__(self):
#         return f"{self.name} - {self.gym.name}"


# class ProgramPackage(models.Model):
#     program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="packages")
#     name = models.CharField(max_length=100)
#     duration_months = models.PositiveIntegerField()
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "program_packages"
#         ordering = ["duration_months"]

#     def __str__(self):
#         return f"{self.program.name} - {self.name} ₹{self.price}"
# apps/activities/models.py

from django.db import models
from apps.accounts.models import Gym


class Activity(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="activities")
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
        db_table = "activities"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.gym.name}"


class Program(models.Model):
    PROGRAM_TYPE_CHOICES = (
        # ── Legacy values kept so old rows don't break ──────────────────────
        ("general", "General"),
        ("personal_training", "Personal Training"),
        # ── New values matching the frontend PROGRAM_TYPES list ─────────────
        ("regular_membership", "Regular Membership"),
        ("offer", "Offer / Special"),
        ("other", "Other Activity"),
    )

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="programs")
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    program_type = models.CharField(
        max_length=30,
        choices=PROGRAM_TYPE_CHOICES,
        default="regular_membership",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "programs"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} - {self.gym.name}"


class ProgramPackage(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="packages")
    name = models.CharField(max_length=100)
    duration_months = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "program_packages"
        ordering = ["duration_months"]

    def __str__(self):
        return f"{self.program.name} - {self.name} ₹{self.price}"