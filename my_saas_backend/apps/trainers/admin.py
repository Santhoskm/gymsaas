from django.contrib import admin
from .models import Trainer

@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['name', 'gym', 'phone', 'specialty', 'status', 'joined']
    list_filter = ['status', 'gym']
    search_fields = ['name', 'phone', 'email']