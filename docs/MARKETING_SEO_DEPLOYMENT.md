# Marketing Site SEO Deployment Notes

## Rendering strategy
The public marketing routes are implemented as static React routes with route-level SEO metadata (`SeoHead`) and structured data injection. For best crawl coverage in production, ensure your host serves SPA routes with HTML fallback and allows crawlers to execute JS.

## Search console readiness checklist
1. Deploy the frontend with the updated `frontend/public/robots.txt` and `frontend/public/sitemap.xml`.
2. Verify `https://blackcrest.ai/sitemap.xml` is reachable.
3. Add `https://blackcrest.ai` to Google Search Console and Bing Webmaster Tools.
4. Submit sitemap after verification.
5. Request indexing for key pages:
   - `/`
   - `/features`
   - `/supplier-intelligence`
   - `/opportunity-intelligence`
   - `/sourcing-intelligence`
   - `/proposal-intelligence`
   - `/government-contracting`
   - `/insights`
6. Optional: enable IndexNow in your edge/proxy layer to push page updates faster.

## Robots and indexing
- Public marketing routes are indexable.
- Private app/auth routes are marked `noindex` in React and disallowed in robots.txt.
