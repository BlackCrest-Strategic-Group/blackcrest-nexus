import React from "react";

export default function FileUpload({ loading, onSubmit, onFileChange }) {
  return (
    <div className="card">
      <h2 className="section-title">Blanket PO Builder</h2>
      <p className="section-subtitle mt-1">Upload an Excel file to validate and generate a structured blanket purchase order.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="blanket-po-file">Excel Upload (.xlsx, .xls)</label>
          <input
            id="blanket-po-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            className="input"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Processing..." : "Build Blanket PO"}
        </button>
      </form>
    </div>
  );
}
