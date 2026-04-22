export const SITE_URL = 'https://blackcrest.ai';

export const defaultOrgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BlackCrest OS',
  url: SITE_URL,
  logo: `${SITE_URL}/logos/blackcrest-logo.svg`,
  description: 'BlackCrest OS is an AI Procurement Intelligence Platform for opportunity analysis, supplier visibility, and sourcing decisions.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'demo@blackcrest.ai'
  }
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BlackCrest OS',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/insights?query={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
};

export function softwareSchema({ pageUrl, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BlackCrest OS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: pageUrl,
    description
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`
    }))
  };
}

export function articleSchema({ headline, description, path, datePublished, dateModified, authorName }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'BlackCrest OS',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logos/blackcrest-logo.svg`
      }
    },
    datePublished,
    dateModified,
    mainEntityOfPage: `${SITE_URL}${path}`
  };
}
