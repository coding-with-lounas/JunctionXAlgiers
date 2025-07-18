# Lire le contenu du fichier
with open('output.json', 'r') as file:
    lines = file.readlines()

# Fusionner les lignes en une seule chaîne
raw_data = ''.join(lines)

# Séparer chaque objet JSON (en se basant sur les accolades fermantes)
raw_objects = raw_data.split('}\n')

# Nettoyer et ajouter les virgules
formatted_objects = []
for obj in raw_objects:
    obj = obj.strip()
    if obj:
        if not obj.endswith('}'):
            obj += '}'
        formatted_objects.append(obj)

# Ajouter les virgules sauf pour le dernier
json_array = '[\n' + ',\n'.join(formatted_objects) + '\n]'

# Écrire dans un nouveau fichier JSON valide
with open('data_formatted.json', 'w') as f:
    f.write(json_array)

print("✅ Fichier JSON bien formaté enregistré dans 'data_formatted.json'")
