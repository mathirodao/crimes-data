from bson import ObjectId
import re

def serialize_mongo_document(doc):
    """Convierte un documento MongoDB en un formato JSON compatible."""
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def serialize_mongo_cursor(cursor):
    """Convierte un cursor de MongoDB a una lista JSON serializable."""
    return [serialize_mongo_document(doc) for doc in cursor]

def is_valid_date(date_str):
    """Valida si una fecha tiene el formato MM/DD/YYYY."""
    pattern = r"^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\d{4}$"
    return bool(re.match(pattern, date_str))

def filter_crimes(collection, filters):
    """Filtra los crímenes según los filtros proporcionados."""
    query = {}
    if "year" in filters:
        query["date"] = {"$regex": f"^{filters['year']}"}
    if "crime_type" in filters:
        query["crime_type"] = filters["crime_type"]
    if "location" in filters:
        query["location"] = {"$regex": filters["location"], "$options": "i"}
    
    return list(collection.find(query, {"_id": 0}))
