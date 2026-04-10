import React from "react";

/**
 * Hero — reusable hero section for marketing pages.
 *
 * Props:
 *   eyebrow   {string}              — small label above the title
 *   title     {string|ReactNode}    — main headline
 *   subtitle  {string}              — supporting copy
 *   actions   {Array<{label, href, variant}>} — CTA buttons
 *   align     {"center"|"left"}     — text alignment (default "center")
 */
export default function Hero({ eyebrow, title, subtitle, actions = [], align = "center" }) {
  const heroClass = ["mkt-hero", align === "left" ? "mkt-hero--left" : ""].filter(Boolean).join(" ");

  return (
    <section className={heroClass}>
      <div className="mkt-hero__inner">
        {eyebrow && <div className="mkt-hero__eyebrow">{eyebrow}</div>}
        <h1 className="mkt-hero__title">{title}</h1>
        {subtitle && <p className="mkt-hero__subtitle">{subtitle}</p>}
        {actions.length > 0 && (
          <div className="mkt-hero__actions">
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
