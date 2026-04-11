import React from "react";
import { Link } from "react-router-dom";
import { APP_URL } from "../constants.js";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mkt-footer">
      <div className="mkt-footer__inner">
        <div className="mkt-footer__brand">
          <div className="mkt-footer__brand-name">BlackCrest Strategic Group</div>
          <p className="mkt-footer__tagline">
            Building AI systems that help companies win smarter, execute better, and
            uncover hidden operational risk.
          </p>
        </div>

        <div>
          <div className="mkt-footer__col-title">BlackCrest AI</div>
          <ul className="mkt-footer__links">
            <li><Link to="/blackcrest-ai">Overview</Link></li>
            <li><Link to="/blackcrest-ai/govcon-ai">GovCon AI</Link></li>
            <li><Link to="/blackcrest-ai/truth-serum-ai">Truth Serum AI</Link></li>
          </ul>
        </div>

        <div>
          <div className="mkt-footer__col-title">Company</div>
          <ul className="mkt-footer__links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/labs">LoudMouth Mike Labs</Link></li>
          </ul>
        </div>

        <div>
          <div className="mkt-footer__col-title">Product</div>
          <ul className="mkt-footer__links">
            <li><a href={APP_URL}>Open App</a></li>
          </ul>
        </div>
      </div>

      <div className="mkt-footer__bottom">
        <span className="mkt-footer__copyright">
          © {year} BlackCrest Strategic Group. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
