import cron from "node-cron";
import Opportunity from "../models/Opportunity.js";
import { searchOpportunities, normalizeOpportunity } from "./samGov.js";
import { seedOpportunities } from "../data/seedOpportunities.js";

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function dateOffset(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function parseEstimatedValue(item = {}) {
  const direct = Number(item?.award?.amount || item?.awardAmount || item?.estimatedValue || item?.dollarAmount || 0);
  return Number.isFinite(direct) ? direct : 0;
}

export async function ingestOpportunities({ naics = [], keywords = [], agencies = [] } = {}) {
  const postedFrom = dateOffset(-14);
  const postedTo = dateOffset(0);
  const naicsFilters = asArray(naics);
  const keywordFilters = asArray(keywords);
  const agencyFilters = asArray(agencies).map((a) => a.toLowerCase());

  const batches = [];

  for (const naicsCode of naicsFilters.length ? naicsFilters : [undefined]) {
    for (const keyword of keywordFilters.length ? keywordFilters : [undefined]) {
      try {
        const response = await searchOpportunities({ postedFrom, postedTo, naics: naicsCode, keyword, limit: 100, page: 1 });
        batches.push(...(response?.opportunitiesData || response?.opportunities || []));
      } catch (error) {
        if (error.code === "MISSING_API_KEY") {
          await Opportunity.bulkWrite(
            seedOpportunities.map((seed) => ({
              updateOne: {
                filter: { noticeId: seed.noticeId },
                update: { $set: { ...seed, ingestBatchAt: new Date(), cachedAt: new Date() } },
                upsert: true
              }
            }))
          );
          return { usedSeedData: true, ingestedCount: seedOpportunities.length };
        }
        console.error("SAM ingestion batch failed:", error.message);
      }
    }
  }

  const normalized = batches
    .map((item) => {
      const base = normalizeOpportunity(item);
      return {
        ...base,
        description: item.description || item.additionalInfoLinkDescription || "",
        estimatedValue: parseEstimatedValue(item),
        source: "sam-gov",
        ingestBatchAt: new Date(),
        cachedAt: new Date()
      };
    })
    .filter((opp) => opp.noticeId)
    .filter((opp) => {
      if (!agencyFilters.length) return true;
      return agencyFilters.some((agency) => (opp.agency || "").toLowerCase().includes(agency));
    });

  if (!normalized.length) {
    return { usedSeedData: false, ingestedCount: 0 };
  }

  await Opportunity.bulkWrite(
    normalized.map((opp) => ({
      updateOne: {
        filter: { noticeId: opp.noticeId },
        update: { $set: opp },
        upsert: true
      }
    }))
  );

  return { usedSeedData: false, ingestedCount: normalized.length };
}

export function startOpportunityIngestionCron() {
  const cronExpr = process.env.OPPORTUNITY_CRON || "0 */6 * * *";
  if (!cron.validate(cronExpr)) {
    console.error(`[OpportunityIngestion] Invalid cron expression: ${cronExpr}`);
    return;
  }

  cron.schedule(cronExpr, async () => {
    try {
      const naics = asArray(process.env.INGEST_DEFAULT_NAICS);
      const keywords = asArray(process.env.INGEST_DEFAULT_KEYWORDS);
      const agencies = asArray(process.env.INGEST_DEFAULT_AGENCIES);
      const result = await ingestOpportunities({ naics, keywords, agencies });
      console.log(`[OpportunityIngestion] Completed: ${result.ingestedCount} ingested${result.usedSeedData ? " (seed)" : ""}`);
    } catch (error) {
      console.error("[OpportunityIngestion] Cron run failed:", error.message);
    }
  });
}
