from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import LoginSerializer, UserSerializer, GymSerializer
from .models import Gym

class LoginView(APIView):
    """
    Unified login for all users (superadmin and gym users)
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            # Get gym info if user belongs to a gym
            gym = user.gym if user.gym else None
            
            response_data = {
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
            
            # Add gym data if user has a gym
            if gym:
                response_data['gym'] = GymSerializer(gym).data
            
            return Response(response_data)
        
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    """
    Logout by blacklisting refresh token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    """
    Get current logged in user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        gym = user.gym if user.gym else None
        
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'gym': GymSerializer(gym).data if gym else None
        })