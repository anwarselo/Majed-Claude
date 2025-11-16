# Setup Guide - Step by Step

This guide walks you through setting up the Business Microsite Generator from scratch.

## ⏱️ Estimated Time: 20-30 minutes

---

## Step 1: Install Dependencies (5 min)

```bash
cd microsite-gen
npm install
```

Wait for all packages to install.

---

## Step 2: Create Supabase Project (10 min)

### 2.1 Sign Up / Login
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended)

### 2.2 Create New Project
1. Click "New Project"
2. Choose your organization (create one if needed)
3. Fill in:
   - **Project Name**: `microsite-gen` (or your choice)
   - **Database Password**: Generate a strong password (save it somewhere safe)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### 2.3 Create Database Tables
1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"

### 2.4 Create Storage Bucket
1. Click **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Fill in:
   - **Name**: `business-files`
   - **Public bucket**: Toggle ON (important!)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Leave empty (we validate in code)
4. Click "Create bucket"

### 2.5 Get API Credentials
1. Click **Settings** (left sidebar, bottom)
2. Click **API** in the settings menu
3. Copy these three values (you'll need them next):
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (another long string, marked "secret")

---

## Step 3: Configure Environment (2 min)

### 3.1 Create Environment File
```bash
cp env.template .env.local
```

### 3.2 Edit .env.local
Open `.env.local` in your editor and fill in:

```env
BASE_URL=http://localhost:3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key-here
```

**Important**: 
- Replace `your-project-id` with your actual Supabase project ID
- Replace the keys with what you copied in Step 2.5
- Keep `BASE_URL` as `http://localhost:3000` for local development

---

## Step 4: Run Locally (1 min)

```bash
npm run dev
```

You should see:
```
 ✓ Ready in 2.3s
 ○ Local:   http://localhost:3000
```

---

## Step 5: Test Upload (5 min)

### 5.1 Prepare Test Data
Create a simple text file named `test-business.txt`:

```txt
Welcome to Acme Repairs!

We specialize in phone and laptop repair services.

Services:
- Screen replacement
- Battery replacement
- Water damage repair
- Software troubleshooting

Hours: Monday-Friday 9AM-6PM
Location: 123 Main Street, Dubai
```

### 5.2 Upload Test Business
1. Open http://localhost:3000 in your browser
2. Fill in the form:
   - **Business Name**: Acme Repairs
   - **Description**: Phone & laptop repair center
   - **Website**: https://example.com (optional)
   - **Phone**: +971-4-123-4567 (optional)
   - **File**: Select your `test-business.txt`
3. Click "Create Microsite"
4. Wait 2-3 seconds
5. You should be redirected to `/b/acme-repairs-xxxx`

### 5.3 Verify the Page
Check that you see:
- ✅ Business name as heading
- ✅ Contact information (if provided)
- ✅ Content from your text file
- ✅ Link to original document
- ✅ Footer with "Back to homepage" link

### 5.4 Check Sitemap
Visit http://localhost:3000/sitemap.xml

You should see XML with your new business page listed.

---

## Step 6: Deploy to Vercel (10 min)

### 6.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - microsite generator"
git branch -M main
git remote add origin https://github.com/yourusername/microsite-gen.git
git push -u origin main
```

### 6.2 Deploy on Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `microsite-gen` repository
5. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Environment Variables"
7. Add these (click "Add" for each):
   - `BASE_URL` → `https://your-app.vercel.app` (Vercel will show you this)
   - `SUPABASE_URL` → (same as in your .env.local)
   - `SUPABASE_ANON_KEY` → (same as in your .env.local)
   - `SUPABASE_SERVICE_ROLE_KEY` → (same as in your .env.local)
8. Click "Deploy"
9. Wait 2-3 minutes

### 6.3 Update robots.txt
1. Once deployed, copy your production URL (e.g., `https://microsite-gen-abc123.vercel.app`)
2. Edit `public/robots.txt` and replace the last line:
   ```txt
   Sitemap: https://your-actual-vercel-url.vercel.app/sitemap.xml
   ```
3. Commit and push:
   ```bash
   git add public/robots.txt
   git commit -m "Update robots.txt with production URL"
   git push
   ```
4. Vercel will auto-deploy the update

### 6.4 Test Production
1. Visit your Vercel URL
2. Upload another test business
3. Verify it works
4. Check `/sitemap.xml` on production

---

## Step 7: Submit to Search Engines (5 min)

### 7.1 Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Sign in with Microsoft account
3. Click "Add a site"
4. Enter your Vercel URL
5. Verify ownership (easiest: XML file method)
6. Once verified, go to "Sitemaps"
7. Submit: `https://your-url.vercel.app/sitemap.xml`

### 7.2 Google Search Console
1. Go to https://search.google.com/search-console
2. Click "Add property"
3. Choose "URL prefix" and enter your Vercel URL
4. Verify ownership (easiest: HTML file method)
5. Once verified, go to "Sitemaps"
6. Submit: `https://your-url.vercel.app/sitemap.xml`

---

## ✅ You're Done!

Your microsite generator is now:
- ✅ Running locally
- ✅ Deployed to production
- ✅ Submitted to search engines
- ✅ Ready to test ChatGPT discoverability

### Next Steps:
1. **Upload 3-5 real businesses** (with real information)
2. **Wait 1-2 weeks** for crawlers to index
3. **Test with ChatGPT**: Ask "What is [Business Name]?" or "Tell me about [Business Name]"
4. **Monitor**: Check Bing/Google Search Console for indexing status

---

## 🆘 Need Help?

### Common Issues

**"Failed to create business record"**
- Check Supabase credentials in `.env.local`
- Verify tables were created (check Supabase Table Editor)

**"Failed to upload file"**
- Make sure storage bucket `business-files` is set to **public**
- Check file size is under 10MB

**"Page not found after upload"**
- Check browser console for errors
- Verify the `pages` table has data (Supabase Table Editor)

**"Sitemap is empty"**
- Make sure you've uploaded at least one business
- Check that records exist in the `pages` table

---

## 🎯 Testing Checklist

Before submitting to search engines, verify:

- [ ] Local upload works
- [ ] Business page displays correctly
- [ ] JSON-LD is valid (use Google Rich Results Test)
- [ ] Sitemap lists all pages
- [ ] robots.txt is accessible
- [ ] Production deployment works
- [ ] No console errors in browser
- [ ] Files are stored in Supabase Storage
- [ ] Database records are created

---

**Ready to discover if ChatGPT can find your businesses? Good luck! 🚀**

