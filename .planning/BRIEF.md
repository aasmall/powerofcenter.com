# Mom's Site Spam Protection

**One-liner**: Add spam protection to powerofcenter.com contact form using Cloudflare's free tier.

## Problem

The contact form at powerofcenter.com has no spam protection. It currently POSTs to Getform.io which forwards to an email catch-all that's so full of spam it never gets checked. Legitimate contact attempts from potential clients are lost.

## Success Criteria

How we know it worked:

- [ ] Contact form submissions reach mom's actual inbox (not catch-all)
- [ ] Spam is blocked or filtered before reaching email
- [ ] No monthly subscription costs
- [ ] Form still works for legitimate users (test with real submission)

## Constraints

- $0/month ongoing cost (free tiers only)
- Mom has GCP access but limited technical ability
- Site is Hugo static site, currently on GCS
- Must be maintainable by Aaron (not mom)
- Minimize disruption to existing site content

## Technical Approach

**Cloudflare Everything**:
1. Move DNS to Cloudflare (free plan)
2. Either proxy GCS through CF or migrate to Cloudflare Pages
3. Create Cloudflare Worker to handle form submissions
4. Add Turnstile (invisible CAPTCHA) to form
5. Worker sends email via MailChannels (free for CF Workers)
6. Enable Bot Fight Mode for extra protection

## Current State

- **Source repo**: github.com/aasmall/powerofcenter.com
- **Hosting**: GCS bucket `gs://power-of-center-website-content`
- **Deploy**: `gsutil rsync` via gsdeploy.sh
- **Form backend**: Getform.io (to be replaced)
- **Registrar**: Squarespace Domains (ex-Google Domains)
- **Nameservers**: Google Cloud DNS (`ns-cloud-c*.googledomains.com`)
- **A Record**: `35.190.19.2` (Google Cloud)
- **MX/TXT**: None (no email at domain, clean slate for SPF)

## Out of Scope

- Redesigning the website
- Adding new pages or features
- SEO improvements
- Performance optimization (unless trivial)
- Teaching mom to maintain the system
