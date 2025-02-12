import React, { useEffect, useState } from "react";

const PreprocessingOptions = ({
  columnName,
  columnType,
  handleOptionChange,
}) => {
  const options = {
    all_columns: [
      {
        name: "Handle Null",
        subOptions: [
          "Drop Null",
          "Fill 0 Unknown False",
          "Fill Mean",
          "Fill Median",
        ],
      },
      { name: "Drop Duplicates", subOptions: [] },
      {
        name: "Normalize",
        subOptions: ["L1 Norm", "L2 Norm", "L inf Norm", "Min-Max", "Z-score"],
      },
      { name: "Remove Outliers", subOptions: [] },
    ],

    numeric: [
      { name: "Drop Column", subOptions: [] },
      {
        name: "Handle Null",
        subOptions: [
          "Drop Null",
          "Fill 0",
          "Fill mean",
          "Fill Mode",
          "Fill Median",
        ],
      },
      { name: "Drop Duplicates", subOptions: [] },
      {
        name: "Normalize",
        subOptions: ["L1 Norm", "L2 Norm", "L inf Norm", "Min-Max", "Z-score"],
      },
      { name: "Transform", subOptions: ["Log", "Square", "Square Root"] },
      { name: "Remove Outliers", subOptions: [] },
      { name: "Encode", subOptions: ["One Hot Encoding"] },
      { name: "Exclude from All Columns list", subOptions: [] },
    ],

    string: [
      { name: "Drop Column", subOptions: [] },
      { name: "Handle Null", subOptions: ["Drop Null", "Fill Unknown"] },
      { name: "Drop Duplicates", subOptions: [] },
      { name: "Encode", subOptions: ["Label Encoding", "One Hot Encoding"] },
      { name: "Exclude from All Columns list", subOptions: [] },
    ],
  };

  const currentOptions =
    columnType === "all_columns"
      ? options.all_columns
      : ["IntegerType()", "FloatType()", "DoubleType()"].includes(columnType)
      ? options.numeric
      : options.string;

  const [selectedOperation, setSelectedOperation] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredOperation, setHoveredOperation] = useState(null);

  const handleOperationSelect = (selection) => {
    setSelectedOperation(selection);
    handleOptionChange(selection);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    setSelectedOperation("");
  }, [columnName]);

  return (
    <div className="relative w-full">
      {/* Dropdown button */}
      <button
        className="w-full text-left px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        {selectedOperation || "Select Operation"}
      </button>

      {/* Dropdown content */}
      {isDropdownOpen && (
        <div className="absolute mt-2 bg-blue border rounded shadow-md w-full z-50">
          {currentOptions.map((option) => (
            <div
              key={option.name}
              className="relative group"
              onMouseEnter={() => setHoveredOperation(option.name)}
              onMouseLeave={() => setHoveredOperation(null)}
            >
              {/* Main operation */}
              <button
                className="w-full text-left px-4 py-2 hover:bg-red-100"
                onClick={() =>
                  option.subOptions.length === 0 &&
                  handleOperationSelect(option.name)
                }
              >
                {option.name}
              </button>

              {/* Sub-operations dropdown */}
              {hoveredOperation === option.name &&
                option.subOptions.length > 0 && (
                  <div className="absolute left-full top-0 bg-white border rounded shadow-md z-50">
                    {option.subOptions.map((subOption) => (
                      <button
                        key={subOption}
                        className="block w-full text-left px-4 py-2 hover:bg-red-100"
                        onClick={() => handleOperationSelect(subOption)}
                      >
                        {subOption}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreprocessingOptions;
