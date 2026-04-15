import React from "react";

export default function ValidationResults({ errors = [], submitError = "" }) {
  if (!submitError && errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {submitError && <div className="alert-error">{submitError}</div>}

      {errors.length > 0 && (
        <div className="card border-red-200">
          <h3 className="section-title text-red-700">Validation Errors</h3>
          <ul className="mt-3 space-y-2 text-sm text-red-700 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={`${error.rowNumber || "global"}-${index}`}>
                {error.rowNumber ? `Row ${error.rowNumber}: ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
