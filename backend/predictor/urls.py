from django.urls import path
from .views import PredictView, get_data

urlpatterns = [
    path('predict/', PredictView.as_view(), name='predict'),
    path('data/', get_data, name='get_data'),
]
