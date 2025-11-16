# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Any Browser)                             │
└────────────┬─────────────────────────────────┬──────────────┘
             │                                 │
             │ Upload Form                     │ View Microsite
             ▼                                 ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│   Homepage (/)          │      │   Business Page         │
│   • Upload form         │      │   (/b/[slug])           │
│   • Client component    │      │   • SSR rendered        │
│   • POST to /api/upload │      │   • JSON-LD injected    │
└────────────┬────────────┘      └────────────┬────────────┘
             │                                 │
             │ FormData                        │ Fetch from DB
             ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP ROUTER                       │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │ /api/upload      │              │ /b/[slug]/page   │     │
│  │ • Validate       │              │ • Query DB       │     │
│  │ • Generate slug  │              │ • Render HTML    │     │
│  │ • Extract text   │              │ • Return page    │     │
│  │ • Create records │              └──────────────────┘     │
│  └────────┬─────────┘                                       │
│           │                        ┌──────────────────┐     │
│           │                        │ /sitemap.xml     │     │
│           │                        │ • Query pages    │     │
│           │                        │ • Generate XML   │     │
│           │                        └──────────────────┘     │
└───────────┼─────────────────────────────────────────────────┘
            │
            │ Store & Create
            ▼
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                              │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │  POSTGRES DB     │              │  STORAGE         │     │
│  │                  │              │                  │     │
│  │ ┌─────────────┐  │              │ ┌──────────────┐ │     │
│  │ │ businesses  │  │              │ │ business-    │ │     │
│  │ │ • id        │  │              │ │   files/     │ │     │
│  │ │ • slug      │  │              │ │              │ │     │
│  │ │ • name      │  │              │ │ [file.pdf]   │ │     │
│  │ │ • website   │  │              │ └──────────────┘ │     │
│  │ └─────────────┘  │              │   (Public URL)   │     │
│  │                  │              └──────────────────┘     │
│  │ ┌─────────────┐  │                                       │
│  │ │ pages       │  │                                       │
│  │ │ • id        │  │                                       │
│  │ │ • html      │  │                                       │
│  │ │ • jsonld    │  │                                       │
│  │ │ • url       │  │                                       │
│  │ └─────────────┘  │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Crawled by
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH ENGINE CRAWLERS                    │
│  • OAI-SearchBot (ChatGPT Search)                           │
│  • ChatGPT-User (ChatGPT on-demand)                         │
│  • Bingbot (Bing/Microsoft)                                 │
│  • Googlebot (Google)                                       │
│                                                             │
│  Read: /robots.txt, /sitemap.xml, /b/[slug]                │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Upload Flow
```
1. User fills form → 2. Submit FormData → 3. API validates
                                              ↓
4. Generate unique slug ← 5. Extract text from PDF/TXT
                                              ↓
6. Upload file to Storage → 7. Get public URL
                                              ↓
8. Create business record → 9. Generate HTML + JSON-LD
                                              ↓
10. Create page record → 11. Return slug → 12. Redirect user
```

### View Flow
```
1. User visits /b/acme-repairs-x7k2
                ↓
2. Next.js SSR fetches from database
                ↓
3. Query: SELECT * FROM businesses JOIN pages WHERE slug = 'acme-repairs-x7k2'
                ↓
4. Render HTML with injected JSON-LD script
                ↓
5. Return complete HTML page (SEO-ready)
```

## 🗂️ File Structure

```
microsite-gen/
│
├── 📄 Documentation
│   ├── START-HERE.md           ← You are here
│   ├── QUICKSTART.md
│   ├── SETUP.md
│   ├── README.md
│   ├── ARCHITECTURE.md         ← This file
│   ├── PROJECT-SUMMARY.md
│   └── DEPLOYMENT-CHECKLIST.md
│
├── ⚙️ Configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── env.template
│   └── .gitignore
│
├── 🗄️ Database
│   └── supabase-schema.sql
│
├── 🌐 Application
│   └── src/
│       ├── app/                    # Next.js App Router
│       │   ├── layout.tsx          # Root layout
│       │   ├── page.tsx            # Homepage (upload form)
│       │   ├── api/
│       │   │   └── upload/
│       │   │       └── route.ts    # Upload API endpoint
│       │   ├── b/
│       │   │   └── [slug]/
│       │   │       └── page.tsx    # Dynamic business page
│       │   └── sitemap.xml/
│       │       └── route.ts        # Sitemap generator
│       │
│       └── lib/                    # Utilities
│           ├── supabase.ts         # DB client
│           ├── extract.ts          # PDF/text extraction
│           ├── render.ts           # HTML/JSON-LD generation
│           └── utils.ts            # Helpers
│
└── 📁 Static
    └── public/
        └── robots.txt              # Crawler directives
```

## 🔄 Component Responsibilities

### Frontend Components

**`app/page.tsx`** (Client Component)
- Purpose: Upload form UI
- Responsibilities:
  - Render form inputs
  - Handle form submission
  - POST to `/api/upload`
  - Redirect to microsite on success

