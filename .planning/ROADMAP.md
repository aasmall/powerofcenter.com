# Roadmap: Mom's Site Spam Protection

## Overview

Migrate powerofcenter.com to use Cloudflare for DNS/protection and replace Getform.io with a Cloudflare Worker + MailChannels for spam-free contact form handling. All free tier.

## Phases

- [ ] **Phase 1: Discovery & Cloudflare Setup** - Find DNS registrar, create CF account, add site
- [ ] **Phase 2: DNS Migration** - Point nameservers to Cloudflare, enable bot protection
- [ ] **Phase 3: Worker + Email** - Create CF Worker for form, set up MailChannels email
- [ ] **Phase 4: Frontend Integration** - Add Turnstile to form, update form action, deploy

## Phase Details

### Phase 1: Discovery & Cloudflare Setup
**Goal**: Understand current DNS setup and prepare Cloudflare account
**Depends on**: Nothing (first phase)
**Plans**: 1 plan

Plans:
- [ ] 01-01: Discover current DNS registrar, create Cloudflare account, add site to CF

**Checkpoint**: `human-verify` - Confirm DNS registrar access (may need mom's credentials)

### Phase 2: DNS Migration
**Goal**: Move DNS to Cloudflare, site still works, bot protection enabled
**Depends on**: Phase 1
**Plans**: 1 plan

Plans:
- [ ] 02-01: Update nameservers at registrar, verify propagation, enable Bot Fight Mode

**Checkpoint**: `human-action` - Update nameservers requires registrar login (may need mom)

### Phase 3: Worker + Email
**Goal**: Cloudflare Worker that receives form submissions and sends email via MailChannels
**Depends on**: Phase 2
**Plans**: 2 plans

Plans:
- [ ] 03-01: Create CF Worker with form handling + honeypot + timing validation
- [ ] 03-02: Set up MailChannels DNS records, integrate email sending, test

### Phase 4: Frontend Integration
**Goal**: Hugo site updated with Turnstile and new form endpoint, deployed
**Depends on**: Phase 3
**Plans**: 2 plans

Plans:
- [ ] 04-01: Clone repo, add Turnstile widget to contact form shortcode
- [ ] 04-02: Update form action to Worker URL, test locally, deploy

**Checkpoint**: `human-verify` - Test real form submission to mom's email

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Discovery & CF Setup | 0/1 | Not started | - |
| 2. DNS Migration | 0/1 | Not started | - |
| 3. Worker + Email | 0/2 | Not started | - |
| 4. Frontend Integration | 0/2 | Not started | - |

## Dependencies & Access Needed

- [ ] Squarespace Domains login (for nameserver change) - mom's account
- [ ] Cloudflare account (can create new or use existing)
- [ ] Mom's email address (destination for contact form)
- [x] GitHub access to aasmall/powerofcenter.com (Aaron has this)

## Research Complete (2025-12-10)

- Registrar: Squarespace Domains (ex-Google Domains)
- Current NS: Google Cloud DNS
- Site IP: 35.190.19.2 (GCP)
- No MX/TXT records (clean slate for MailChannels SPF)
