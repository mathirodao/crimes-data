import { useEffect, useState, useRef } from 'react';
import ApexCharts from 'apexcharts';

const LineChart = () => {
  const [year, setYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetch('/api/crimes_count')
      .then(response => response.json())
      .then(data => {
        const years = [...new Set(data.map(item => Number(item._id.split('/')[2])))];
        setAvailableYears(years);
        setYear(Math.max(...years)); 
      });
  }, []);

  useEffect(() => {
    if (year === null) return;

    fetch('/api/crimes_count')
      .then(response => response.json())
      .then(data => {
        const filteredData = data.filter(item => {
          const [, , dataYear] = item._id.split('/').map(Number);
          return dataYear === year;
        });

        const monthlyData = filteredData.reduce((acc, item) => {
          const [_, month, dataYear] = item._id.split('/').map(Number);
          const key = `${month}-${dataYear}`;

          if (!acc[key]) {
            acc[key] = { x: Date.UTC(dataYear, month - 1, 1), y: 0 };
          }
          acc[key].y += item.crime_count;
          return acc;
        }, {});

        const formattedData = Object.values(monthlyData).sort((a, b) => a.x - b.x);
        setChartData(formattedData);
      });
  }, [year]);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const options = {
      series: [{ name: 'Crimes', data: chartData }],
      chart: {
        type: 'line',
        id: 'crime-chart',
        animations: { enabled: false },
        toolbar: { show: true },
        width: '100%',
      },
      stroke: { width: 3, curve: 'smooth' },
      xaxis: { type: 'datetime' },
      title: { text: `Crimes in ${year}`, align: 'left' },
      tooltip: { x: { format: 'MM/yyyy' } },
    };

    if (!chartInstance.current) {
      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    } else {
      chartInstance.current.updateOptions(options);
    }
  }, [chartData]);

  return (
    <div style={{ width: '100%' }}>
      <select
        value={year || ''}
        onChange={(e) => setYear(Number(e.target.value))}
        style={{
          padding: '8px',
          fontSize: '16px',
          backgroundColor: 'transparent',
          color: 'black',
          border: '2px solid black',
          borderRadius: '5px',
          marginBottom: '10px',
          cursor: 'pointer',
        }}
      >
        {availableYears.map((y) => (
          <option key={y} value={y} style={{ color: 'black' }}>
            {y}
          </option>
        ))}
      </select>
      <div ref={chartRef} style={{ width: '100%', minHeight: '400px' }}></div>
    </div>
  );
};

export default LineChart;
