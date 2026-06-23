from django.urls import path
from .views import TrainerListCreateView, TrainerDetailView

urlpatterns = [
    path('', TrainerListCreateView.as_view(), name='trainer-list'),
    path('<int:pk>/', TrainerDetailView.as_view(), name='trainer-detail'),
]