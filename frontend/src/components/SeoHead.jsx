import { useEffect } from 'react';

export default function SeoHead({
  title,
  description,
  canonicalPath,
  image = '/assets/logo.png',
  robots = 'index, follow',
  schemas = []
}) {
  useEffect(() => {
    if (title) document.title = title;

    const upsertMeta = (selector, attr, value, content) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
      if (content !== undefined) el.setAttribute('content', content);
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
      upsertMeta('meta[name="description"]', 'name', 'description', description);
    }
    upsertMeta('meta[name="robots"]', 'name', 'robots', robots);

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title || 'BlackCrest OS');
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description || 'AI Procurement Intelligence Platform');
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', `${origin}${image}`);

    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title || 'BlackCrest OS');
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description || 'AI Procurement Intelligence Platform');
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', `${origin}${image}`);

    Array.from(document.head.querySelectorAll('script[data-schema="blackcrest"]')).forEach((el) => el.remove());

    schemas.forEach((schema) => {
      const schemaEl = document.createElement('script');
      schemaEl.type = 'application/ld+json';
      schemaEl.dataset.schema = 'blackcrest';
      schemaEl.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaEl);
    });

    return () => {
      Array.from(document.head.querySelectorAll('script[data-schema="blackcrest"]')).forEach((el) => el.remove());
    };
  }, [title, description, canonicalPath, image, robots, schemas]);

  return null;
}
