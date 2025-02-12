import React, { useState } from "react";
import axios from "axios";

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const FileUpload2 = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return;

    const CHUNK_SIZE = 8192; // 8KB per chunk
    const fileStream = file.stream();
    const reader = fileStream.getReader();
    let uploadedBytes = 0;

    const uploadChunk = async (chunk) => {
      try {
        console.log("Uploading chunk:", chunk);
        await axios.post(`${REACT_APP_BACKEND_URL}/upload`, chunk, {
          headers: { "Content-Type": "application/octet-stream" },
        });
      } catch (error) {
        console.error("Upload error:", error);
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await uploadChunk(value);
        uploadedBytes += value.length;
        setProgress(Math.round((uploadedBytes / file.size) * 100));
      }
      console.log("Upload complete!");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={uploadFile}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Upload
      </button>
      {progress > 0 && <p>Upload Progress: {progress}%</p>}
    </div>
  );
};

export default FileUpload2;
