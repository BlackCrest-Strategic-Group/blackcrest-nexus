import React, { useState } from "react";
import { blanketPoApi } from "../utils/api.js";
import FileUpload from "../components/blanketpo/FileUpload.jsx";
import ValidationResults from "../components/blanketpo/ValidationResults.jsx";
import BlanketPreview from "../components/blanketpo/BlanketPreview.jsx";

export default function BlanketPOBuilderPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState({ header: null, lines: [], errors: [] });

  function handleFileChange(event) {
    setFile(event.target.files?.[0] || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!file) {
      setSubmitError("Please select an Excel file before submitting.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await blanketPoApi.upload(formData);

      setResult({
        header: data.header,
        lines: data.lines || [],
        errors: data.errors || []
      });
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "Failed to build blanket PO.");
      setResult({ header: null, lines: [], errors: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FileUpload
        loading={loading}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
      />
      <ValidationResults errors={result.errors} submitError={submitError} />
      <BlanketPreview header={result.header} lines={result.lines} />
    </div>
  );
}
