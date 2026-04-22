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
          <p>Tell us about your procurement priorities and we will tailor an executive BlackCrest OS walkthrough for your team.</p>
        </section>
        <section className="marketing-card">
          <form className="auth-form">
            <label>Full Name<input type="text" name="name" autoComplete="name" /></label>
            <label>Work Email<input type="email" name="email" autoComplete="email" /></label>
            <label>Company<input type="text" name="company" autoComplete="organization" /></label>
            <label>Primary Industry
              <select name="industry" defaultValue="Defense / GovCon">
                <option>Defense / GovCon</option>
                <option>Manufacturing</option>
                <option>Enterprise Procurement</option>
                <option>Sourcing Services</option>
              </select>
            </label>
            <label>Team Size
              <select name="teamSize" defaultValue="25-100">
                <option>1-25</option>
                <option>25-100</option>
                <option>100-500</option>
                <option>500+</option>
              </select>
            </label>
            <label>How can we help?<textarea name="message" rows="5" /></label>
            <button type="submit" className="btn">Book a Demo</button>
          </form>
        </section>
      </main>
    </MarketingLayout>
  );
}
