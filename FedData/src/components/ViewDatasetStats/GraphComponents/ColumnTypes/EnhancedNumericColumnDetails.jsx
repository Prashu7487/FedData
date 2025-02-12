// EnhancedNumericColumnDetails.jsx
import React from "react";
import QuartileGraph from "./QuartileGraph";
import HistogramPlot from "./HistogramPlot";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const EnhancedNumericColumnDetails = ({ column }) => {
  const stats = [
    { label: "Null Values", value: column.nullCount, icon: "❓" },
    { label: "Unique Values", value: column.uniqueCount, icon: "🔑" },
    { label: "Mean", value: column.mean?.toFixed(4), icon: "μ" },
    { label: "Std Dev", value: column.stddev?.toFixed(4), icon: "σ" },
  ];

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-3 bg-gray-50 rounded-lg flex items-center"
          >
            <span className="text-2xl mr-2">{stat.icon}</span>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <InformationCircleIcon className="w-5 h-5" />
            <h3 className="font-semibold">Value Distribution Analysis</h3>
          </div>
          <div className="h-64">
            <QuartileGraph
              quartiles={{
                ...column.quartiles,
                min: column.min,
                max: column.max,
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <InformationCircleIcon className="w-5 h-5" />
            <h3 className="font-semibold">Frequency Distribution</h3>
          </div>
          <div className="h-64">
            <HistogramPlot
              bins={column.histogram.bins}
              counts={column.histogram.counts}
              xTitle={column.name}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          Preprocessing Suggestions:
        </h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          {column.nullCount > 0 && (
            <li>
              Consider null handling (mean: {column.mean.toFixed(2)}, median:{" "}
              {column.quartiles.median.toFixed(2)})
            </li>
          )}
          {column.uniqueCount < 10 && (
            <li>Possible candidate for categorical encoding</li>
          )}
          {column.stddev > 0.5 && (
            <li>Consider standardization/normalization</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EnhancedNumericColumnDetails;
