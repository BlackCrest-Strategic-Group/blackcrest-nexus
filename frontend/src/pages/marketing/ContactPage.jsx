import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { breadcrumbSchema, defaultOrgSchema } from '../../utils/seo';

export default function ContactPage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="Contact BlackCrest OS | Request a Procurement Intelligence Demo"
        description="Request a demo of BlackCrest OS, the AI Procurement Intelligence Platform for sourcing and supplier decision support."
        canonicalPath="/contact"
        schemas={[defaultOrgSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])]}
      />
      <main className="container">
        <section className="hero-section no-bg">
          <h1>Request a Demo</h1>
          <p>Tell us about your procurement priorities and we will tailor a BlackCrest OS walkthrough for your team.</p>
        </section>
        <section className="marketing-card">
          <form className="auth-form">
            <label>Full Name<input type="text" name="name" autoComplete="name" /></label>
            <label>Work Email<input type="email" name="email" autoComplete="email" /></label>
            <label>Company<input type="text" name="company" autoComplete="organization" /></label>
            <label>How can we help?<textarea name="message" rows="5" /></label>
            <button type="submit" className="btn">Book a Demo</button>
          </form>
        </section>
      </main>
    </MarketingLayout>
  );
}
