import React from "react";
import ViewFiles from "./components/ViewFiles.jsx";
import Datasets from "./components/Datasets.jsx";
import Overview from "./components/OverviewComponents/Overview.jsx";
import NotFound from "./components/NotFound.jsx";
import ViewRecentUploads from "./components/ViewRecentUploads.jsx";
import PreprocessingDocs from "./components/PreprocessingComponents/PreprocessingDocs.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Datasets />} />
          <Route path="/view-datasets" element={<ViewFiles />} />
          <Route
            path="/dataset-overview/:dir/:filename"
            element={<Overview />}
          />
          <Route path="/view-recent-uploads" element={<ViewRecentUploads />} />
          <Route path="//preprocessing-docs" element={<PreprocessingDocs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
