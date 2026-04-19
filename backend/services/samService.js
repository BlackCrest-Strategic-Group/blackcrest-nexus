import Opportunity from "../models/Opportunity.js";

export async function getOpportunityContext({ noticeId, text, title, naicsCode, contractValue }) {
  if (text && String(text).trim().length > 0) {
    return {
      title: title || "Uploaded Opportunity",
      naicsCode: naicsCode || "",
      contractValue: Number(contractValue || 0),
      text: String(text),
    };
  }

  if (!noticeId) {
    return { title: title || "Untitled Opportunity", naicsCode: naicsCode || "", contractValue: Number(contractValue || 0), text: "" };
  }

  const opp = await Opportunity.findOne({ noticeId });
  if (!opp) {
    return { title: title || "Unknown Opportunity", naicsCode: naicsCode || "", contractValue: Number(contractValue || 0), text: "" };
  }

  return {
    title: title || opp.title,
    naicsCode: naicsCode || opp.naicsCode || "",
    contractValue: Number(contractValue || opp.estimatedValue || 0),
    text: opp.description || "",
    opportunityId: opp._id,
  };
}
