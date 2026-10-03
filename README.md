# Cutech Pty Ltd — Corporate Website

Official corporate website repository for **Cutech Pty Ltd** (`cutech.com.au`), parent company of [ReadingWillow.com](https://www.readingwillow.com).

Designed, maintained, and deployed via Antigravity AI assistant with GitHub Pages and automated GitHub Actions.

---

## Architecture & Features

- **Tech Stack**: Pure modern semantic HTML5, accessible CSS with design tokens, and lightweight vanilla JS (Zero heavy build dependencies, instant loading).
- **Domain**: `cutech.com.au` (Registrar: Crazy Domains).
- **Hosting**: Free GitHub Pages with automated SSL encryption.
- **Continuous Deployment**: Auto-deploys via `.github/workflows/deploy.yml` on push to `main`.
- **Scheduled Automation**: Automated weekly health & link monitoring via `.github/workflows/scheduled-maintenance.yml`.

---

## Crazy Domains DNS Setup

To connect `cutech.com.au` and `www.cutech.com.au` to GitHub Pages:

1. Log in to your **Crazy Domains** account -> **Domain Manager** -> `cutech.com.au` -> **DNS Settings**.
2. Add / Update the **4 `A` Records** for `@` (or leave hostname empty if required by Crazy Domains):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add **1 `CNAME` Record**:
   - Host / Name: `www`
   - Points to / Value: `<your-github-username>.github.io`
4. In your GitHub Repository:
   - Go to **Settings** -> **Pages**
   - Under **Custom domain**, enter: `cutech.com.au`
   - Check **Enforce HTTPS** (once DNS propagation finishes).

---

## Local Testing & Preview

To preview the website locally:

```bash
# Using Python 3 built-in server:
python3 -m http.server 8080

# Or with Node / npx:
npx serve .
```
Then open `http://localhost:8080` in your browser.

---

## Ongoing AI Management

Whenever you want to:
- Update company details, ABN, registered address, or directors.
- Add new initiatives alongside ReadingWillow.
- Modify mission statements, values, or styling.
- Adjust cron schedules or add custom automated workflows.

Simply ask me in the conversation and I will update the code, test it, and publish the updates.
