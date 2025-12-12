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

**Open Questions:**
- [ ] Where is the Hugo source repository?
- [ ] What GCP service hosts the site? (Cloud Storage? Firebase Hosting?)
- [ ] Where does the form POST to? (Cloud Function? Google Script?)
- [ ] Does mom have access to GCP console?

**Future Considerations:**
- May need to set up a new form backend if current one is unknown/inaccessible
- Consider managed form services (Formspree, Basin) vs self-hosted (Cloud Function)

---

## 2025-12-10 - Architecture Decision: Cloudflare Everything

**Context:** Evaluated multiple approaches to spam protection. Key insight: Cloudflare at DNS level alone won't help because form POSTs directly to getform.io - bots bypass the domain entirely.

**Decision:** Full Cloudflare stack (all free tier)
- Cloudflare DNS + Bot Fight Mode
- Cloudflare Worker for form backend
- Cloudflare Turnstile for invisible CAPTCHA
- MailChannels for email (free for CF Workers)

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

**Future Considerations:**
- If Cloudflare changes pricing, alternatives exist
- Worker code will be in repo for visibility
- MailChannels has generous limits (should never hit them)
