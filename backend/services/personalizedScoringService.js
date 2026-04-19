function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function overlapRatio(left, right) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  if (!leftSet.size || !rightSet.size) return 0;
  let overlap = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) overlap += 1;
  }
  return overlap / Math.max(leftSet.size, rightSet.size);
}

function buildWeights(preferences = {}) {
  const weights = {
    win: 0.4,
    margin: 0.3,
    strategic: 0.3
  };

  if (preferences.riskTolerance === "safe") {
    weights.win = 0.55;
    weights.margin = 0.2;
    weights.strategic = 0.25;
  } else if (preferences.riskTolerance === "aggressive") {
    weights.win = 0.3;
    weights.margin = 0.3;
    weights.strategic = 0.4;
  }

  if (preferences.marginPreference === "high") {
    weights.margin += 0.15;
    weights.win -= 0.05;
    weights.strategic -= 0.1;
  }

  return weights;
}

export function scoreOpportunityForUser(opportunity, profile, preferences) {
  const companyNaics = profile?.naicsCodes || [];
  const naicsMatch = companyNaics.includes(opportunity.naicsCode) ? 1 : companyNaics.some((n) => opportunity.naicsCode?.startsWith(n.slice(0, 4))) ? 0.6 : 0.1;

  const capTokens = tokenize(`${profile?.capabilitiesText || ""} ${(profile?.capabilityTags || []).join(" ")}`);
  const oppTokens = tokenize(`${opportunity.title || ""} ${opportunity.description || ""}`);
  const capabilitySimilarity = overlapRatio(capTokens, oppTokens);

  const maxContract = Number(profile?.capacityIndicators?.maxContractSize || 0);
  const oppValue = Number(opportunity.estimatedValue || 0);
  const sizeFit = maxContract > 0 && oppValue > 0 ? Math.max(0, 1 - Math.abs(oppValue - maxContract) / maxContract) : 0.5;

  const winProbability = clamp((naicsMatch * 45 + capabilitySimilarity * 35 + sizeFit * 20) * (preferences.riskTolerance === "safe" ? 1.05 : 1));

  let marginBase = oppValue > 5_000_000 ? 45 : oppValue > 1_000_000 ? 60 : 75;
  if (String(opportunity.contractType || "").toLowerCase().includes("time")) marginBase -= 10;
  if (preferences.marginPreference === "high") marginBase -= marginBase < 60 ? 15 : 0;
  if (preferences.marginPreference === "low") marginBase += 8;
  const marginScore = clamp(marginBase);

  const agencyMatch = (preferences.agenciesOfInterest || profile.targetAgencies || []).some((agency) =>
    String(opportunity.agency || "").toLowerCase().includes(String(agency).toLowerCase())
  )
    ? 1
    : 0.4;
  const goalBoost = preferences.growthGoal === "expansion" && !agencyMatch ? 0.8 : preferences.growthGoal === "margin" ? marginScore / 100 : 1;
  const repeatPotential = ["IDIQ", "BPA"].some((t) => String(opportunity.contractType || "").toUpperCase().includes(t)) ? 1 : 0.55;

  const strategicFit = clamp((agencyMatch * 45 + goalBoost * 25 + repeatPotential * 30));

  const weights = buildWeights(preferences);
  const composite = clamp(winProbability * weights.win + marginScore * weights.margin + strategicFit * weights.strategic);

  const riskFlags = [];
  if (marginScore < 50) riskFlags.push("LOW MARGIN");
  if (winProbability < 45) riskFlags.push("HIGH COMPETITION");
  if (maxContract > 0 && oppValue > maxContract * 1.2) riskFlags.push("OUTSIDE CAPACITY");

  let recommendation = "IGNORE";
  if (composite >= 72 && winProbability >= 65) recommendation = "PURSUE";
  else if ((preferences.willingnessToPartner && composite >= 55) || riskFlags.includes("OUTSIDE CAPACITY")) recommendation = "PARTNER";

  const reasoning = `${recommendation === "PURSUE" ? "Go win this." : recommendation === "PARTNER" ? "Good upside, but you need coverage." : "Skip and preserve bid bandwidth."} NAICS fit ${Math.round(naicsMatch * 100)}%, capability overlap ${Math.round(capabilitySimilarity * 100)}%, contract size fit ${Math.round(sizeFit * 100)}%.`;

  return { winProbability, marginScore, strategicFit, composite, recommendation, reasoning, riskFlags, weights };
}
