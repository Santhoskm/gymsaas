# # apps/activities/urls.py
# from django.urls import path
# from .views import ActivityListCreateView, ActivityDetailView

# urlpatterns = [
#     path('', ActivityListCreateView.as_view(), name='activity-list'),
#     path('<int:pk>/', ActivityDetailView.as_view(), name='activity-detail'),
# ]

from django.urls import path
from .views import (
    ActivityListCreateView, ActivityDetailView,
    ProgramListCreateView, ProgramDetailView,
    ProgramPackageListCreateView, ProgramPackageDetailView,
)

urlpatterns = [
    # Activities (existing)
    path('', ActivityListCreateView.as_view(), name='activity-list'),
    path('<int:pk>/', ActivityDetailView.as_view(), name='activity-detail'),

    # Programs
    path('programs/', ProgramListCreateView.as_view(), name='program-list'),
    path('programs/<int:pk>/', ProgramDetailView.as_view(), name='program-detail'),

    # Program Packages
    path('programs/<int:program_pk>/packages/', ProgramPackageListCreateView.as_view(), name='program-package-list'),
    path('programs/<int:program_pk>/packages/<int:pk>/', ProgramPackageDetailView.as_view(), name='program-package-detail'),
]