import json
import os
import random
import pickle
from django.http import JsonResponse
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.db.models import Count
from .models import BassinData





# Get current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths for model and scaler
model_path = os.path.join(BASE_DIR, 'model.pkl')
scaler_path = os.path.join(BASE_DIR, 'scaler.pkl')

# Load model and scaler only once
with open(model_path, 'rb') as f:
    model = pickle.load(f)

with open(scaler_path, 'rb') as f:
    scaler = pickle.load(f)

class PredictView(APIView):
    def post(self, request):
        try:
            # Extract features from POST request data
            # features = ['temp', 'ph', 'do', 'nh4', 'no3', 'po4']  # Example keys
            features = ['Temp', 'Turbidity (cm)', 'DO(mg/L)', 'BOD (mg/L)', 'CO2', 'pH`', 'Alkalinity (mg L-1 )', 'Hardness (mg L-1 )', 'Calcium (mg L-1 )', 'Ammonia (mg L-1 )', 'Nitrite (mg L-1 )', 'Phosphorus (mg L-1 )', 'H2S (mg L-1 )', 'Plankton (No. L-1)']

            
            input_data = [float(request.data.get(feat, 0)) for feat in features]

            # Scale and predict
            input_array = np.array(input_data).reshape(1, -1)
            scaled_input = scaler.transform(input_array)
            prediction = model.predict(scaled_input)

            return Response({"prediction": prediction[0]}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


def get_data(request):
    file_path = os.path.join(settings.BASE_DIR, 'predictor', 'data.json')
    with open(file_path, 'r') as f:
        data = json.load(f)
    return JsonResponse(data, safe=False)


# Load JSON file once when server starts (for performance)
with open(os.path.join(settings.BASE_DIR, 'predictor', 'data.json')) as f:
    SENSOR_DATA = json.load(f)

def count_bassins_by_id():
    counts = BassinData.objects.values('bassin_id').annotate(total=Count('id'))
    return counts
def get_random_sensor_data(request):
    # Pick one random object
    random_entry = random.choice(SENSOR_DATA)
    return JsonResponse(random_entry)


from rest_framework import viewsets
from .models import User, BassinData, AlertHistory, Notification
from .serializers import UserSerializer, BassinDataSerializer, AlertHistorySerializer, NotificationSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class BassinDataViewSet(viewsets.ModelViewSet):
    queryset = BassinData.objects.all()
    serializer_class = BassinDataSerializer

class AlertHistoryViewSet(viewsets.ModelViewSet):
    queryset = AlertHistory.objects.all()
    serializer_class = AlertHistorySerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


