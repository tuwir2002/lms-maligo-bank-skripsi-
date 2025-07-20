import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.45)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          color: '#666',
          font: { size: 12 },
        },
        pointLabels: {
          font: { size: 14 },
          color: '#fff',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14 },
          color: '#fff',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.r}`,
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', position: 'relative' }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;