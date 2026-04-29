import { connectDB } from './backend/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './server/app.js';
import { errorHandler, notFoundHandler } from './server/middleware/errorHandler.js';
import { seedRoleDemoUsers } from './server/services/demoUserService.js';
import { loadEnv } from './backend/utils/loadEnv.js';

loadEnv();

if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

if (process.env.MONGODB_URI) {
  try {
    await connectDB();
    await seedRoleDemoUsers();
  } catch (error) {
    console.warn(`Mongo connection unavailable: ${error.message}`);
  }
} else {
  console.warn('MONGODB_URI not set. API will run with limited persistence.');
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. AI intelligence features will run in fallback mode.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildCandidates = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'frontend', 'dist'),
  path.join(__dirname, 'frontend', 'web-build'),
  path.join(__dirname, 'frontend', 'build')
];
const frontendBuildPath = frontendBuildCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, 'index.html'))
) ?? path.join(__dirname, 'frontend', 'dist');

const siteUrl = (process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'https://blackcrestai.com').replace(/\/$/, '');
const defaultSeo = {
  title: 'BlackCrest OS | AI Procurement Intelligence Platform',
  description: 'BlackCrest OS is an AI procurement intelligence platform for supplier risk, sourcing decisions, proposal readiness, and GovCon opportunity analysis.',
  keywords: 'procurement intelligence software, AI procurement platform, supplier risk software, GovCon AI, proposal compliance software',
  path: '/'
};

const seoRoutes = {
  '/': defaultSeo,
  '/features': {
    title: 'AI Procurement Intelligence Platform Features | BlackCrest OS',
    description: 'Explore BlackCrest OS features for supplier intelligence, opportunity analysis, sourcing strategy, proposal readiness, and procurement decision support.',
    keywords: 'AI procurement software, procurement intelligence features, sourcing intelligence, supplier intelligence',
    path: '/features'
  },
  '/procurement-ai': {
    title: 'Procurement AI Software for Sourcing Teams | BlackCrest OS',
    description: 'Use procurement AI to qualify opportunities, monitor supplier risk, and support sourcing decisions with BlackCrest OS.',
    keywords: 'procurement AI, AI procurement software, procurement automation, sourcing AI',
    path: '/procurement-ai'
  },
  '/supplier-risk-software': {
    title: 'Supplier Risk Software for Procurement Teams | BlackCrest OS',
    description: 'BlackCrest OS helps procurement teams identify supplier risk, capability gaps, and sourcing exposure before execution breaks down.',
    keywords: 'supplier risk software, supplier intelligence, supplier risk management, procurement risk',
    path: '/supplier-risk-software'
  },
  '/government-contract-ai': {
    title: 'Government Contract AI for GovCon Procurement | BlackCrest OS',
    description: 'Evaluate GovCon opportunities, supplier readiness, and proposal execution risk with AI procurement intelligence built for government contracting teams.',
    keywords: 'government contract AI, GovCon AI, defense procurement software, SAM.gov opportunity analysis',
    path: '/government-contract-ai'
  },
  '/proposal-compliance-software': {
    title: 'Proposal Compliance Software for Bid Readiness | BlackCrest OS',
    description: 'Improve bid/no-bid discipline, proposal readiness, supplier coverage, and compliance workflows with BlackCrest OS proposal intelligence.',
    keywords: 'proposal compliance software, bid no bid software, proposal intelligence, GovCon proposal AI',
    path: '/proposal-compliance-software'
  },
  '/dfars-compliance-ai': {
    title: 'DFARS Compliance AI for Defense Contractors | BlackCrest OS',
    description: 'Support DFARS-aware procurement review and supplier readiness workflows with AI-powered GovCon procurement intelligence.',
    keywords: 'DFARS compliance AI, FAR DFARS software, defense contractor compliance, procurement compliance AI',
    path: '/dfars-compliance-ai'
  },
  '/supplier-intelligence': {
    title: 'Supplier Intelligence Software | BlackCrest OS',
    description: 'Analyze supplier fit, risk, and procurement signals with BlackCrest OS supplier intelligence tools.',
    keywords: 'supplier intelligence software, supplier analysis, supplier performance, procurement visibility',
    path: '/supplier-intelligence'
  },
  '/opportunity-intelligence': {
    title: 'Procurement Opportunity Intelligence | BlackCrest OS',
    description: 'Discover, qualify, and prioritize procurement opportunities faster with AI-powered opportunity intelligence from BlackCrest OS.',
    keywords: 'opportunity intelligence, procurement opportunity software, sourcing opportunity analysis',
    path: '/opportunity-intelligence'
  },
  '/sourcing-intelligence': {
    title: 'Sourcing Intelligence Software | BlackCrest OS',
    description: 'Support sourcing strategy and procurement execution with AI-powered sourcing intelligence from BlackCrest OS.',
    keywords: 'sourcing intelligence software, sourcing strategy, procurement sourcing AI',
    path: '/sourcing-intelligence'
  },
  '/proposal-intelligence': {
    title: 'Proposal Intelligence Software | BlackCrest OS',
    description: 'Strengthen proposal readiness and bid/no-bid decisions with procurement intelligence from BlackCrest OS.',
    keywords: 'proposal intelligence software, bid readiness, bid no bid, proposal risk analysis',
    path: '/proposal-intelligence'
  },
  '/government-contracting': {
    title: 'Defense & GovCon Procurement Intelligence | BlackCrest OS',
    description: 'Procurement intelligence for defense contractors and GovCon teams managing complex sourcing and supplier workflows.',
    keywords: 'GovCon procurement, defense procurement software, government contracting software',
    path: '/government-contracting'
  },
  '/global-intelligence': {
    title: 'Global Procurement Intelligence Platform | BlackCrest OS',
    description: 'BlackCrest OS supports global procurement intelligence across supplier risk, sourcing visibility, opportunity analysis, and decision workflows.',
    keywords: 'global procurement intelligence, procurement operating system, supplier risk intelligence, sourcing visibility',
    path: '/global-intelligence'
  },
  '/sentinel': {
    title: 'Sentinel AI Governance Layer for Procurement | BlackCrest OS',
    description: 'Sentinel brings governance, confidentiality controls, and enterprise-safe decision support to BlackCrest OS procurement intelligence.',
    keywords: 'AI governance procurement, procurement data governance, enterprise AI governance, Sentinel governance layer',
    path: '/sentinel'
  },
  '/security': {
    title: 'Security & Data Boundaries | BlackCrest OS',
    description: 'Review BlackCrest OS security posture, non-classified use boundaries, and enterprise procurement AI governance principles.',
    keywords: 'procurement AI security, AI data governance, non-classified procurement software',
    path: '/security'
  },
  '/pricing': {
    title: 'Pricing | BlackCrest OS Procurement Intelligence',
    description: 'Review BlackCrest OS procurement intelligence pricing options for sourcing teams, GovCon operators, and growing procurement organizations.',
    keywords: 'procurement software pricing, AI procurement pricing, GovCon software pricing',
    path: '/pricing'
  },
  '/contact': {
    title: 'Contact BlackCrest OS | Procurement Intelligence Demo',
    description: 'Contact BlackCrest OS to discuss AI procurement intelligence, supplier risk workflows, GovCon opportunity analysis, and sourcing visibility.',
    keywords: 'procurement intelligence demo, AI procurement demo, BlackCrest contact',
    path: '/contact'
  },
  '/insights': {
    title: 'Procurement Intelligence Insights | BlackCrest OS',
    description: 'Read practical procurement intelligence articles covering supplier risk, sourcing, opportunity analysis, and AI for GovCon teams.',
    keywords: 'procurement intelligence articles, supplier risk insights, GovCon AI insights',
    path: '/insights'
  }
};

