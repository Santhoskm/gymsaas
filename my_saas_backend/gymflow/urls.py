"""
URL configuration for gymflow project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from apps.accounts.dashboard_view import DashboardView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/', include('apps.accounts.urls')),

    # Dashboard (live stats)
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),

    # Main app endpoints
    path('api/clients/', include('apps.clients.urls')),
    path('api/trainers/', include('apps.trainers.urls')),
    path('api/activities/', include('apps.activities.urls')),
    path('api/expenses/', include('apps.expenses.urls')),
]