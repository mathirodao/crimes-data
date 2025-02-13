from pymongo import MongoClient
import json
import os


MONGO_URI = os.getenv("MONGO_URI")
DB = os.getenv("DB")
COLLECTION = os.getenv("COLLECTION")
uri = MONGO_URI

# Conecta a MongoDB
client = MongoClient(uri)
db = client[DB]  
collection = db[COLLECTION]  

# Leer los datos desde el archivo JSON
with open('uruguay_crime_data.json') as file:
    data = json.load(file)  # Carga el JSON como una lista de objetos

# Insertar los documentos en la colección
result = collection.insert_many(data)

collection.create_index([("date", 1), ("crime_type", 1)])
collection.create_index([("province", 1), ("crime_type", 1)])
collection.create_index([("crime_type", 1)])
collection.create_index([("victim_sex", 1), ("victim_age", 1)])
collection.create_index([("criminal_sex", 1), ("criminal_age", 1)])
collection.create_index([("province", 1)])

collection.create_index([("geometry", "2dsphere")])

# Confirmar los documentos insertados
print(f"Documentos insertados: {len(result.inserted_ids)}")

# collection.drop_indexes()
indexes = collection.list_indexes()

# Mostrar los índices en un print
for index in indexes:
    print(index)

# # Elimina todos los documentos de la colección
# result = collection.delete_many({})
# print(f"Se eliminaron {result.deleted_count} documentos de la colección.")

# Cuenta los documentos en la colección
document_count = collection.count_documents({})
print(f"La colección tiene {document_count} documentos.")
