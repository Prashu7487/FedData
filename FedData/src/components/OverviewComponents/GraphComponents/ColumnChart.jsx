import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const ColumnChart = ({ columnName, stats }) => {
  const data = {
    labels: ["Min", "Mean", "Max"],
    datasets: [
      {
        label: columnName,
        data: [stats.min, stats.mean, stats.max],
        backgroundColor: ["#3b82f6", "#10b981", "#ef4444"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-medium mb-2">{columnName}</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ColumnChart;
