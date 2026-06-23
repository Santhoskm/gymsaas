from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Gym

@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ['name', 'subdomain', 'city', 'is_active']
    list_filter = ['is_active', 'city']
    search_fields = ['name', 'subdomain']

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'gym', 'is_active']
    list_filter = ['role', 'is_active', 'gym']
    search_fields = ['username', 'email', 'phone']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Gym Info', {'fields': ('role', 'gym', 'phone')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Gym Info', {'fields': ('role', 'gym', 'phone')}),
    )