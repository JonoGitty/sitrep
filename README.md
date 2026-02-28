# SITREP

Live geopolitical news tracker. War room terminal aesthetic. Updated every 30 minutes via GitHub Actions.

![GitHub Actions](https://github.com/JonoGitty/sitrep/actions/workflows/fetch-news.yml/badge.svg)

## What it does

- GitHub Actions fetches RSS feeds from Reuters, BBC, NYT, Al Jazeera, Politico every 30 minutes
- Articles are categorized by region/topic using keyword matching and deduplicated
- A static frontend renders everything as a dark, information-dense command center dashboard
- Zero cost — runs entirely on GitHub Pages + Actions free tier

## Quick Start

1. **Fork this repo** (or clone and push to your own)
2. **Enable GitHub Pages**: Settings > Pages > Source: "Deploy from branch" > Branch: `main`, folder: `/ (root)`
3. **Enable Actions**: Actions tab > enable workflows
4. **Trigger first run**: Actions > "Fetch News" > "Run workflow"

### Optional: AI Daily Briefing

Add your Anthropic API key as a repo secret:

Settings > Secrets and variables > Actions > New repository secret > `ANTHROPIC_API_KEY`

This generates a daily intelligence briefing summary using Claude.

## Categories

| Category | Focus |
|----------|-------|
| US Politics | Trump, Biden, Congress, White House, executive orders |
| Ukraine | Ukraine conflict, Zelenskyy, Donbas, Crimea |
| Middle East | Gaza, Israel, Hamas, Iran, Yemen, Houthis |
| China | Beijing, Xi Jinping, Taiwan, South China Sea |
| Russia | Putin, Moscow, Kremlin |
| Europe | EU, NATO, UK, France, Germany |
| Asia-Pacific | India, Japan, Korea, ASEAN |
| Africa | Sahel, Sudan, Ethiopia, Nigeria |
| Trade & Economy | Tariffs, sanctions, oil, OPEC, inflation |
| Conflicts | Military operations, airstrikes, ceasefires |

## News Sources

- BBC World, Middle East, Europe, Asia, Africa, US & Canada
- Reuters World
- NYT World, Politics
- Al Jazeera
- Politico

All via free RSS feeds. No API keys required for news.

## Cost

| Component | Cost |
|-----------|------|
| GitHub Pages | Free |
| GitHub Actions | Free (~30 min/month of 2,000 free) |
| RSS Feeds | Free |
| Claude API (optional) | ~$0.50/day |

## Local Development

```bash
npm install
node scripts/fetch-news.mjs
# Open index.html in browser
```

---

*Built with Claude Code. Zero cost.*
