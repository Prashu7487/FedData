import React, { useRef, useState } from "react";
import { uploadFile } from "../utils/rawdataupload.js";

const FileUploader = () => {
  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDuration, setUploadDuration] = useState(null);

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    setUploadDuration(null);
    setProgress(0);

    try {
      const result = await uploadFile(file, (progress) =>
        setProgress(progress)
      );
      setUploadDuration(result.duration);
      alert(result.message);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} accept=".csv" />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded transition-all"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {progress > 0 && <p>Upload Progress: {progress.toFixed(2)}%</p>}
      {uploadDuration !== null && (
        <p>Upload Time: {(uploadDuration / 1000).toFixed(2)} seconds</p>
      )}
    </div>
  );
};

export default FileUploader;
