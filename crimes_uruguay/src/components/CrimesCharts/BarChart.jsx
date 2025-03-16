import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";

const BarChart = () => {
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    console.log("API URL:", import.meta.env.VITE_API_URL);
    fetch(`${import.meta.env.VITE_API_URL}/api/crimes/count_by_type`)
      .then((response) => response.json())
      .then((data) => {

        const replacements = { count: "y", crime_type: "x" };
        const newData = data.map((item) => ({
          [replacements["crime_type"]]: item["crime_type"],
          [replacements["count"]]: item["count"],
        }));

        setChartData(newData);
      });
  }, []);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const options = {
      chart: {
        type: "bar",
        id: 'crime-bar',
        toolbar: { show: true },
        width: '100%',
      },
      series: [
        {
          data : chartData,
        },
      ],
      title: { text: `Crimes by type of crime`, align: 'left' },
      plotOptions: {
        bar: {
          distributed: true,
          borderRadius: 10
        }
      },
      yaxis: {
        tickAmount: 6, 
        min: 0,        
        max: 9000,    
        labels: {
          formatter: function (value) {
            return value.toLocaleString(); 
          },
        },
      },
    };

    if (!chartInstance.current) {
      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    } else {
      chartInstance.current.updateOptions(options);
    }
  }, [chartData]);

  return (
    <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }}></div>
  );
};

export default BarChart;
