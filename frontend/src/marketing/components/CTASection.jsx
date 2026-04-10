import React from "react";

/**
 * CTASection — full-width call-to-action section.
 *
 * Props:
 *   title    {string}                      — headline
 *   subtitle {string}                      — supporting copy
 *   actions  {Array<{label, href, variant}>} — buttons
 */
export default function CTASection({ title, subtitle, actions = [] }) {
  return (
    <section className="mkt-cta">
      <div className="mkt-cta__inner">
        <h2 className="mkt-cta__title">{title}</h2>
        {subtitle && <p className="mkt-cta__subtitle">{subtitle}</p>}
        {actions.length > 0 && (
          <div className="mkt-cta__actions">
            {actions.map((action, i) => (
              <a
                key={i}
                href={action.href}
                className={`mkt-btn mkt-btn--lg ${action.variant === "outline" ? "mkt-btn--outline" : "mkt-btn--primary"}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
