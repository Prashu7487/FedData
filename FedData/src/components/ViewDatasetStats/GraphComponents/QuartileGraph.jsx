// QuartileGraph.jsx
import React from "react";
import { BoxPlot } from "chartjs-chart-box-and-violin-plot";
import Chart from "chart.js/auto";

const QuartileGraph = ({ quartiles }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    new BoxPlot(ctx, {
      data: {
        labels: ["Distribution"],
        datasets: [
          {
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            borderColor: "rgb(99, 102, 241)",
            borderWidth: 1,
            outlierColor: "#ff0000",
            padding: 20,
            itemRadius: 0,
            data: [
              [
                quartiles.min,
                quartiles.Q1,
                quartiles.median,
                quartiles.Q3,
                quartiles.max,
              ],
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Value Distribution (Box & Whisker Plot)",
          },
        },
      },
    });
  }, [quartiles]);

  return <canvas ref={canvasRef} />;
};

export default QuartileGraph;
