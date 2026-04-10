import React from "react";

/**
 * ProductCard — card highlighting a product or division.
 *
 * Props:
 *   icon        {string}   — emoji or character icon
 *   badge       {string}   — optional badge label (e.g. "Pre-Award")
 *   title       {string}   — product name
 *   description {string}   — short description
 *   href        {string}   — link target
 *   linkLabel   {string}   — link text (default "Learn more")
 *   accentClass {string}   — extra CSS class for accent styling (labs use)
 */
export default function ProductCard({
  icon,
  badge,
  title,
  description,
  href,
  linkLabel = "Learn more",
  accentClass = "",
}) {
  const cardClass = ["mkt-card", href ? "mkt-card--link" : "", accentClass]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && <div className="mkt-card__icon">{icon}</div>}
      {badge && <span className="mkt-card__badge">{badge}</span>}
      <div className="mkt-card__title">{title}</div>
      <p className="mkt-card__description">{description}</p>
      {href && (
        <span className="mkt-card__link">
          {linkLabel} →
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cardClass}>
        {content}
      </a>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
