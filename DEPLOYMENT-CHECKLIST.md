# Deployment Checklist

Use this checklist before going live to production.

## Pre-Deployment

### Database
- [ ] Supabase project created
- [ ] SQL schema executed successfully (`supabase-schema.sql`)
- [ ] Tables verified: `businesses` and `pages` exist
- [ ] Storage bucket `business-files` created
- [ ] Storage bucket set to **public** access
- [ ] RLS policies enabled (optional but recommended)

### Environment Variables
- [ ] `.env.local` created for local development
- [ ] All 4 required variables set:
  - [ ] `BASE_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Local Testing
- [ ] `npm install` completed without errors
- [ ] `npm run dev` runs successfully
- [ ] Upload test works (PDF and TXT files)
- [ ] Business page renders correctly at `/b/{slug}`
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] robots.txt accessible at `/robots.txt`
- [ ] No console errors in browser
- [ ] Database records created successfully
- [ ] Files uploaded to Supabase Storage

## Production Deployment (Vercel)

### Setup
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Vercel project created and linked to repository
- [ ] Environment variables added in Vercel dashboard (all 4)
- [ ] `BASE_URL` set to production domain (e.g., `https://your-app.vercel.app`)
- [ ] First deployment successful

### Post-Deployment Verification
- [ ] Production site loads correctly
- [ ] Upload form works on production
- [ ] Test upload succeeds
- [ ] Business page displays correctly
- [ ] `/sitemap.xml` accessible and contains pages
- [ ] `/robots.txt` accessible
- [ ] Robots.txt updated with production sitemap URL
- [ ] No 500 errors in Vercel logs
- [ ] Files uploading to Supabase Storage from production

### SEO & Discoverability
- [ ] JSON-LD validated with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Sitemap submitted to Google Search Console
- [ ] No blocking directives in robots.txt
- [ ] All crawler user-agents allowed:
  - [ ] `OAI-SearchBot`
  - [ ] `ChatGPT-User`
  - [ ] `GPTBot`
  - [ ] `Bingbot`
  - [ ] `Googlebot` (via `*`)

## Security Check

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **only** in server-side code
- [ ] No secrets committed to git (check `.gitignore`)
- [ ] File type validation working (only PDF and TXT accepted)
- [ ] File size limit enforced (10MB max)
- [ ] HTML output properly escaped (XSS protection)
- [ ] Rate limiting considered (optional for v1)

## Performance

- [ ] Pages load under 3 seconds
- [ ] Lighthouse score > 80 (optional)
- [ ] No memory leaks in Vercel logs
- [ ] Database connection pooling working

## Monitoring (Optional but Recommended)

- [ ] Error tracking setup (Sentry, LogRocket, etc.)
- [ ] Analytics added (Vercel Analytics, Google Analytics, etc.)
- [ ] Uptime monitoring (optional)

## Launch

- [ ] All checklist items above completed
- [ ] Documentation reviewed (README, SETUP)
- [ ] Test uploads from different browsers
- [ ] 3-5 real businesses uploaded
- [ ] URLs shared for testing
- [ ] Ready to wait 1-2 weeks for indexing!

---

## Post-Launch (After 2 Weeks)

- [ ] Check Bing Webmaster Tools for indexing status
- [ ] Check Google Search Console for indexing status
- [ ] Test ChatGPT: Ask about uploaded businesses
- [ ] Document which crawlers found your site
- [ ] Iterate based on results

---

**Status**: [ ] Ready for Production

**Deployed URL**: _________________________

**Sitemap Submitted**: [ ] Bing [ ] Google

**First Business Uploaded**: ___/___/______

**Waiting for Indexing Until**: ___/___/______

