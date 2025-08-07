import pytest
from flask import current_app
from pymongo import MongoClient
from app import create_app
from config import Config


@pytest.fixture
def client():
    """Fixture para configurar la aplicación Flask en modo de pruebas."""
    app = create_app()
    app.config["TESTING"] = True
    app.config["MONGO_URI"] =  app.config.get("MONGO_URI", Config.MONGO_URI)

    # config MongoDB
    mongo_client = MongoClient(app.config["MONGO_URI"])
    app.db = mongo_client.get_default_database()  


    with app.test_client() as client:
        with app.app_context():
            current_app.db["infoCrimes"].delete_many({})
        yield client

    # delete db
    mongo_client.drop_database("test_db")


def test_get_all_crimes(client):
    """Test para obtener todos los crímenes."""
    crimes_data = [
        {"crime_type": "theft", "date": "2023-01-01"},
        {"crime_type": "fraud", "date": "2023-01-02"}
    ]
    current_app.db["infoCrimes"].insert_many(crimes_data)

    # GET
    response = client.get("/api/crimes")
    assert response.status_code == 200
    assert response.json == crimes_data


def test_get_crimes_by_year(client):
    """Test para obtener crímenes por año."""
    # Insert data 
    crimes_data = [
        {"crime_type": "theft", "date": "2023-01-01"},
        {"crime_type": "fraud", "date": "2022-12-31"}
    ]
    current_app.db["infoCrimes"].insert_many(crimes_data)

    # GET
    response = client.get("/api/crimes/year/2023")
    assert response.status_code == 200
    assert response.json == [{"crime_type": "theft", "date": "2023-01-01"}]


def test_get_crimes_by_type(client):
    """Test para obtener crímenes por tipo."""
    # Insert data 
    crimes_data = [
        {"crime_type": "theft", "date": "2023-01-01"},
        {"crime_type": "fraud", "date": "2022-12-31"}
    ]
    current_app.db["infoCrimes"].insert_many(crimes_data)

    response = client.get("/api/crimes/type/theft")
    assert response.status_code == 200
    assert response.json == [{"crime_type": "theft", "date": "2023-01-01"}]
