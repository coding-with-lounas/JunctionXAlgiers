import os
import pickle
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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
