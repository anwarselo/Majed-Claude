# Business Microsite Generator

A simple, minimal web application that creates crawlable microsites for businesses. Upload a PDF or text document, and instantly get a public page with schema.org markup that ChatGPT and other search engines can discover.

## 🎯 Purpose

Make business information easily discoverable by AI search tools (ChatGPT, Bing, Google) by creating clean, structured microsites with proper semantic markup.

## ✨ Features

- **Simple Upload**: Accept PDF or plain text business documents
- **Auto-Generation**: Automatically extracts text and creates a microsite
- **SEO-Ready**: Includes schema.org JSON-LD markup for LocalBusiness
- **Crawlable**: robots.txt and sitemap.xml configured for ChatGPT/Bing/Google crawlers
- **Minimal Design**: Clean, fast-loading pages with no unnecessary complexity
- **Instant Publishing**: Pages go live immediately at `/b/{slug}`

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (Postgres)
- **Storage**: Supabase Storage
- **Text Extraction**: pdf-parse
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ (or 20+)
- A Supabase account (free tier works)
- A Vercel account for deployment (optional, free tier works)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd microsite-gen
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **SQL Editor** in your Supabase dashboard
3. Run the SQL from `supabase-schema.sql` to create tables
4. Go to **Storage** and create a new public bucket named `business-files`
5. Get your credentials from **Settings > API**:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.template .env.local
```

Edit `.env.local` with your actual values:

```env
BASE_URL=http://localhost:3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test the upload!

## 📦 Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project" and select your GitHub repo
4. Add environment variables in Vercel dashboard:
   - `BASE_URL` (your vercel domain, e.g., `https://your-app.vercel.app`)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy!

### Update robots.txt

After deployment, update `public/robots.txt` with your actual domain:

```txt
Sitemap: https://your-actual-domain.vercel.app/sitemap.xml
```

## 📝 How It Works

1. **Upload**: User submits business name, optional details, and a document (PDF/TXT)
2. **Extract**: System extracts text from the document
3. **Generate**: Creates clean HTML and schema.org JSON-LD markup
4. **Store**: Saves to Supabase database and storage
5. **Publish**: Page immediately available at `/b/{unique-slug}`
6. **Discover**: sitemap.xml lists all pages for crawler discovery

## 🔍 SEO & Discoverability

### robots.txt
Allows all major crawlers including:
- `OAI-SearchBot` (ChatGPT search)
- `ChatGPT-User` (ChatGPT on-demand fetch)
- `GPTBot` (OpenAI training bot)
- `Bingbot` (Bing/Microsoft)
- All other crawlers (`*`)

### sitemap.xml
Auto-generated at `/sitemap.xml` with:
- Homepage
- All published business pages
- Last modified timestamps

### Submit to Search Engines

After deployment, submit your sitemap to:
- **Bing Webmaster Tools**: https://www.bing.com/webmasters
- **Google Search Console**: https://search.google.com/search-console

## 📊 Testing Discoverability

1. **Immediate Test**: Visit your deployed `/sitemap.xml` to verify all pages are listed
2. **Schema Validation**: Use [Google Rich Results Test](https://search.google.com/test/rich-results) to validate JSON-LD
3. **Wait Period**: Allow 1-2 weeks for crawlers to discover and index your pages
4. **ChatGPT Test**: Ask ChatGPT questions about businesses you've published

## 📁 Project Structure

```
microsite-gen/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── upload/route.ts      # Upload endpoint
│   │   ├── b/[slug]/page.tsx        # Business page (SSR)
│   │   ├── sitemap.xml/route.ts     # Dynamic sitemap
│   │   ├── page.tsx                 # Homepage/upload form
│   │   └── layout.tsx               # Root layout
│   └── lib/
│       ├── supabase.ts              # Supabase client
│       ├── extract.ts               # PDF/text extraction
│       ├── render.ts                # HTML/JSON-LD generation
│       └── utils.ts                 # Helpers (slug, escapeHtml)
├── public/
│   └── robots.txt                   # Crawler directives
├── supabase-schema.sql              # Database schema
└── package.json
```

## 🎨 Customization

The app is intentionally minimal. To customize:

- **Styling**: Add Tailwind CSS or your preferred CSS framework
- **Fields**: Modify the upload form and database schema
- **Validation**: Add Zod schemas for input validation
- **OCR**: Add Tesseract for scanned documents (future enhancement)

## 🔐 Security Notes

- File uploads are limited to PDF and TXT only
- File size limit: 10MB (configurable in `next.config.js`)
- All HTML output is escaped to prevent XSS
- Public pages are read-only (no user authentication needed)
- Service role key should NEVER be exposed to the browser

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
Make sure `.env.local` exists with all required variables.

### "Failed to upload file"
Check that your Supabase storage bucket `business-files` is set to **public** access.

### "Text extraction failed"
Some PDFs are image-only (scanned). For v1, these will show a fallback message. Consider adding OCR in v2.

### Pages not showing in sitemap
Check that records exist in the `pages` table. The upload endpoint should create both a `businesses` and `pages` record.

## 📈 Future Enhancements (v2+)

- [ ] OCR support for scanned PDFs (Tesseract)
- [ ] LLM text summarization (GPT-5 mini)
- [ ] IndexNow integration for instant indexing
- [ ] User accounts and authentication
- [ ] Business verification
- [ ] Analytics dashboard
- [ ] Custom domain mapping
- [ ] Image upload support
- [ ] Abuse reporting/moderation

## 📄 License

MIT

## 👤 Author

Built following the simplified, minimal approach to validate ChatGPT discoverability.

---

**Ready to test?** Deploy it, add a few businesses, wait 2 weeks, and see if ChatGPT can discover them! 🚀

