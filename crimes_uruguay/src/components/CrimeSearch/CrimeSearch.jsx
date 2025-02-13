import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx"; 
import jsPDF from "jspdf"; 
import "jspdf-autotable"; 
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FaTimes } from "react-icons/fa";

const CrimeSearch = () => {
  const [crimes, setCrimes] = useState([]); // Todos los delitos
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [filteredCrimes, setFilteredCrimes] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filters, setFilters] = useState({
    crimeType: "",
    victimSex: "",
    suspectSex: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total_count: 0,
    total_pages: 0,
  });

  // Cargar datos desde la API
  const fetchData = async (page = 1, limit = 20) => {
    try {
      const response = await fetch(`/api/crimes?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (!data || !Array.isArray(data.data)) {
        console.error("Datos inválidos recibidos de la API");
        return;
      }

      setCrimes(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
  }, []);

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Manejar cambios en la búsqueda escrita
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = crimes;

    // Filtrar por tipo de delito
    if (filters.crimeType) {
      filtered = filtered.filter(
        (crime) => crime.crime_type === filters.crimeType
      );
    }

    // Filtrar por sexo de la víctima
    if (filters.victimSex) {
      filtered = filtered.filter(
        (crime) => crime.victim_sex === filters.victimSex
      );
    }

    // Filtrar por sexo del sospechoso
    if (filters.suspectSex) {
      filtered = filtered.filter(
        (crime) => crime.suspect_sex === filters.suspectSex
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (crime) =>
          crime.reported_by.toLowerCase().includes(lowerCaseSearchTerm) ||
          crime.victim_occupation
            ?.toLowerCase()
            .includes(lowerCaseSearchTerm) ||
          crime.suspect_description?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredCrimes(filtered);
  }, [filters, searchTerm, crimes]);

  useEffect(() => {
    if (selectedCrime) {
      const map = new maplibregl.Map({
        container: "map", 
        style: "https://demotiles.maplibre.org/style.json", 
        center: selectedCrime.geometry.coordinates, 
        zoom: 6,
      });

      new maplibregl.Marker()
        .setLngLat(selectedCrime.geometry.coordinates)
        .addTo(map);

      return () => map.remove(); 
    }
  }, [selectedCrime]);

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCrimes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Crimes");
    XLSX.writeFile(workbook, "crimes.xlsx");
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCrimes);
    const csvData = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crimes.csv";
    a.click();
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "Type of crime",
          "Reported by",
          "Victim",
          "Suspect",
          "Date",
          "Evidence",
        ],
      ],
      body: filteredCrimes.map((crime) => [
        crime.crime_type,
        crime.reported_by,
        `${crime.victim_age} years old, ${crime.victim_sex}, ${crime.victim_occupation}`,
        `${crime.suspect_count} suspects, ${crime.suspect_sex}, ${crime.suspect_description}`,
        `${crime.date}, ${crime.incident_time}`,
        crime.evidence_found ? "Found" : "Not found",
      ]),
    });
    doc.save("crimes.pdf");
  };

  const openModal = (crime) => {
    setSelectedCrime(crime);
  };

  const closeModal = () => {
    setSelectedCrime(null);
  };

  return (
    <div className="p-4 w-full">
      <div className="mb-4 w-full">
        <h2 className="text-lg font-bold mb-2">Filters</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium">Type of crime:</label>
            <select
              name="crimeType"
              value={filters.crimeType}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="Fraud">Fraud</option>
              <option value="Drug Trafficking">Drug Trafficking</option>
              <option value="Homicide">Homicide</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Víctim&apos;s gender:
            </label>
            <select
              name="victimSex"
              value={filters.victimSex}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Suspect&apos;s gender:
            </label>
            <select
              name="suspectSex"
              value={filters.suspectSex}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Search:</label>
        <input
          type="text"
          placeholder="Name of the reporter, occupation of the victim or description of the suspect..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Botones de exportación */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Export Excel
        </button>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Export CSV
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Export PDF
        </button>
      </div>

      {/* Resultados */}
      <div>
        <h2 className="text-lg font-bold mb-2">
          Results ({filteredCrimes.length})
        </h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-gray-300 px-4 py-2">
                Type of crime
              </th>
              <th className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                Reported by
              </th>
              <th className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                Victim
              </th>
              <th className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                Suspect
              </th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                Evidence
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCrimes.map((crime, index) => (
              <tr
                key={index}
                className="bg-gray text-white hover:bg-white hover:text-black cursor-pointer"
                onClick={() => openModal(crime)}
              >
                <td className="border border-gray-300 px-4 py-2">
                  {crime.crime_type}
                </td>
                <td className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                  {crime.reported_by}
                </td>
                <td className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                  {`${crime.victim_age} years old, ${crime.victim_sex}, ${crime.victim_occupation}`}
                </td>
                <td className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                  {`${crime.suspect_count} suspects, ${crime.suspect_sex}, ${crime.suspect_description}`}
                </td>
                <td className="border border-gray-300 px-4 py-2">{`${crime.date}, ${crime.incident_time}`}</td>
                <td className="border border-gray-300 px-4 py-2 hidden md:table-cell">
                  {crime.evidence_found ? "Found" : "Not found"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedCrime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white p-6 rounded-lg max-w-full w-full md:max-w-2xl overflow-y-auto"
              style={{ maxHeight: "90vh" }}
            >

              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-black transition duration-300"
              >
                <FaTimes className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold mb-4">
                {selectedCrime.crime_type}
              </h2>
              <p>
                <strong>Reported by:</strong> {selectedCrime.reported_by}
              </p>
              <p>
                <strong>Victim:</strong>{" "}
                {`${selectedCrime.victim_age} years old, ${selectedCrime.victim_sex}, ${selectedCrime.victim_occupation}`}
              </p>
              <p>
                <strong>Suspects:</strong>{" "}
                {`${selectedCrime.suspect_count} suspects, ${selectedCrime.suspect_sex}, ${selectedCrime.suspect_description}`}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {`${selectedCrime.date}, ${selectedCrime.incident_time}`}
              </p>
              <p>
                <strong>Evidence:</strong>{" "}
                {selectedCrime.evidence_found ? "Found" : "Not found"}
              </p>
              <p>
                <strong>Location:</strong> {selectedCrime.province}
              </p>
              <p>
                <strong>Coordinates:</strong>{" "}
                {selectedCrime.geometry.coordinates.join(", ")}
              </p>
              <div id="map" className="w-full h-64 mt-4"></div>
              <button
                onClick={closeModal}
                className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-dark"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Paginación */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => fetchData(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray rounded-l-md disabled:bg-gray-dark hover:bg-black hover:text-white custom-disabled-hover"
          >
            Back
          </button>
          <span className="px-4 py-2 bg-gray">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => fetchData(pagination.page + 1)}
            disabled={pagination.page === pagination.total_pages}
            className="px-4 py-2 bg-gray rounded-r-md disabled:bg-gray-dark hover:bg-black hover:text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrimeSearch;
