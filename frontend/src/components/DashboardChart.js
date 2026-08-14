import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 1. We must register the components we're using
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DashboardChart({ events }) {
  // 2. Format the data for the chart
  const data = {
    labels: events.map(event => event.title), // Event titles on the X-axis
    datasets: [
      {
        label: '# of Registrations',
        data: events.map(event => event.registrationCount || 0), // Registration count on the Y-axis
        backgroundColor: 'rgba(106, 23, 203, 0.6)',
        borderColor: 'rgba(106, 23, 203, 1)',
        borderWidth: 1,
      },
    ],
  };

  // 3. Configure the chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Event Registration Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Only show whole numbers (you can't have half a registration)
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export default DashboardChart;