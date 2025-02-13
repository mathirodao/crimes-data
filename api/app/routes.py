from flask import Blueprint, jsonify, request, current_app
from .utils import serialize_mongo_cursor, is_valid_date, filter_crimes

api_bp = Blueprint("api", __name__)

@api_bp.route('/crimes_count', methods=['GET'])
def get_count_crimes():
    print('en crimes')
    collection = current_app.db["infoCrimes"]
    
    # Convertir la fecha a formato adecuado para usarla en el gráfico
    pipeline = [
        {
            "$group": {
                "_id": "$date",  # Agrupar por la fecha del crimen
                "crime_count": {"$sum": 1}  # Contar el número de crímenes por fecha
            }
        },
        {
            "$sort": {"_id": 1}  # Ordenar por fecha ascendente
        }
    ]
    
    crimes = list(collection.aggregate(pipeline))
    return jsonify(crimes)

@api_bp.route('/crimes', methods=['GET'])
def get_all_crimes():
    # Obtener parámetros de paginación (con valores predeterminados)
    page = int(request.args.get('page', 1))  # Página actual (por defecto: 1)
    limit = int(request.args.get('limit', 50))  # Elementos por página (por defecto: 50)

    collection = current_app.db["infoCrimes"]

    # Calcular el índice de inicio y fin para la paginación
    skip = (page - 1) * limit

    # Obtener los documentos paginados
    crimes = list(collection.find({}, {"_id": 0}).skip(skip).limit(limit))

    # Contar el total de documentos para calcular el número total de páginas
    total_count = collection.count_documents({})

    # Construir la respuesta
    response = {
        "data": crimes,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_count": total_count,
            "total_pages": (total_count + limit - 1) // limit  # Redondeo hacia arriba
        }
    }

    return jsonify(response)

@api_bp.route('/crimes/year/<int:year>', methods=['GET'])
def get_crimes_by_year(year):
    collection = current_app.db["infoCrimes"]
    crimes = list(collection.find({"date": {"$regex": f"{year}$"}}, {"_id": 0}))
    return jsonify(crimes)

@api_bp.route('/crimes/type/<string:crime_type>', methods=['GET'])
def get_crimes_by_type(crime_type):
    collection = current_app.db["infoCrimes"]
    crimes = list(collection.find({"crime_type": crime_type}, {"_id": 0}))
    return jsonify(crimes)

@api_bp.route('/crimes/count_by_type', methods=['GET'])
def get_crimes_count_by_type():
    collection = current_app.db["infoCrimes"]
    pipeline = [
        {"$group": {"_id": "$crime_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    crimes = list(collection.aggregate(pipeline))
    return jsonify([{ "crime_type": c["_id"], "count": c["count"] } for c in crimes])

@api_bp.route('/crimes/count_by_province', methods=['GET'])
def get_crimes_count_by_province():
    collection = current_app.db["infoCrimes"]
    pipeline = [
        {"$group": {"_id": "$province", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    provinces = list(collection.aggregate(pipeline))
    return jsonify([{ "province": p["_id"], "count": p["count"] } for p in provinces])

@api_bp.route('/crimes/age_distribution', methods=['GET'])
def get_age_distribution():
    collection = current_app.db["infoCrimes"]
    
    victim_pipeline = [
        {"$group": {"_id": "$victim_age", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    criminal_pipeline = [
        {"$group": {"_id": "$criminal_age", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]

    victim_ages = list(collection.aggregate(victim_pipeline))
    criminal_ages = list(collection.aggregate(criminal_pipeline))

    return jsonify([
        {"victim_age": [{ "age": v["_id"], "count": v["count"] } for v in victim_ages],
        "criminal_age": [{ "age": c["_id"], "count": c["count"] } for c in criminal_ages]}
    ])


