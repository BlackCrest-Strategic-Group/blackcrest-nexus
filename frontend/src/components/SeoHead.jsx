import { useEffect } from 'react';

export default function SeoHead({ title, description, canonicalPath, image = '/assets/logo.png', schema }) {
  useEffect(() => {
    if (title) document.title = title;

    const upsert = (selector, attr, value) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
      return el;
    };

    const setLink = (rel, href) => {
      let el = document.head.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const origin = window.location.origin;
    const canonical = canonicalPath ? `${origin}${canonicalPath}` : window.location.href;
    setLink('canonical', canonical);

    if (description) {
      upsert('meta[name="description"]', 'name', 'description').setAttribute('content', description);
    }

    upsert('meta[property="og:title"]', 'property', 'og:title').setAttribute('content', title || 'BlackCrest OS');
    upsert('meta[property="og:description"]', 'property', 'og:description').setAttribute('content', description || 'Procurement Intelligence Operating System');
    upsert('meta[property="og:type"]', 'property', 'og:type').setAttribute('content', 'website');
    upsert('meta[property="og:url"]', 'property', 'og:url').setAttribute('content', canonical);
    upsert('meta[property="og:image"]', 'property', 'og:image').setAttribute('content', `${origin}${image}`);

    upsert('meta[name="twitter:card"]', 'name', 'twitter:card').setAttribute('content', 'summary_large_image');
    upsert('meta[name="twitter:title"]', 'name', 'twitter:title').setAttribute('content', title || 'BlackCrest OS');
    upsert('meta[name="twitter:description"]', 'name', 'twitter:description').setAttribute('content', description || 'Procurement Intelligence Operating System');
    upsert('meta[name="twitter:image"]', 'name', 'twitter:image').setAttribute('content', `${origin}${image}`);

    let schemaEl = document.head.querySelector('script[data-schema="blackcrest"]');
    if (!schemaEl) {
      schemaEl = document.createElement('script');
      schemaEl.type = 'application/ld+json';
      schemaEl.dataset.schema = 'blackcrest';
      document.head.appendChild(schemaEl);
    }
    schemaEl.textContent = JSON.stringify(schema || {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'BlackCrest OS',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: description || 'AI-Powered Procurement, Supplier, and Opportunity Intelligence'
    });
  }, [title, description, canonicalPath, image, schema]);

  return null;
}
