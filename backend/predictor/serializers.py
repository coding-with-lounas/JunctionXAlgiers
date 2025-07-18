from rest_framework import serializers
from .models import User, BassinData, AlertHistory, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class BassinDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = BassinData
        fields = '__all__'

class AlertHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertHistory
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
