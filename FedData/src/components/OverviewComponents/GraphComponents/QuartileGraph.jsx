import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

const QuartileGraph = ({ quartiles }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(800);
  const height = 140;
  const margin = { top: 30, right: 20, bottom: 40, left: 20 };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].contentRect.width) {
        setWidth(entries[0].contentRect.width - margin.left - margin.right);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const { min = 0, Q1 = 0, median = 0, Q3 = 0, max = 0 } = quartiles || {};
  const scale = d3.scaleLinear().domain([min, max]).range([0, width]).nice();

  const isValidData = [min, Q1, median, Q3, max].every(Number.isFinite);
  const iqr = Q3 - Q1;
  const showBox = isValidData && iqr > 0;

  return (
    <div
      ref={containerRef}
      className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-100 relative"
    >
      {isValidData ? (
        <svg width="100%" height={height} className="overflow-visible">
          <g transform={`translate(${margin.left},${height / 2})`}>
            {/* Whiskers */}
            <path
              d={`M${scale(min)} 0 H${scale(max)}`}
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray={showBox ? "4 2" : "0"}
            />

            {/* Box */}
            {showBox && (
              <g>
                <rect
                  x={scale(Q1)}
                  y={-height / 4}
                  width={scale(Q3) - scale(Q1)}
                  height={height / 2}
                  fill="#e0f2fe"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                  rx="3"
                />
                {/* Quartile Labels */}
                <g transform={`translate(${scale(Q1)},${height / 4 + 20})`}>
                  <text
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="10"
                    className="font-medium"
                  >
                    Q1: {Number(Q1).toFixed(2)}
                  </text>
                </g>
                <g transform={`translate(${scale(Q3)},${height / 4 + 20})`}>
                  <text
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="10"
                    className="font-medium"
                  >
                    Q3: {Number(Q3).toFixed(2)}
                  </text>
                </g>
              </g>
            )}

            {/* Median Line */}
            <path
              d={`M${scale(median)} ${-height / 4} V${height / 4}`}
              stroke="#0369a1"
              strokeWidth="2"
            />

            {/* End Points */}
            <circle cx={scale(min)} r="4" fill="#64748b" />
            <circle cx={scale(max)} r="4" fill="#64748b" />

            {/* Axis Labels */}
            <g transform={`translate(${scale(min)},20)`}>
              <text
                textAnchor="middle"
                fill="#475569"
                fontSize="10"
                className="font-semibold"
              >
                {Number(min).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </text>
            </g>
            <g transform={`translate(${scale(max)},20)`}>
              <text
                textAnchor="middle"
                fill="#475569"
                fontSize="10"
                className="font-semibold"
              >
                {Number(max).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </text>
            </g>
            <g transform={`translate(${scale(median)},-${height / 4 + 10})`}>
              <text
                textAnchor="middle"
                fill="#0369a1"
                fontSize="10"
                className="font-semibold"
              >
                Median: {Number(median).toFixed(2)}
              </text>
            </g>
          </g>
        </svg>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          No valid quartile data available
        </div>
      )}
    </div>
  );
};

export default QuartileGraph;

// import React from "react";

// const QuartileGraph = ({ quartiles }) => {
//   const { min, Q1, median, Q3, max } = quartiles;
//   const range = max - min;
//   const hasZeroRange = range === 0;

//   const calculatePosition = (value) => {
//     if (hasZeroRange) return 50; // Handle all-equal case
//     return ((value - min) / range) * 100;
//   };

//   const positions = {
//     min: calculatePosition(min),
//     Q1: calculatePosition(Q1),
//     median: calculatePosition(median),
//     Q3: calculatePosition(Q3),
//     max: calculatePosition(max),
//   };

//   // Group labels that share the same position
//   const labelGroups = [
//     { title: "Min", value: min, position: positions.min },
//     { title: "Q1", value: Q1, position: positions.Q1 },
//     { title: "Median", value: median, position: positions.median },
//     { title: "Q3", value: Q3, position: positions.Q3 },
//     { title: "Max", value: max, position: positions.max },
//   ].reduce((groups, label) => {
//     const key = label.position.toFixed(2);
//     if (!groups[key]) {
//       groups[key] = {
//         position: label.position,
//         titles: [],
//         values: new Set(),
//       };
//     }
//     groups[key].titles.push(label.title);
//     groups[key].values.add(label.value);
//     return groups;
//   }, {});

//   const groupedLabels = Object.values(labelGroups).map((group) => ({
//     ...group,
//     values: Array.from(group.values),
//   }));

//   return (
//     <div className="w-full p-4 space-y-4">
//       {/* Visualization Container */}
//       <div className="relative w-full h-8">
//         {/* Left Whisker */}
//         {!hasZeroRange && Q1 > min && (
//           <div
//             className="absolute h-1 bg-gray-400 top-1/2 -translate-y-1/2"
//             style={{
//               left: `${positions.min}%`,
//               width: `${positions.Q1 - positions.min}%`,
//             }}
//           />
//         )}

//         {/* Interquartile Box */}
//         {!hasZeroRange && Q1 !== Q3 ? (
//           <div
//             className="absolute h-full bg-blue-100 border-2 border-blue-400 rounded-sm top-0"
//             style={{
//               left: `${positions.Q1}%`,
//               width: `${positions.Q3 - positions.Q1}%`,
//             }}
//           />
//         ) : (
//           <div
//             className="absolute h-full w-1 bg-blue-400 top-0"
//             style={{ left: `${hasZeroRange ? 50 : positions.Q1}%` }}
//           />
//         )}

//         {/* Right Whisker */}
//         {!hasZeroRange && Q3 < max && (
//           <div
//             className="absolute h-1 bg-gray-400 top-1/2 -translate-y-1/2"
//             style={{
//               left: `${positions.Q3}%`,
//               width: `${positions.max - positions.Q3}%`,
//             }}
//           />
//         )}

//         {/* Median Line */}
//         <div
//           className="absolute w-1 h-full bg-blue-800 top-0"
//           style={{ left: `${positions.median}%` }}
//         />

//         {/* Center line for all-equal case */}
//         {hasZeroRange && (
//           <div className="absolute w-1 h-full bg-gray-400 top-0 left-1/2 -translate-x-1/2" />
//         )}
//       </div>

//       {/* Labels Container */}
//       <div className="relative w-full min-h-[4rem]">
//         {groupedLabels.map((group, index) => (
//           <div
//             key={`label-${index}`}
//             className="absolute -translate-x-1/2"
//             style={{ left: `${group.position}%` }}
//           >
//             <div className="flex flex-col items-center px-2 transform -translate-y-1/2">
//               <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
//                 {group.titles.join("/")}
//               </span>
//               <span className="text-xs text-gray-500 whitespace-nowrap">
//                 {group.values[0]}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default QuartileGraph;
