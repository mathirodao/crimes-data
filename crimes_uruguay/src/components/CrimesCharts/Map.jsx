import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const uruguayGeoJson = "/assets/departamentos_uruguay.geojson";

const MapLibreUruguay = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverInfo, setHoverInfo] = useState({ name: null, x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [crimeStatsByDepartment, setCrimeStatsByDepartment] = useState({});
  const [year, setYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [isUserSelectedYear, setIsUserSelectedYear] = useState(false); // Rastrear selección manual del usuario
  const selectedAreaRef = useRef(null);

  // Cargar años disponibles
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/crimes_count`)
      .then((response) => response.json())
      .then((data) => {
        const years = [
          ...new Set(data.map((item) => Number(item._id.split("/")[2]))),
        ];
        setAvailableYears(years);
        if (!isUserSelectedYear) {
          setYear(Math.max(...years)); 
        }
      });
  }, [isUserSelectedYear]);

  // Cargar crímenes desde la API para el año seleccionado
  useEffect(() => {
    if (!year) return;
    setIsLoading(true); 
    fetch(`${import.meta.env.VITE_API_URL}/api/crimes/year/${year}`)
      .then((response) => response.json())
      .then((data) => {
        const statsByDepartment = calculateCrimeStatsForAllDepartments(data); 
        setCrimeStatsByDepartment(statsByDepartment);
        setIsLoading(false); 
      })
      .catch((error) => {
        console.error("Error al cargar los datos de crímenes:", error);
        setIsLoading(false); 
      });
  }, [year]);

  // Calcular estadísticas de crímenes para todos los departamentos
  const calculateCrimeStatsForAllDepartments = (crimes) => {
    const statsByDepartment = {};
    const departments = [
      ...new Set(crimes.map((crime) => crime.province.toUpperCase())),
    ];

    departments.forEach((departmentName) => {
      const filteredCrimes = crimes.filter(
        (crime) => crime.province.toUpperCase() === departmentName
      );
      statsByDepartment[departmentName] = calculateCrimeStats(filteredCrimes);
    });

    return statsByDepartment;
  };

  // Calcular estadísticas de crímenes para un conjunto de crímenes
  const calculateCrimeStats = (crimes) => {
    const stats = {
      totalCrimes: crimes.length,
      victimMen: 0,
      victimWomen: 0,
      suspectMen: 0,
      suspectWomen: 0,
      avgVictimAge: 0,
      avgSuspectAge: 0,
    };
    crimes.forEach((crime) => {
      if (crime.victim_sex === "M") stats.victimMen++;
      if (crime.victim_sex === "F") stats.victimWomen++;
      if (crime.suspect_sex === "M") stats.suspectMen++;
      if (crime.suspect_sex === "F") stats.suspectWomen++;
      stats.avgVictimAge += crime.victim_age || 0;
      stats.avgSuspectAge += crime.criminal_age || 0;
    });
    const totalCrimes = stats.totalCrimes;
    if (totalCrimes > 0) {
      stats.avgVictimAge /= totalCrimes;
      stats.avgSuspectAge /= totalCrimes;
    }
    return stats;
  };

  // Manejador para seleccionar un departamento
  const handleSelectDepartment = (department) => {
    selectedAreaRef.current = department;

    d3.select(svgRef.current)
      .selectAll("path")
      .attr("fill", (d) =>
        d.properties.nombre === department.nombre ? "black" : "#598fde"
      );
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);

    const updateDimensions = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const maxWidth = 800; 
      const maxHeight = 600;

      // Calcular dimensiones manteniendo la relación de aspecto
      let width = Math.min(containerWidth, maxWidth);
      let height = (width * 3) / 4; // Relación de aspecto 4:3
      height = Math.min(height, maxHeight);

      setDimensions({ width, height });
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    fetch(uruguayGeoJson)
      .then((response) => response.json())
      .then((geojsonData) => {
        const projection = d3
          .geoMercator()
          .fitSize([dimensions.width, dimensions.height], geojsonData);
        const path = d3.geoPath().projection(projection);

        // Extraer nombres de departamentos
        const departmentNames = geojsonData.features.map(
          (feature) => feature.properties.nombre
        );
        setDepartments(departmentNames);

        svg
          .selectAll("path")
          .data(geojsonData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#598fde")
          .attr("stroke", "#000000")
          .on("click", (event, d) => {
            handleSelectDepartment(d.properties);
          })
          .on("mousemove", (event, d) => {
            const [x, y] = d3.pointer(event);
            const svgRect = svgRef.current.getBoundingClientRect();

            const absoluteX = svgRect.left + x;
            const absoluteY = svgRect.top + y;

            setHoverInfo({
              name: d.properties.nombre,
              x: absoluteX,
              y: absoluteY,
            });
            setIsHovering(true);
          })
          .on("mouseenter", function (event, d) {
            const isSelected =
              selectedAreaRef.current?.nombre === d.properties.nombre;
            if (!isSelected) {
              d3.select(this).attr("fill", "#000033");
            }
          })
          .on("mouseleave", function (event, d) {
            const isSelected =
              selectedAreaRef.current?.nombre === d.properties.nombre;
            if (!isSelected) {
              d3.select(this).attr("fill", "#598fde");
            }
            setIsHovering(false);
          });

        // Resaltar el departamento seleccionado
        if (selectedAreaRef.current) {
          svg
            .selectAll("path")
            .attr("fill", (d) =>
              d.properties.nombre === selectedAreaRef.current.nombre
                ? "black"
                : "#598fde"
            );
        }
      });
  }, [year, dimensions, uruguayGeoJson]);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
      {/* Columna Izquierda: Mapa */}
      <div className="col-span-1 md:col-span-2">
        <div className="relative">
          <select
            value={year || ""}
            onChange={(e) => {
              setIsUserSelectedYear(true); 
              setYear(Number(e.target.value));
            }}
            style={{
              padding: "8px",
              fontSize: "16px",
              backgroundColor: "transparent",
              color: "#000000",
              border: "2px solid black",
              borderRadius: "5px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            {availableYears.map((y) => (
              <option key={y} value={y} style={{ color: "black" }}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            height: "auto",
            maxWidth: "800px",
            maxHeight: "600px",
          }}
        ></svg>
        {isHovering && hoverInfo.name && (
          <div
            style={{
              display: window.innerWidth >= 820 ? "block" : "none", // Ocultar a partir de 820
              position: "absolute",
              top: hoverInfo.y + 800,
              left: hoverInfo.x + 10,
              background: "white",
              padding: "5px",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              pointerEvents: "none",
            }}
          >
            <strong>{hoverInfo.name}</strong>
          </div>
        )}
      </div>

      {/* Columna Derecha: Información del Departamento Seleccionado */}
      <div className="col-span-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <svg
              className="animate-spin h-10 w-10 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : selectedAreaRef.current ? (
          <div className="text-black p-6">
            <h4 className="text-3xl font-bold mb-4 text-center">
              {selectedAreaRef.current.nombre}
            </h4>
            {crimeStatsByDepartment[
              selectedAreaRef.current.nombre.toUpperCase()
            ] ? (
              <table className="table-auto w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-gray-300 px-4 py-2">
                      Statistics
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Filas de datos */}
                  <tr className="bg-black text-white transition delay-150 duration-300 ease-in-out hover:scale-110">
                    <td className="border border-gray px-4 py-2">
                      Total Crimes
                    </td>
                    <td className="bg-gray text-white hover:bg-white hover:text-black border border-gray-300 px-4 py-2">
                      {crimeStatsByDepartment[
                        selectedAreaRef.current.nombre.toUpperCase()
                      ]?.totalCrimes || "N/A"}
                    </td>
                  </tr>
                  <tr className="bg-black text-white transition delay-150 duration-300 ease-in-out hover:scale-110">
                    <td className="border border-gray px-4 py-2 ">
                      Male Victims
                    </td>
                    <td className="bg-gray text-white hover:bg-white hover:text-black border border-gray-300 px-4 py-2">
                      {crimeStatsByDepartment[
                        selectedAreaRef.current.nombre.toUpperCase()
                      ]?.victimMen || "N/A"}
                    </td>
                  </tr>
                  <tr className="bg-black text-white transition delay-150 duration-300 ease-in-out hover:scale-110">
                    <td className="border border-gray px-4 py-2 ">
                      Female Victims
                    </td>
                    <td className="bg-gray text-white hover:bg-white hover:text-black border border-gray-300 px-4 py-2">
                      {crimeStatsByDepartment[
                        selectedAreaRef.current.nombre.toUpperCase()
                      ]?.victimWomen || "N/A"}
                    </td>
                  </tr>
                  <tr className="bg-black text-white transition delay-150 duration-300 ease-in-out hover:scale-110">
                    <td className="border border-gray px-4 py-2">
                      Male Offenders
                    </td>
                    <td className="bg-gray text-white hover:bg-white hover:text-black border border-gray-300 px-4 py-2">
                      {crimeStatsByDepartment[
                        selectedAreaRef.current.nombre.toUpperCase()
                      ]?.suspectMen || "N/A"}
                    </td>
                  </tr>
                  <tr className="bg-black text-white transition delay-150 duration-300 ease-in-out hover:scale-110">
                    <td className="border border-gray px-4 py-2">
                      Female Offenders
                    </td>
                    <td className="bg-gray text-white hover:bg-white hover:text-black border border-gray-300 px-4 py-2">
                      {crimeStatsByDepartment[
                        selectedAreaRef.current.nombre.toUpperCase()
                      ]?.suspectWomen || "N/A"}
                    </td>
                  </tr>
                  <tr className="bg-black text-white transition delay-150 duration-300 ease-in-out hover:scale-110">
                    <td className="border border-gray px-4 py-2">
                      Average Age of Victims
                    </td>
                    <td className="bg-gray text-white hover:bg-white hover:text-black border border-gray-300 px-4 py-2">
                      {crimeStatsByDepartment[
                        selectedAreaRef.current.nombre.toUpperCase()
                      ]?.avgVictimAge?.toFixed(2) || "N/A"}
                    </td>
                  </tr>
                  <tr className="bg-black text-white transition delay-150 duration-300 ease-in-out hover:scale-110">
                    <td className="border border-gray px-4 py-2">
                      Average Age of Offenders
                    </td>
                    <td className="bg-gray text-white hover:bg-white hover:text-black border border-gray-300 px-4 py-2">
                      {crimeStatsByDepartment[
                        selectedAreaRef.current.nombre.toUpperCase()
                      ]?.avgSuspectAge?.toFixed(2) || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <span className="text-3xl font-bold text-center">
                No crime data available.
              </span>
            )}
          </div>
        ) : (
          <span className="text-3xl font-bold text-center">
            SELECT A DEPARTMENT
          </span>
        )}
      </div>
    </div>
  );
};

export default MapLibreUruguay;
