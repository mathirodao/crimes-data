import sys
import os

# Añade el directorio raíz del proyecto al PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app

app = create_app()