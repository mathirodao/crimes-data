import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";

const HistogramChart = () => {
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetch("/api/crimes/age_distribution")
      .then((response) => response.json())
      .then((data) => {
  
        const bins = {
          "0-18": { victims: 0, criminals: 0 },
          "19-30": { victims: 0, criminals: 0 },
          "31-45": { victims: 0, criminals: 0 },
          "46-60": { victims: 0, criminals: 0 },
          "60+": { victims: 0, criminals: 0 },
        };
  
        const { victim_age, criminal_age } = data[0]; 
  
        victim_age.forEach(({ age, count }) => {
          if (age <= 18) bins["0-18"].victims += count;
          else if (age <= 30) bins["19-30"].victims += count;
          else if (age <= 45) bins["31-45"].victims += count;
          else if (age <= 60) bins["46-60"].victims += count;
          else bins["60+"].victims += count;
        });
  
        criminal_age.forEach(({ age, count }) => {
          if (age <= 18) bins["0-18"].criminals += count;
          else if (age <= 30) bins["19-30"].criminals += count;
          else if (age <= 45) bins["31-45"].criminals += count;
          else if (age <= 60) bins["46-60"].criminals += count;
          else bins["60+"].criminals += count;
        });
  
        const newData = [
          {
            name: "Victims",
            data: Object.values(bins).map((b) => b.victims),
          },
          {
            name: "Criminals",
            data: Object.values(bins).map((b) => b.criminals),
          },
        ];
  
        setChartData(newData);
      });
  }, []);
  

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;


    const options = {
      chart: { type: "bar" },
      series: chartData,
      title: { text: "Age Distribution of Victims and Offenders", align: "left" },
      xaxis: { categories: ["0-18", "19-30", "31-45", "46-60", "60+"], title: { text: "Age Range" } },
      yaxis: { title: { text: "Frequency" } },
      plotOptions: { bar: { borderRadius: 8, horizontal: false } },
    };

    if (!chartInstance.current) {
      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    } else {
      chartInstance.current.updateOptions(options);
    }
  }, [chartData]);

  return <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }}></div>;
};

export default HistogramChart;
