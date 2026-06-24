# apps/accounts/signals.py
# Auto-creates a "Personal Training" Program + default packages when a new Gym is saved.

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Gym


@receiver(post_save, sender=Gym)
def create_default_pt_program(sender, instance, created, **kwargs):
    """
    When a gym is first created, seed it with a Personal Training program
    and two default ProgramPackages (Monthly / Quarterly).
    Uses get_or_create so re-running migrations or duplicate saves are safe.
    """
    if not created:
        return

    # Import here to avoid circular imports at module load time
    from apps.activities.models import Program, ProgramPackage

    pt_program, _ = Program.objects.get_or_create(
        gym=instance,
        name="Personal Training",
        defaults={
            "description": "One-on-one personal training sessions with a certified trainer.",
            "icon": "🏋️",
            "is_active": True,
            "program_type": "personal_training",
        },
    )

    default_packages = [
        {"name": "Monthly PT", "duration_months": 1, "price": 4500},
        {"name": "Quarterly PT", "duration_months": 3, "price": 12000},
    ]
    for pkg in default_packages:
        ProgramPackage.objects.get_or_create(
            program=pt_program,
            name=pkg["name"],
            defaults={
                "duration_months": pkg["duration_months"],
                "price": pkg["price"],
                "is_active": True,
            },
        )
