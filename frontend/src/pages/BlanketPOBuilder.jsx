import React, { useState } from "react";
import BlanketPreview from "../components/blanketpo/BlanketPreview.jsx";
import FileUpload from "../components/blanketpo/FileUpload.jsx";
import ValidationResults from "../components/blanketpo/ValidationResults.jsx";
import { blanketPoApi } from "../utils/api.js";

function downloadBlob({ content, type, filename }) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function BlanketPOBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [erpExporting, setErpExporting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [result, setResult] = useState({
    blankets: [],
    validationErrors: [],
    warnings: [],
    summary: { suppliers: 0, totalItems: 0, totalReleases: 0, totalValue: 0 }
  });

  async function handleUpload(file) {
    setLoading(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await blanketPoApi.upload(formData);
      if (data.engine === "external-blanket-builder") {
        setStatusMessage("Processed by external blanket PO builder service.");
      } else {
        setStatusMessage("Processed by local blanket PO engine.");
      }
      setResult({
        blankets: data.blankets || [],
        validationErrors: data.validationErrors || [],
        warnings: data.warnings || [],
        summary: data.summary || { suppliers: 0, totalItems: 0, totalReleases: 0, totalValue: 0 }
      });
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "Failed to build blanket PO preview.");
      setStatusMessage("");
      setResult({
        blankets: [],
        validationErrors: [],
        warnings: [],
        summary: { suppliers: 0, totalItems: 0, totalReleases: 0, totalValue: 0 }
      });
    } finally {
      setLoading(false);
    }
  }

  function handleExportJson() {
    downloadBlob({
      content: JSON.stringify(result, null, 2),
      type: "application/json",
      filename: "blanket-po-preview.json"
    });
  }

  async function handleExportCsv() {
    try {
      const response = await blanketPoApi.exportCsv({ blankets: result.blankets });
      downloadBlob({
        content: response.data,
        type: "text/csv",
        filename: "blanket-po-preview.csv"
      });
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "CSV export failed.");
    }
  }

  async function handleExportErp() {
    const provider = window.prompt("Enter ERP provider (sap, oracle, infor, dynamics):", "sap");
    if (!provider) return;
    setSubmitError("");
    setErpExporting(true);
    try {
      const { data } = await blanketPoApi.exportErp(provider.toLowerCase(), { blankets: result.blankets });
      downloadBlob({
        content: JSON.stringify(data, null, 2),
        type: "application/json",
        filename: `blanket-po-${provider.toLowerCase()}-payload.json`
      });
      setStatusMessage(`ERP payload exported for ${provider.toUpperCase()}.`);
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "ERP export failed.");
    } finally {
      setErpExporting(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <h2 className="section-title">Blanket PO Builder</h2>
        <p className="section-subtitle mt-1">
          Upload spreadsheet data, validate mapped columns, and preview supplier/item blanket structures.
        </p>
        <div className="mt-5">
          <FileUpload onSubmit={handleUpload} loading={loading} />
        </div>
        {statusMessage && <div className="alert-success mt-4">{statusMessage}</div>}
        {submitError && <div className="alert-error mt-4">{submitError}</div>}
      </div>

      <ValidationResults
        validationErrors={result.validationErrors}
        warnings={result.warnings}
      />

      <BlanketPreview
        blankets={result.blankets}
        summary={result.summary}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onExportErp={handleExportErp}
        erpExporting={erpExporting}
      />
    </div>
  );
}
