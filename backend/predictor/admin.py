from django.contrib import admin
from .models import User, BassinData, AlertHistory, Notification

admin.site.register(User)
admin.site.register(BassinData)
admin.site.register(AlertHistory)
admin.site.register(Notification)
