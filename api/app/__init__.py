from flask import Flask
from dotenv import load_dotenv
import os
from .database import init_db
from flask_cors import CORS 

def create_app():
    app = Flask(__name__)

    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

    app.config.from_object('config.Config')  

    init_db(app)
    CORS(app)

    with app.app_context():
        from .routes import api_bp
        app.register_blueprint(api_bp, url_prefix="/api")

    return app