**`app/b/[slug]/page.tsx`** (Server Component)
- Purpose: Display business microsite
- Responsibilities:
  - Fetch data from Supabase (SSR)
  - Inject JSON-LD script
  - Render business HTML
  - Handle 404 if not found

**`app/sitemap.xml/route.ts`** (Route Handler)
- Purpose: Generate XML sitemap
- Responsibilities:
  - Query all published pages
  - Format as XML
  - Return with correct headers

### Backend Components

**`src/lib/supabase.ts`**
- Purpose: Database connection
- Single client instance with service role key

**`src/lib/extract.ts`**
- Purpose: Text extraction
- Functions:
  - `extractTextFromPDF(buffer)` - Uses pdf-parse
  - `extractTextFromTxt(buffer)` - Reads UTF-8

**`src/lib/render.ts`**
- Purpose: Content generation
- Functions:
  - `generateJsonLd(business, baseUrl)` - Creates schema.org markup
  - `generateHtml(business, text, sourceUrl)` - Creates page HTML

**`src/lib/utils.ts`**
- Purpose: Helper functions
- Functions:
  - `generateSlug(name)` - Creates unique URL slug
  - `escapeHtml(text)` - Prevents XSS

### API Routes

**`POST /api/upload`**
```typescript
Input:  FormData (name, description, website, phone, file)
Output: { success: true, slug: string, url: string }
Steps:
  1. Validate inputs
  2. Generate slug
  3. Create business record
  4. Upload file to storage
  5. Extract text
  6. Generate HTML + JSON-LD
  7. Create page record
  8. Return slug
```

## 🗃️ Database Schema

```sql
businesses
├── id (uuid, PK)
├── slug (text, unique)     ← Used in URL
├── name (text)
├── description (text)
├── website (text)
├── phone (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

pages
├── id (uuid, PK)
├── business_id (uuid, FK)  → businesses.id
├── url (text)              ← Full URL
├── html (text)             ← Rendered HTML
├── jsonld (jsonb)          ← Schema.org markup
└── published_at (timestamptz)
```

## 🔐 Security Model

### Public Access
- ✅ All business pages readable by anyone
- ✅ Sitemap readable by anyone
- ✅ File uploads stored with public URLs

### Protected
- 🔒 Service role key (server-only)
- 🔒 Database writes (via service role)
- 🔒 File uploads (validated server-side)

### Input Validation
- File type: Only PDF and TXT
- File size: Max 10MB
- HTML: All user content escaped
- URLs: Validated format

## 🚀 Deployment Architecture

```
┌──────────────┐
│   GitHub     │ ← Code repository
└──────┬───────┘
       │ Push triggers deploy
       ▼
┌──────────────┐
│   Vercel     │ ← Hosting & build
│              │
│ • Next.js    │
│ • Edge Fns   │
│ • CDN        │
└──────┬───────┘
       │ Connects to
       ▼
┌──────────────┐
│  Supabase    │ ← Database & storage
│              │
│ • Postgres   │
│ • Storage    │
│ • Edge Fns   │
└──────────────┘
```

## 📈 Scaling Considerations

### Current Capacity (Free Tiers)
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 1GB storage
- **Performance**: Handles 1000s of businesses easily

### When to Upgrade
- Database > 500MB → Supabase Pro ($25/mo)
- Bandwidth > 100GB → Vercel Pro ($20/mo)
- Storage > 1GB → Supabase add-on

### Optimization Opportunities (Future)
- Add Redis caching for frequently accessed pages
- Implement CDN for uploaded files
- Add pagination for sitemap (if >50k pages)
- Implement database connection pooling

## 🔍 SEO Architecture

### How Crawlers Discover Pages

1. **Sitemap Submission**
   - User submits `/sitemap.xml` to Bing/Google
   - Crawlers read sitemap for all page URLs

2. **robots.txt**
   - Crawlers check `/robots.txt` first
   - Find sitemap location
   - Verify they're allowed to crawl

3. **Page Crawling**
   - Crawler visits each `/b/{slug}` URL
   - Parses HTML and JSON-LD
   - Extracts metadata and content
   - Adds to search index

4. **Regular Updates**
   - Sitemap includes `<lastmod>` timestamps
   - Crawlers revisit changed pages
   - Fresh content gets re-indexed

## 💡 Design Decisions

### Why SSR over SSG?
- Dynamic content (new businesses added anytime)
- No build-time generation needed
- Simpler deployment (no regeneration)

### Why Supabase over Prisma + separate DB?
- All-in-one solution (DB + Storage)
- Free tier generous
- Simple setup (no infrastructure)

### Why No Authentication?
- Public upload is the feature
- Simplifies MVP
- Can add in v2 if needed

### Why No OCR in v1?
- Most business PDFs have text layers
- OCR adds complexity (GPU, libraries)
- Can validate need first

### Why Minimal Styling?
- Focus on functionality
- Crawlers don't care about CSS
- Easy to add UI later

---

**This architecture prioritizes simplicity, speed, and validation over premature optimization.**

