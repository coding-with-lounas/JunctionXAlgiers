import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle

# 1. Charger ton DataFrame
# WQD = pd.read_csv('ton_fichier.csv')  # Si tu charges depuis CSV
# Si déjà en mémoire : pas besoin de le recharger
test_df = pd.read_excel('WQD.xlsx')
# 2. Séparer features et target
X = test_df.drop('Water Quality', axis=1)  # Remplace 'quality' par le nom de ta colonne cible
y = test_df['Water Quality']

# 3. Scaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 4. Split des données
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 5. Entraînement du modèle
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 6. Sauvegarder le modèle
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

# 7. Sauvegarder le scaler
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("✅ Modèle et scaler enregistrés avec succès !")
