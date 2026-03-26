### Changes Made
- Added support for sponsored supplier visibility in the "Find Suppliers" feature.
- Maintained existing matching logic based on NAICS, keyword matching, location, govReady, and supplier performance.
- Introduced new supplier fields: `isSponsored`, `sponsorTier`, and `boostScore`.
- Calculated a `baseScore` using relevance factors and applied a sponsored boost only if the `baseScore` is at least 70, with a cap of 10 points.
- Returned both `baseScore` and `finalScore`, including a `sponsoredLabel` field for display.
- Ensured high-relevance suppliers are not overtaken by lower-quality matches due to sponsorship.
- Supported mixed ranking with capped sponsored boosts or a separate "Featured Suppliers" section.
- Updated supplier cards on the frontend to show a "Sponsored" badge when applicable.
- Kept the implementation simple and consistent with the GovCon AI codebase.

### Files Updated
- **`backend/services/findSuppliersService.js`**: Updated to include new logic for sponsored suppliers and base score calculations.
- **`frontend/src/components/AnalysisResults.jsx`**: Updated to handle new fields and update the display for sponsored suppliers.  

### Testing Instructions
1. Conduct API testing with various suppliers to verify the correctness of supplier ranking.
2. Verify that sponsored suppliers display correctly, showing the "Sponsored" badge where applicable.

### Assumptions
- Assumed that rankings are based on a combined score of relevance and sponsorship as described above.