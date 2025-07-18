from django.urls import path,include
from .views import PredictView, get_data

from rest_framework.routers import DefaultRouter
from .views import UserViewSet, BassinDataViewSet, AlertHistoryViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'bassins', BassinDataViewSet)
router.register(r'alerts', AlertHistoryViewSet)
router.register(r'notifications', NotificationViewSet)


urlpatterns = [
    path('predict/', PredictView.as_view(), name='predict'),
    path('data/', get_data, name='get_data'),
    path('', include(router.urls)),
]
