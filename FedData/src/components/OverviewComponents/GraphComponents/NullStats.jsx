import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register components
ChartJS.register(ArcElement, Tooltip, Legend);

const NullStats = ({ columnName, nullCount, total }) => {
  const data = {
    labels: ["Nulls", "Non-Nulls"],
    datasets: [
      {
        data: [nullCount, total - nullCount],
        backgroundColor: ["#ef4444", "#10b981"],
      },
    ],
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-medium mb-2">{columnName}</h3>
      <Pie data={data} />
    </div>
  );
};

export default NullStats;
