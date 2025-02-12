import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const environmentVariables = [
  "REACT_APP_RAW_DATA_UPLOAD_URL",
  "REACT_APP_BACKEND_URL",
  "REACT_APP_HDFS_DATASET_READ_PATH",
  "REACT_APP_FILE_UPLOAD_CHUNK_SIZE",
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const processEnv = {};
  environmentVariables.forEach((key) => (processEnv[key] = env[key]));

  return {
    define: {
      "process.env": processEnv,
    },
    plugins: [react()],
  };
});
