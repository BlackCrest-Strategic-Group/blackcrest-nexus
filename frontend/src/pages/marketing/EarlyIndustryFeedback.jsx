import React from 'react';
import './early-feedback.css';

export default function EarlyIndustryFeedback() {
  return (
    <section className="early-feedback" aria-labelledby="early-feedback-title">
      <div className="nexus-container">
        <div className="early-feedback__header">
          <p className="early-feedback__eyebrow">Trusted Early Feedback</p>
          <h2 id="early-feedback-title">Industry Validation</h2>
          <p className="early-feedback__subtitle">
            BlackCrest Nexus is actively being refined with feedback from procurement and sourcing professionals.
          </p>
        </div>

        <article className="early-feedback__card" aria-label="Early industry testimonial">
          <div className="early-feedback__quote-mark" aria-hidden="true">“</div>
          <div className="early-feedback__content">
            <p className="early-feedback__quote">
              The procurement intelligence OS is helpful and very good.
            </p>
            <div className="early-feedback__author-row">
              <div className="early-feedback__avatar" aria-hidden="true">LL</div>
              <div>
                <p className="early-feedback__name">Leonard Lugumisa</p>
                <p className="early-feedback__role">Procurement &amp; Supply Chain Professional</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
