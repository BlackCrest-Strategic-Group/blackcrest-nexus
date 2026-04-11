import React from "react";

/**
 * Section — reusable page section wrapper.
 *
 * Props:
 *   eyebrow   {string}          — small label above the title
 *   title     {string}          — section heading
 *   subtitle  {string}          — supporting description
 *   variant   {""|"darker"}     — background variant
 *   headerAlign {"center"|"left"} — header alignment (default "center")
 *   size      {""|"sm"}         — padding size
 *   children  {ReactNode}
 */
export default function Section({
  eyebrow,
  title,
  subtitle,
  variant = "",
  headerAlign = "center",
  size = "",
  children,
}) {
  const sectionClass = [
    "mkt-section",
    variant === "darker" ? "mkt-section--darker" : "",
    size === "sm" ? "mkt-section--sm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const headerClass = [
    "mkt-section__header",
    headerAlign === "left" ? "mkt-section__header--left" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass}>
      <div className="mkt-section__inner">
        {(eyebrow || title || subtitle) && (
          <div className={headerClass}>
            {eyebrow && <div className="mkt-section__eyebrow">{eyebrow}</div>}
            {title && <h2 className="mkt-section__title">{title}</h2>}
            {subtitle && <p className="mkt-section__subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
