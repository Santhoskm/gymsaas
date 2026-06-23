from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import LoginView, LogoutView, CurrentUserView

urlpatterns = [
    # Simple login endpoint
    path('login/', LoginView.as_view(), name='login'),
    
    # Alternative: if you want root level login
    # path('', LoginView.as_view(), name='login'),
    
    # Other endpoints
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]