# Technical Requirements Document (TRD): Headland Cyber Phase 1 MVP

## 1. Project Overview
**Headland Cyber** is an agentless cybersecurity SaaS tailored for Australian SMBs (5-50 employees). The platform continuously monitors external attack surfaces, cloud security posture, and credential leaks. It processes technical findings via an LLM to generate plain-English, actionable alerts for non-technical users. 

**Phase 1 Constraint:** Strictly external scanning (including Nmap, Nuclei, and ZAP) and infrastructure hygiene for the $99 Starter tier. No internal/LAN scanning, custom network agents, or cloud API integrations. No internal/LAN scanning or custom network agents.

## 2. Technology Stack

The agent should utilize the following production stack:
* **Frontend & API Gateway:** Next.js (App Router), React, Tailwind CSS, hosted on Vercel.
* **Database & Authentication:** Supabase (PostgreSQL, Supabase Auth with Row Level Security).
* **Message Queue:** Upstash Redis (Serverless Redis).
* **Background Workers:** AWS Fargate (running Dockerized scanner containers).
* **Job Scheduling:** AWS EventBridge (for daily/weekly cron jobs).
* **Core Scanners:** Nmap, Nuclei, OWASP ZAP, muffet.
* **Cloud Integrations:** Microsoft Graph API, Google Workspace Admin SDK, Xero API, Have I Been Pwned (HIBP) API.
* **AI / LLM:** Google Gemini 3 Flash (via Vercel AI SDK for structured JSON output).
* **Transactional Email:** Resend.
* **Billing:** Stripe.
* **Web Analytics:** Umami (self-hosted, sharing the Supabase PostgreSQL instance).

## 3. System Architecture & Data Flow

1. **Scheduling & Triggers:** AWS EventBridge triggers scheduled scans (weekly for Tier 1, daily for Tier 2) by pushing payloads to Upstash Redis. Manual scans are triggered via Next.js API routes pushing to the same Redis queue. Additionally, Vercel Cron triggers lightweight Edge Functions every 5 minutes for uptime monitoring.
2. **Worker Execution:** AWS Fargate tasks consume the Redis queue. Depending on the job type, the Fargate container executes Nmap, Nuclei, ZAP, or queries cloud APIs.
3. **LLM Processing:** The Fargate worker passes raw technical JSON findings to Gemini 3 Flash. The LLM returns a strict JSON structure containing a friendly title, business impact, remediation steps, and an IT escalation flag.
4. **Storage & Realtime:** The worker inserts the final processed object into Supabase. Next.js Client Components listen via Supabase Realtime (`postgres_changes`) to update the dashboard instantly.

## 4. Core Features to Build

#### A. Scanning & Monitoring Engines
* **EASM (Nmap):** Automated port scanning against client public IPs/domains to detect exposed services (RDP, SSH, DBs).
* **Web Vulnerability (Nuclei & ZAP):** Run sequentially. Nuclei for CVEs/known vulnerabilities; ZAP for HTTP headers, cookies, and passive analysis. Group low-severity findings (e.g., "Improve Security Headers").
* **Cloud Security Posture:**
    * *M365 & Google Workspace:* Check MFA enforcement, suspicious inbox rules, inactive admins, forwarding abuse.
    * *Xero:* Monitor financial setting changes and high-risk events.
* **Website Vitals:** Monitor website uptime (via 5-minute Vercel Cron pings), retrieve Core Web Vitals (via Google PageSpeed Insights API, with failing audits translated by Gemini 3 Flash), and detect broken links (using muffet).
* **Infrastructure Hygiene:** Parse DMARC reports, validate SPF/DKIM, track SSL/TLS certificate data, check Domain expiry, and detect WHOIS drift/takeovers.
* **Credential Leaks:** Poll HIBP API for breached emails on client domains.

