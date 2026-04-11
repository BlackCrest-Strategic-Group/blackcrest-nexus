/**
 * Compliance Rules Service
 *
 * Checks whether a company is eligible to pursue a given opportunity
 * based on NAICS code alignment and set-aside program compatibility.
 */

// Set-aside types that require the company to hold a specific status
const SET_ASIDE_REQUIREMENTS = {
  "small business set-aside": ["small business", "sb"],
  "8(a)": ["8(a)", "8a"],
  hubzone: ["hubzone"],
  sdvosb: ["sdvosb", "service-disabled veteran-owned"],
  wosb: ["wosb", "women-owned small business"],
  edwosb: ["edwosb", "economically disadvantaged women-owned"],
  vosb: ["vosb", "veteran-owned small business"]
};

/**
 * @param {object} opportunity - The opportunity being evaluated.
 *   @param {string[]} opportunity.naicsCodes     - NAICS codes on the solicitation.
 *   @param {string}   opportunity.setAside       - Set-aside designation (if any).
 * @param {object} companyProfile - The company's profile.
 *   @param {string[]} companyProfile.naicsCodes  - NAICS codes the company is registered for.
 *   @param {string[]} companyProfile.setAsideStatus - Company's set-aside certifications.
 * @returns {{ compliant: boolean, flags: string[] }}
 */
export function checkCompliance(opportunity = {}, companyProfile = {}) {
  const flags = [];

  const oppNaics = Array.isArray(opportunity.naicsCodes)
    ? opportunity.naicsCodes.map(String)
    : [];
  const companyNaics = Array.isArray(companyProfile.naicsCodes)
    ? companyProfile.naicsCodes.map(String)
    : [];

  // ── NAICS match check ───────────────────────────────────────────
  if (oppNaics.length > 0) {
    const hasNaicsMatch = oppNaics.some((code) => companyNaics.includes(code));
    if (!hasNaicsMatch) {
      flags.push(
        `NAICS mismatch: opportunity requires [${oppNaics.join(", ")}] but company has [${companyNaics.join(", ")}]`
      );
    }
  }

  // ── Set-aside compatibility check ───────────────────────────────
  const opportunitySetAside = (opportunity.setAside || "").toLowerCase().trim();
  if (opportunitySetAside) {
    const companyStatuses = (companyProfile.setAsideStatus || []).map((s) =>
      s.toLowerCase().trim()
    );

    let setAsideSatisfied = false;
    for (const [requirementKey, aliases] of Object.entries(SET_ASIDE_REQUIREMENTS)) {
      // Match opportunity set-aside against the requirement key or any of its aliases
      // Use word-boundary-aware matching to avoid "sb" matching "sdvosb"
      const oppMatchesRequirement =
        opportunitySetAside === requirementKey ||
        aliases.some(
          (alias) =>
            opportunitySetAside === alias ||
            opportunitySetAside === alias.replace(/-/g, " ")
        );

      if (oppMatchesRequirement) {
        // Company must hold at least one of the matching status aliases (exact match)
        setAsideSatisfied = companyStatuses.some((cs) =>
          aliases.some(
            (alias) => cs === alias || cs === alias.replace(/-/g, " ")
          )
        );
        if (!setAsideSatisfied) {
          flags.push(
            `Set-aside incompatibility: opportunity requires "${opportunity.setAside}" but company has [${companyProfile.setAsideStatus?.join(", ") || "none"}]`
          );
        }
        break;
      }
    }
  }

  return {
    compliant: flags.length === 0,
    flags
  };
}
