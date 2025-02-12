// HistogramPlot.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const HistogramPlot = ({ bins, counts, xTitle }) => {
  const data = {
    labels: bins
      .slice(0, -1)
      .map((b, i) => `${b.toFixed(2)}-${bins[i + 1].toFixed(2)}`),
    datasets: [
      {
        label: "Frequency",
        data: counts,
        backgroundColor: "rgba(79, 70, 229, 0.5)",
        borderColor: "rgb(79, 70, 229)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Distribution of ${xTitle}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xTitle,
        },
      },
      y: {
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default HistogramPlot;
