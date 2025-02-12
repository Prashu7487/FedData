import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import OverallDetails from "./OverallDetails";
import ColumnDetails from "./ColumnDetails";
import PreprocessingDetails from "./PreprocessingDetails";

const HDFS_DATASET_READ_PATH = process.env.REACT_APP_HDFS_DATASET_READ_PATH;
const Overview = () => {
  const [data, setData] = useState(null);
  const dataset_id = useParams().filename;
  const directory = useParams().dir;

  useEffect(() => {
    const loadData = async () => {
      const overview = await axios.get(
        `${HDFS_DATASET_READ_PATH}/${directory}/${dataset_id}`
      );
      setData(overview.data);
      console.log("file overview data received:", overview.data);
    };

    loadData();
  }, []);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  const columnDetails = {};
  data.columnStats.forEach((column) => {
    columnDetails[column.name] = column.type;
  });

  return (
    <div>
      <OverallDetails
        fileName={data.fileName}
        numRows={data.numRows}
        numCols={data.numColumns}
      />
      <ColumnDetails columnStats={data.columnStats} />
      <PreprocessingDetails
        columns={columnDetails}
        fileName={data.fileName}
        directory={directory}
      />
    </div>
  );
};

export default Overview;
