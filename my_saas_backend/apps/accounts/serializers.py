from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Gym

class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gym
        fields = ['id', 'name', 'subdomain', 'email', 'phone', 'address', 'city', 'state', 'logo']

class UserSerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    gym_subdomain = serializers.CharField(source='gym.subdomain', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'role', 'gym', 'gym_name', 'gym_subdomain', 'is_active']
        read_only_fields = ['id']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        request = self.context.get('request')
        
        if not username or not password:
            raise serializers.ValidationError('Username and password required')
        
        # Authenticate user
        user = authenticate(request=request, username=username, password=password)
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled')
        
        # No gym validation needed - users can login from anywhere
        attrs['user'] = user
        return attrs