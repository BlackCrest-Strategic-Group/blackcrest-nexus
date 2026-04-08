/**
 * Proposal Generation Service
 *
 * Uses OpenAI GPT-4o-mini to generate professional GovCon proposal sections
 * based on opportunity details and company profile.
 */

import OpenAI from "openai";

const DEFAULT_SECTIONS = [
  { title: "Executive Summary", order: 1 },
  { title: "Technical Approach", order: 2 },
  { title: "Management Approach", order: 3 },
  { title: "Past Performance", order: 4 },
  { title: "Key Personnel", order: 5 },
  { title: "Quality Assurance Plan", order: 6 }
];

/**
 * Generate AI proposal sections for a GovCon opportunity.
 *
 * @param {object} params
 * @param {string} params.opportunityTitle - The opportunity/solicitation title
 * @param {string} params.agency - The procuring agency
 * @param {string} params.naicsCode - NAICS code
 * @param {string} params.setAside - Set-aside type (e.g., 8(a), SDVOSB)
 * @param {string} params.requirementSummary - Scope / SOW summary
 * @param {string} params.companyName - Contractor company name
 * @param {string} params.companyCapabilities - Comma-separated capabilities
 * @returns {Promise<Array<{title: string, content: string, order: number}>>}
 */
export async function generateProposalSections({
  opportunityTitle,
  agency,
  naicsCode,
  setAside,
  requirementSummary,
  companyName,
  companyCapabilities
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return DEFAULT_SECTIONS.map((s) => ({
      ...s,
      content: generateFallbackContent(s.title, {
        opportunityTitle, agency, companyName, requirementSummary
      })
    }));
  }

  const openai = new OpenAI({ apiKey });

  const context = [
    opportunityTitle && `Opportunity: ${opportunityTitle}`,
    agency && `Agency: ${agency}`,
    naicsCode && `NAICS: ${naicsCode}`,
    setAside && `Set-Aside: ${setAside}`,
    requirementSummary && `Requirements: ${requirementSummary}`,
    companyName && `Offeror: ${companyName}`,
    companyCapabilities && `Capabilities: ${companyCapabilities}`
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `You are an expert GovCon proposal writer with 20+ years of experience writing winning federal government proposals. Write professional, compliant, and compelling proposal sections. Use clear, active language. Reference FAR/DFARS requirements where appropriate. Be specific and results-oriented. Write in a formal but accessible tone.`;

  const sections = await Promise.all(
    DEFAULT_SECTIONS.map(async (section) => {
      try {
        const userPrompt = buildSectionPrompt(section.title, context);

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 600,
          temperature: 0.5
        });

        const content =
          completion.choices[0]?.message?.content?.trim() ||
          generateFallbackContent(section.title, { opportunityTitle, agency, companyName, requirementSummary });

        return { title: section.title, content, order: section.order };
      } catch {
        return {
          title: section.title,
          content: generateFallbackContent(section.title, {
            opportunityTitle, agency, companyName, requirementSummary
          }),
          order: section.order
        };
      }
    })
  );

  return sections;
}

function buildSectionPrompt(sectionTitle, context) {
  const prompts = {
    "Executive Summary":
      `Write a compelling Executive Summary (3-4 paragraphs) for a government proposal.\n\nContext:\n${context}\n\nHighlight: why the offeror is uniquely qualified, understanding of the requirement, value proposition, and commitment to mission success.`,
    "Technical Approach":
      `Write a detailed Technical Approach section (4-5 paragraphs) for a government proposal.\n\nContext:\n${context}\n\nCover: methodology, tools/technologies, innovative solutions, compliance with requirements, and measurable deliverables.`,
    "Management Approach":
      `Write a Management Approach section (3-4 paragraphs) for a government proposal.\n\nContext:\n${context}\n\nCover: organizational structure, project management methodology (e.g., Agile/PMBOK), communication plan, risk management, and transition plan.`,
    "Past Performance":
      `Write a Past Performance section (3-4 paragraphs) for a government proposal.\n\nContext:\n${context}\n\nHighlight: relevant past contracts, performance metrics, on-time delivery, and customer satisfaction. Describe 2-3 relevant example contract vehicles.`,
    "Key Personnel":
      `Write a Key Personnel section (3-4 paragraphs) for a government proposal.\n\nContext:\n${context}\n\nDescribe: the Program Manager, Technical Lead, and key subject matter experts. Highlight clearances, certifications, and relevant experience.`,
    "Quality Assurance Plan":
      `Write a Quality Assurance Plan section (3 paragraphs) for a government proposal.\n\nContext:\n${context}\n\nCover: QA methodology, ISO/CMMI standards if applicable, quality metrics, inspection procedures, and continuous improvement processes.`
  };

  return (
    prompts[sectionTitle] ||
    `Write the "${sectionTitle}" section for a government proposal. Context:\n${context}`
  );
}

