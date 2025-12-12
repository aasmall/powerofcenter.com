# Project Notes

History of decisions, features, and architectural choices for this project.

## 2025-12-10 - Project Initialization

**Context:** Mom's website (powerofcenter.com) contact form has no spam protection. Emails go to a catch-all address that never gets checked due to spam volume.

**Site Analysis:**
- Hugo static site with CleanWhite theme
- Hosted on Google Cloud
- Contact form at `/top/contact/` uses custom AJAX POST
- No captcha or honeypot fields currently
- Form endpoint URL not yet identified

**Initial Goals:**
1. Add spam protection to contact form
2. Ensure legitimate messages reach mom

**Answers Found:**
- [x] Source repo: github.com/aasmall/powerofcenter.com
- [x] Hosting: GCS bucket `gs://power-of-center-website-content`
- [x] Form backend: Getform.io (replaced)
- [x] DNS registrar: Squarespace Domains (migrated NS to Cloudflare)

---

## 2025-12-10 - Architecture Decision: Cloudflare Everything

**Context:** Evaluated multiple approaches to spam protection. Key insight: Cloudflare at DNS level alone won't help because form POSTs directly to getform.io - bots bypass the domain entirely.

**Decision:** Full Cloudflare stack (all free tier)
- Cloudflare DNS + Bot Fight Mode
- Cloudflare Worker for form backend
- Cloudflare Turnstile for invisible CAPTCHA
- ~~MailChannels for email~~ → Resend API (MailChannels killed free tier Aug 2024)

**Alternatives Considered:**
1. GCP Cloud Function + honeypot - More manual security work, familiar stack
2. Keep Getform.io + add Turnstile - Won't work, Getform doesn't verify tokens
3. Paid service (Formspree, etc.) - User explicitly rejected subscription costs

**Trade-offs:**
- Pro: Multi-layer protection (network + edge + validation)
- Pro: Zero ongoing cost
- Pro: All in one ecosystem
- Con: DNS migration required (one-time effort)
- Con: New platform to learn

---

## 2025-12-11 - Implementation Complete

**What was built:**

| Layer | Solution |
|-------|----------|
| DNS/CDN | Cloudflare (Bot Fight Mode enabled) |
| Form CAPTCHA | Turnstile (invisible, test keys for local dev) |
| Form Backend | Cloudflare Worker (`worker/src/index.ts`) |
| Spam Filters | Honeypot field + timing validation (reject < 3s) |
| Email | Resend API (3,000/month free) |
| Email Auth | SPF (via Resend) + DKIM + DMARC |

**Hugo Fixes Required:**
- `paginate` → `pagination.pagerSize` (Hugo v0.128+ breaking change)
- `_internal/google_analytics_async.html` → `_internal/google_analytics.html`
- `.Site.DisqusShortname` → `site.Config.Services.Disqus.Shortname`
- `.Site.GoogleAnalytics` → `site.Config.Services.GoogleAnalytics.ID`
- Created layout overrides in `layouts/partials/` to avoid modifying theme submodule

**Environment-based Config:**
- `config/_default/params.toml` - Production Turnstile sitekey + Worker URL
- `config/development/params.toml` - Test sitekey (always passes) + localhost

**Secrets (not in repo):**
- `TURNSTILE_SECRET` - via `wrangler secret put`
- `RESEND_API_KEY` - via `wrangler secret put`
- `worker/.dev.vars` - local dev secrets (gitignored)

**DNS Records Added:**
- DMARC: `_dmarc` TXT `v=DMARC1; p=none;`
- (Resend handles SPF/DKIM via their sending subdomain)

**Deployment:**
- Worker: `cd worker && wrangler deploy`
- Site: `hugo --environment production && gsutil -m rsync -r public gs://power-of-center-website-content`

**Cost:** $0/month (all free tiers)