const protectedPaths = [
  '/dashboard',
  '/opportunities',
  '/suppliers',
  '/intelligence',
  '/analytics',
  '/settings',
  '/mfa-settings',
  '/mfa-setup',
  '/global-intelligence-platform',
  '/erp-connector-center',
  '/report-center',
  '/blanket-po-builder',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getSeoForPath(requestPath) {
  const cleanPath = requestPath.split('?')[0].replace(/\/$/, '') || '/';
  return seoRoutes[cleanPath] || defaultSeo;
}

function buildSchema(seo) {
  const url = `${siteUrl}${seo.path}`;
  return JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'BlackCrest OS',
      url: siteUrl,
      description: defaultSeo.description,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: process.env.PUBLIC_CONTACT_EMAIL || 'demo@blackcrestai.com'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'BlackCrest OS',
      url: siteUrl
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'BlackCrest OS',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url,
      description: seo.description,
      offers: {
        '@type': 'Offer',
        url: `${siteUrl}/pricing`,
        priceCurrency: 'USD'
      }
    }
  ]);
}

function renderIndexForPath(requestPath) {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const seo = getSeoForPath(requestPath);
  const canonicalUrl = `${siteUrl}${seo.path}`;
  const escapedTitle = escapeHtml(seo.title);
  const escapedDescription = escapeHtml(seo.description);
  const escapedKeywords = escapeHtml(seo.keywords || defaultSeo.keywords);
  const schema = buildSchema(seo);

  let nextHtml = html
    .replace(/<title>.*?<\/title>/s, `<title>${escapedTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/s, `<meta name="description" content="${escapedDescription}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/s, `<meta property="og:title" content="${escapedTitle}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/s, `<meta property="og:description" content="${escapedDescription}" />`);

  const seoTags = `
    <meta name="keywords" content="${escapedKeywords}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="BlackCrest OS" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <script type="application/ld+json">${schema}</script>`;

  if (!nextHtml.includes('rel="canonical"')) {
    nextHtml = nextHtml.replace('</head>', `${seoTags}\n  </head>`);
  }

  return nextHtml;
}

function buildSitemapXml() {
  const urls = Object.values(seoRoutes)
    .filter((route, index, routes) => routes.findIndex((item) => item.path === route.path) === index)
    .map((route) => `  <url><loc>${siteUrl}${route.path}</loc><changefreq>weekly</changefreq><priority>${route.path === '/' ? '1.0' : '0.8'}</priority></url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobotsTxt() {
  const disallows = protectedPaths.map((route) => `Disallow: ${route}`).join('\n');
  return `User-agent: *\nAllow: /\n${disallows}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml').send(buildSitemapXml());
});

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(buildRobotsTxt());
});

app.use(express.static(frontendBuildPath));
app.get('/', (req, res) => res.type('html').send(renderIndexForPath(req.path)));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (path.extname(req.path)) return res.status(404).end();
  return res.type('html').send(renderIndexForPath(req.path));
});
app.use('/api', notFoundHandler);
app.use(errorHandler);

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`BlackCrest Procurement Intelligence Platform running on ${PORT}`);
  console.log(`Listening on http://${HOST}:${PORT}`);
  console.log(`Frontend build path: ${frontendBuildPath}`);
});