function generateFallbackContent(sectionTitle, { opportunityTitle, agency, companyName, requirementSummary }) {
  const company = companyName || "Our company";
  const opp = opportunityTitle || "this government opportunity";
  const ag = agency || "the Government";

  const fallbacks = {
    "Executive Summary": `${company} is pleased to submit this proposal in response to ${opp}. We bring deep domain expertise, a proven track record of federal contract performance, and the technical capabilities required to exceed ${ag}'s mission objectives. Our team is fully committed to delivering on-time, on-budget results with the highest standards of quality and compliance.\n\nWe understand the critical nature of this requirement and have assembled a team uniquely qualified to address all technical, management, and performance challenges. Our approach combines proven methodologies with innovative solutions designed specifically for the government environment.\n\nUpon award, ${company} will mobilize within 30 days, ensuring seamless transition and immediate value delivery to ${ag}.`,
    "Technical Approach": `${company} will employ a structured, phased technical approach to fulfill the requirements of ${opp}. Our methodology is grounded in industry best practices including Agile project management, ISO 9001 quality standards, and NIST cybersecurity frameworks.\n\nPhase 1 – Requirements Analysis: Our team will conduct thorough stakeholder interviews and document review to ensure complete understanding of all technical requirements within the first 30 days.\n\nPhase 2 – Implementation: Leveraging our proven toolsets and certified personnel, we will deliver all required capabilities on schedule while maintaining full compliance with FAR 52.212-4 and applicable DFARS clauses.\n\nPhase 3 – Testing & Validation: Rigorous testing protocols will ensure all deliverables meet or exceed specified performance standards prior to government acceptance.`,
    "Management Approach": `${company} will assign a dedicated Program Manager with full authority and accountability for contract performance. Our management structure ensures clear lines of communication, rapid decision-making, and proactive risk mitigation.\n\nWe will utilize a Contractor Program Management Plan (CPMP) reviewed and updated quarterly, providing ${ag} full visibility into schedule, cost, and performance status. Weekly status reports and monthly program reviews will maintain alignment with government priorities.\n\nOur risk management framework identifies, tracks, and mitigates performance risks through a structured risk register reviewed at all program reviews.`,
    "Past Performance": `${company} has successfully delivered similar services to multiple federal agencies, demonstrating consistent on-time, on-budget performance with high customer satisfaction ratings.\n\nContract Reference 1: Prime contract supporting IT modernization for a civilian agency – 98% on-time delivery, 0 critical deficiencies over 3 years.\n\nContract Reference 2: IDIQ task order supporting program management and technical services – Rated "Exceptional" in final CPARS evaluation.\n\nOur strong past performance record reflects our commitment to mission success and our deep understanding of federal contracting requirements.`,
    "Key Personnel": `${company}'s Program Manager brings 15+ years of federal contracting experience, PMP certification, and a proven record of delivering complex, multi-disciplinary programs on time and within budget.\n\nOur Technical Lead holds relevant certifications and active security clearances, with deep expertise in the technical domains required by this solicitation. Subject matter experts on the team average 10+ years of directly relevant federal experience.\n\nAll key personnel are committed for the full period of performance and will not be substituted without government approval per FAR 52.237-10.`,
    "Quality Assurance Plan": `${company} maintains a formal Quality Assurance program aligned with ISO 9001:2015 standards. Our QA Plan establishes clear quality objectives, inspection criteria, and continuous improvement processes for all contract deliverables.\n\nQuality metrics tracked include: defect density, rework rates, on-time delivery percentage, and customer satisfaction scores. All deviations from quality standards are documented in a corrective action tracking system.\n\nWe conduct internal quality audits quarterly and will welcome government surveillance activities at any time.`
  };

  return fallbacks[sectionTitle] || `This section provides detailed information about ${sectionTitle.toLowerCase()} for ${opp}. ${company} is committed to delivering excellence in all aspects of contract performance for ${ag}.`;
}
