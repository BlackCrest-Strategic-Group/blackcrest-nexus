import React from 'react';
import MarketingPage from './MarketingPage';
import { marketingPages } from './marketingPages';

export default function ModulePage({ pageKey }) {
  const page = marketingPages[pageKey] || marketingPages.features;
  return <MarketingPage {...page} />;
}
