import pandas as pd

# Charger le fichier Excel
df = pd.read_excel("WQD.xlsx")  # Remplace par ton nom de fichier si différent

# Supprimer la dernière colonne (par position)
df = df.iloc[:, :-1]

# OU : Supprimer par nom si tu veux t'assurer que c'est bien "Water Quality"
# df = df.drop(columns=["Water Quality"], errors='ignore')

# Sauvegarder en JSON
df.to_json("data.json", orient="records", indent=4)

print("✅ Fichier JSON créé avec succès sans la dernière colonne.")
