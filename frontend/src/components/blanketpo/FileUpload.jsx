import React, { useState } from "react";

const ACCEPTED_FILE_TYPES = ".xlsx,.xls,.csv";

export default function FileUpload({ onSubmit, loading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select a spreadsheet file to continue.");
      return;
    }

    setError("");
    onSubmit(file);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="blanket-po-file">Upload Spreadsheet (.xlsx, .xls, .csv)</label>
        <input
          id="blanket-po-file"
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="input"
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Processing..." : "Build Blanket PO"}
      </button>
    </form>
  );
}
