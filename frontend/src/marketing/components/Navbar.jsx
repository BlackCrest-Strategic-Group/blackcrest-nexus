import React from "react";
import { Link, NavLink } from "react-router-dom";
import { APP_URL } from "../constants.js";

export default function Navbar() {
  return (
    <nav className="mkt-nav">
      <div className="mkt-nav__inner">
        <Link to="/" className="mkt-nav__logo">
          <div className="mkt-nav__logo-mark">B</div>
          <div className="mkt-nav__logo-name">
            BlackCrest
            <span>Strategic Group</span>
          </div>
        </Link>

        <ul className="mkt-nav__links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/blackcrest-ai" className={({ isActive }) => isActive ? "active" : ""}>
              BlackCrest AI
            </NavLink>
          </li>
          <li>
            <NavLink to="/blackcrest-ai/govcon-ai" className={({ isActive }) => isActive ? "active" : ""}>
              GovCon AI
            </NavLink>
          </li>
          <li>
            <NavLink to="/blackcrest-ai/truth-serum-ai" className={({ isActive }) => isActive ? "active" : ""}>
              Truth Serum AI
            </NavLink>
          </li>
          <li>
            <NavLink to="/labs" className={({ isActive }) => isActive ? "active" : ""}>
              Labs
            </NavLink>
          </li>
        </ul>

        <div className="mkt-nav__cta">
          <a href={APP_URL} className="mkt-btn mkt-btn--primary mkt-btn--sm">
            Open App →
          </a>
        </div>
      </div>
    </nav>
  );
}
