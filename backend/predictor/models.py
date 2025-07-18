from django.db import models

# Utilisateur    
class User(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    role = models.CharField(max_length=50)  # exemple: "admin", "technicien", etc.
    work_type = models.CharField(max_length=50)  # Exemple: "Technicien", "Éleveur", "Administrateur"

    def __str__(self):
        return self.full_name


# Données du bassin
class BassinData(models.Model):
    bassin_id = models.CharField(max_length=100, default="BASSIN_DEFAULT")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bassins')
 
   
class BassinDataLog(models.Model):
    bassin = models.ForeignKey(BassinData, on_delete=models.CASCADE, related_name="logs")
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField()
    ph = models.FloatField()
    dissolved_oxygen = models.FloatField()
    water_level = models.FloatField()
    ammonia = models.FloatField()
    nitrite = models.FloatField()
    nitrate = models.FloatField()
    turbidity = models.FloatField()

    def __str__(self):
        return f"Log for Bassin {self.bassin.id} at {self.timestamp}"


# Historique des alertes
class AlertHistory(models.Model):
    bassin_data = models.ForeignKey(BassinData, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=100)  # ex: "high_ammonia", "low_ph"
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# Notification
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
