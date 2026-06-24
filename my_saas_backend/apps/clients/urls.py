from django.urls import path
from .views import (
    ClientListCreateView, ClientDetailView,
    PaymentCreateView, PackageListCreateView, PackageDetailView,
    ClientRenewView,
)

urlpatterns = [
    path('', ClientListCreateView.as_view(), name='client-list'),
    path('<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('<int:client_pk>/payments/', PaymentCreateView.as_view(), name='client-payment'),
    path('<int:client_pk>/renew/', ClientRenewView.as_view(), name='client-renew'),
    path('packages/', PackageListCreateView.as_view(), name='package-list'),
    path('packages/<int:pk>/', PackageDetailView.as_view(), name='package-detail'),
]
