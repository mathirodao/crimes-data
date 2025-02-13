import json
import random
from faker import Faker
from datetime import date

fake = Faker()

# Provinces in Uruguay and their approximate bounding boxes for generating coordinates
provinces = {
    "Artigas": [-56.744, -58.442, -30.190, -31.581],
    "Canelones": [-55.964, -56.679, -34.362, -34.906],
    "Canelones": [-55.964, -56.679, -34.362, -34.906],
    "Canelones": [-55.964, -56.679, -34.362, -34.906],
    "Cerro Largo": [-53.884, -55.017, -31.775, -33.634],
    "Colonia": [-57.361, -58.450, -33.880, -34.500],
    "Durazno": [-55.023, -56.658, -32.838, -34.050],
    "Flores": [-56.276, -57.105, -33.472, -33.990],
    "Florida": [-55.482, -56.680, -33.215, -34.312],
    "Lavalleja": [-54.922, -55.761, -33.799, -34.675],
    "Maldonado": [-54.546, -55.378, -34.473, -34.950],
    "Montevideo": [-56.016, -56.250, -34.785, -34.920],
    "Montevideo": [-56.016, -56.250, -34.785, -34.920],
    "Montevideo": [-56.016, -56.250, -34.785, -34.920],
    "Montevideo": [-56.016, -56.250, -34.785, -34.920],
    "Montevideo": [-56.016, -56.250, -34.785, -34.920],
    "Montevideo": [-56.016, -56.250, -34.785, -34.920],
    "Montevideo": [-56.016, -56.250, -34.785, -34.920],
    "Paysandú": [-56.142, -57.945, -31.958, -33.000],
    "Río Negro": [-57.132, -58.187, -32.856, -34.013],
    "Rivera": [-55.100, -56.320, -30.905, -31.984],
    "Rivera": [-55.100, -56.320, -30.905, -31.984],
    "Rocha": [-53.460, -54.588, -33.767, -34.920],
    "Salto": [-56.046, -58.446, -30.716, -31.999],
    "San José": [-56.238, -57.038, -33.882, -34.671],
    "Soriano": [-56.591, -57.933, -33.057, -34.295],
    "Tacuarembó": [-54.978, -56.597, -30.983, -32.946],
    "Treinta y Tres": [-54.071, -55.138, -32.830, -34.075]
}

# Crime types
crime_types = ["Vandalism", "Theft", "Assault", "Robbery", "Drug Trafficking", "Fraud", "Homicide", "Burglary"]

# Generate random coordinates within a bounding box
def random_coordinates(bbox):
    min_lng, max_lng, min_lat, max_lat = bbox
    lng = random.uniform(min_lng, max_lng)
    lat = random.uniform(min_lat, max_lat)
    return [lng, lat]

# Generate a random date between 2023 and 2024
def random_date():
    start_date = date(2023, 1, 1)  # Define start date as a date object
    end_date = date(2024, 12, 31)  # Define end date as a date object
    random_date = fake.date_between(start_date=start_date, end_date=end_date)
    return random_date.strftime("%d/%m/%Y")

# Generate random crime data
def generate_crime_data(num_crimes):
    crimes = []
    for _ in range(num_crimes):
        province = random.choice(list(provinces.keys()))
        coordinates = random_coordinates(provinces[province])
        crimes.append({
            "crime_type": random.choice(crime_types),
            "date": random_date(),
            "incident_time": fake.time(pattern="%H:%M"),
            "reported_by": fake.name(),
            "victim_age": random.randint(10, 90),
            "victim_sex": random.choice(["M", "F"]),
            "vict_nationality": "UY" if random.random() < 0.79 else fake.country_code(),
            "victim_injury": random.choice([True, False]),
            "victim_occupation": fake.job(),
            "criminal_sex": random.choice(["M", "F"]),
            "criminal_age": random.randint(14, 80),
            "weapon_used": random.choice([True, False]),
            "damage_cost": round(random.uniform(100, 10000), 2),
            "arrest_made": random.choice([True, False]),
            "suspect_count": random.randint(1, 5),
            "suspect_sex": random.choice(["M", "F"]),
            "suspect_description": fake.sentence(),
            "evidence_found": random.choice([True, False]),
            "evidence_description": fake.sentence(),
            "province": province,
            "geometry": {
                "type": "Point",
                "coordinates": coordinates
            }
        })
    return crimes

# Generate 40,000+ crimes
crimes = generate_crime_data(70000)

# Write to a JSON file
with open('uruguay_crime_data.json', 'w') as f:
    json.dump(crimes, f, indent=2)

print("JSON file generated successfully!")
