from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os


MONGO_URI = os.getenv("MONGO_URI")
uri = MONGO_URI

client = MongoClient(uri, server_api=ServerApi('1'))

# Prueba la conexión con un comando 'ping'
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print("Error connecting to MongoDB:", e)