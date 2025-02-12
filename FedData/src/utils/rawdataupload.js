// src/utils/fileUploader.js
import axios from "axios";

const RAW_DATA_UPLOAD_URL = process.env.REACT_APP_RAW_DATA_UPLOAD_URL;
const CHUNK_SIZE = parseInt(process.env.REACT_APP_FILE_UPLOAD_CHUNK_SIZE, 10); // 10MB

export const sendFileChunk = async (chunk, socket) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    socket.onmessage = (event) => {
      if (event.data === "ACK") {
        console.log(event.data);
        return resolve();
      }
    };

    reader.onload = () => {
      // 3. Send chunk to server
      socket.send(reader.result);
    };

    reader.readAsArrayBuffer(chunk);
  });
};

export const uploadFile = async (file, onProgressUpdate) => {
  const socket = new WebSocket(RAW_DATA_UPLOAD_URL);

  return new Promise((resolve, reject) => {
    socket.onopen = async () => {
      // 1. send filename to server
      socket.send(JSON.stringify({ fileName: file.name }));
      console.log("WebSocket connected");

      // 2. Read file in chunks
      const startTime = Date.now();
      for (let offset = 0; offset <= file.size; offset += CHUNK_SIZE) {
        console.log("offset: ", offset, "filesize: ", file.size);
        const chunk = file.slice(
          offset,
          Math.min(file.size, offset + CHUNK_SIZE)
        );
        const progress = Math.min((offset / file.size) * 100, 100);
        onProgressUpdate(progress);
        await sendFileChunk(chunk, socket);
      }

      const endTime = Date.now();
      socket.send("END_OF_FILE");
      // here we can wait for the post-hdfs ACK to complete

      return resolve({
        message: "File uploaded successfully",
        duration: endTime - startTime,
      });
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(new Error("WebSocket error"));
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  });
};

/* Not exactly Working code below ..why ? is interesting to know */

// export const uploadFile = async (file, onProgressUpdate) => {
//   const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
//   const socket = new WebSocket(RAW_DATA_UPLOAD_URL);

//   let startTime = null;

//   return new Promise((resolve, reject) => {
//     socket.onopen = async () => {
//       let offset = 0;

//       await socket.send(JSON.stringify({ fileName: file.name }));
//       console.log("WebSocket connected");
//       startTime = Date.now();

//       const sendChunk = async () => {
//         if (offset >= file.size) {
//           onProgressUpdate(100);
//           const endTime = Date.now();
//           socket.send("END_OF_FILE");
//           resolve({
//             message: "File uploaded successfully",
//             duration: endTime - startTime,
//           });
//           return;
//         }

//         const chunk = file.slice(offset, offset + CHUNK_SIZE);
//         const reader = new FileReader();

//         reader.onload = async () => {
//           // Send chunk
//           await socket.send(reader.result);
//           offset += CHUNK_SIZE;
//           const progress = Math.min((offset / file.size) * 100, 100);
//           onProgressUpdate(progress); // Update progress in parent Components

//           // Wait for acknowledgment before sending the next chunk
//           socket.onmessage = (event) => {
//             if (event.data === "ACK") {
//               console.log(event.data);
//               sendChunk(); // Proceed to the next chunk
//             }
//           };
//         };

//         reader.onerror = () => {
//           console.error("Error reading file chunk");
//           socket.close();
//           reject(new Error("Error reading file chunk"));
//         };

//         reader.readAsArrayBuffer(chunk);
//       };

//       await sendChunk(); // Start sending chunks
//     };

//     socket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       reject(new Error("WebSocket error"));
//     };

//     socket.onclose = () => {
//       console.log("WebSocket closed");
//     };
//   });
// };
