from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from config import Config

client = None

def init_db(app):
    global client
    mongo_uri = app.config.get("MONGO_URI", Config.MONGO_URI)
    client = MongoClient(mongo_uri)
    app.db = client["crimes"]  
    print('Conexión exitosa a MongoDB')
