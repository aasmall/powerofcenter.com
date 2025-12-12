# CLAUDE.md

Project-specific instructions for Claude Code.

## Project Overview

Carol Small's life coaching website (powerofcenter.com) with spam-protected contact form.

**Stack:**
- Hugo static site generator
- CleanWhite Hugo Theme
- Cloudflare (DNS, CDN, Bot Protection)
- Cloudflare Worker (form backend)
- Cloudflare Turnstile (invisible CAPTCHA)
- MailChannels (email via CF Worker)

## Development Commands

### Hugo Site

```bash
# Local dev server
hugo server -D

# Build for production
hugo

# Deploy to GCS (legacy)
./gsdeploy.sh
```

### Cloudflare Worker

```bash
# Navigate to worker directory
cd worker/

# Local dev
wrangler dev

# Deploy to Cloudflare
wrangler deploy

# View logs
wrangler tail
```

## Architecture Notes

### Contact Form Flow
1. User fills form on `/top/contact/`
2. Turnstile generates invisible challenge token
3. Form POSTs to CF Worker (`contact.powerofcenter.com`)
4. Worker validates: Turnstile token + honeypot + timing
5. Worker sends email via MailChannels
6. User sees success message

### Key Files
- `layouts/shortcodes/contactform.html` - Form HTML + Turnstile widget
- `worker/src/index.ts` - CF Worker form handler
- `worker/wrangler.toml` - Worker configuration

### DNS Records (Cloudflare)
- `A` / `AAAA` - Site points to GCS
- `TXT` - MailChannels SPF record
- Worker route: `contact.powerofcenter.com/*`

## Testing

- Test form locally: `wrangler dev` + Hugo dev server
- Test Turnstile: Use test keys in dev, real keys in prod
- Test email: Check mom's inbox after form submission

## Warnings & Gotchas

- Hugo theme is a git submodule - run `git submodule update --init`
- Turnstile site key must match domain (localhost for dev, powerofcenter.com for prod)
- MailChannels requires SPF TXT record or emails will bounce
