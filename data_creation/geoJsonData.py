import geopandas as gpd

# Ruta a la carpeta donde están los archivos .shp, .shx y .dbf
archivo_shp = "C:/Users/Usuario/Desktop/crime/crimes_uruguay/src/assets/departamentos/c004Polygon.shp"  # Cambia a la ruta de tu archivo .shp

# Leer el archivo Shapefile usando GeoPandas
gdf = gpd.read_file(archivo_shp)

# Si quieres mostrar los primeros 5 registros
print(gdf.head())

# Filtrar el DataFrame por el nombre del departamento, si lo necesitas
# uruguay = gdf[gdf['nombre'] == 'Montevideo']

# Guardar el DataFrame completo (o filtrado) en un nuevo archivo GeoJSON
gdf.to_file('departamentos_uruguay.geojson', driver='GeoJSON')

print("Datos de los departamentos de Uruguay guardados en 'departamentos_uruguay.geojson'")