#### B. Dashboard & UI Requirements
* **Website Vitals Section:** A dedicated UI displaying standard uptime graphs, translated Core Web Vitals results, and lists of broken links.
* **Infrastructure Hygiene Section:** Grouped views for DNS/DMARC/TLS status, WHOIS drift alerts, and Domain expiry.
* **Cyber Health Score:** A master score (0-100) aggregating cloud, DNS, web, and credential posture.
* **Actionable Alert Queue:** UI displaying LLM-translated findings, grouped by severity (Critical, High, Medium).
* **Integration Status Cards:** Grid tiles showing connection status and last-scan timestamps for M365, Google, Xero, DNS, and EASM.
* **Reporting Views:** Generate monthly Essential Eight-aligned PDF reports and weekly "Sleep at Night" summaries.


#### D. Internal Admin Dashboard
* **Business Metrics:** Track and display MRR (Monthly Recurring Revenue) and ARR (Annual Recurring Revenue), along with customer lifecycle status (new, existing, churned).
* **Usage Analytics:** Powered by Umami. Monitor per-tenant engagement including pageviews, user logins, transactional email interactions, and generated alert finding counts via custom Umami events.

#### C. Access Control & Feature Flags (Pricing Tiers)
* **Tier 1 (Starter - $99/mo):** 4 external scans/month. DNS/Email checks, SSL/Domain expiry, and Web Vulnerability (Nuclei & ZAP) scanning. *No manual scans, no cloud integrations, no credential monitoring.*
* **Tier 2 (Professional - $249/mo) [Phase 2]:** Daily automated scans, unlimited manual scans. Unlocks cloud integrations (M365/Google/Xero), HIBP monitoring, advanced LLM guidance, and Slack/Teams alerting.

## 5. Database Schema Requirements (High-Level)

The AI agent should design the Supabase PostgreSQL schema with the following core tables:
* `tenants` (Client organizations, tier status, billing IDs).
* `users` (Mapped to Supabase Auth, linked to tenants, with last login tracking).
* `umami_*` tables (Standard Umami PostgreSQL schema co-located for usage analytics, replacing custom usage logs).
* `uptime_logs` (5-minute interval ping results for uptime graphs).
* `web_vitals` (Core Web Vitals metrics over time).
* `broken_links` (Discovered dead URLs from muffet).
* `whois_baselines` (Baseline data for WHOIS drift/takeover detection).
* `monitored_assets` (Domains, IPs, Cloud tenant IDs).
* `scan_jobs` (Audit logs of scan execution times and statuses).
* `alerts` (The final LLM-processed findings, severity, resolution status).

## 6. Implementation Roadmap (For AI Dev Agent)

### Product Phase 1 (Starter Tier - $99/mo)

* **Phase 1 (Weeks 1-2):** Initialize Next.js, configure Tailwind, setup Supabase Auth, establish multi-tenant database schema with RLS, execute Umami DB initialization scripts, and build core dashboard shell.
* **Phase 2 (Weeks 3-4):** Implement DNS/SPF/DKIM parsing utilities. (Cloud OAuth flows deferred to Product Phase 2).
* **Phase 3 (Weeks 5-6):** Dockerize Nmap/Nuclei/ZAP. Configure AWS Fargate task definitions and EventBridge. Implement Upstash Redis queue consumption.
* **Phase 4 (Week 7):** Integrate Gemini 3 Flash with `zod` schemas for strict risk explanation and remediation formatting. Connect LLM output to Supabase `alerts` table.
* **Phase 5 (Weeks 8-10):** Implement Resend for weekly emails, build PDF generation logic, integrate Stripe for Starter tier, build the Internal Admin Dashboard (MRR/ARR from Stripe and usage stats from Umami API), and finalize UI polish.
### Product Phase 2 (Professional Tier - $249/mo Rollout)
* **Phase 6:** Build OAuth flows for Microsoft 365, Google Workspace, and Xero.
* **Phase 7:** Implement HIBP API polling logic for credential leaks.
* **Phase 8:** Enable manual scan triggers via Next.js API routes and Upstash Redis.
* **Phase 9:** Expand dashboard integration status cards and integrate Slack/Teams alerting.
