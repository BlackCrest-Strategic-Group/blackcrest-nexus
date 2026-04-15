import React from "react";

export default function ValidationResults({ validationErrors = [], warnings = [] }) {
  if (!validationErrors.length && !warnings.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {validationErrors.length > 0 && (
        <div className="card border-red-200">
          <h3 className="section-title text-red-700">Validation Errors</h3>
          <ul className="mt-3 space-y-2 text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={`validation-${error.rowNumber || "global"}-${index}`}>
                {error.rowNumber ? `Row ${error.rowNumber}: ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="card border-amber-200">
          <h3 className="section-title text-amber-700">Warnings</h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-700 list-disc list-inside">
            {warnings.map((warning, index) => (
              <li key={`warning-${warning.rowNumber || "global"}-${index}`}>
                {warning.rowNumber ? `Row ${warning.rowNumber}: ` : ""}
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
