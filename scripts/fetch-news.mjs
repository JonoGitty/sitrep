import { XMLParser } from "fast-xml-parser";
import { createHash } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { categorizeArticle } from "./categorize.mjs";

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC", category: "world" },
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC", category: "middle-east" },
  { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml", source: "BBC", category: "europe" },
  { url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml", source: "BBC", category: "asia" },
  { url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", source: "BBC", category: "africa" },
  { url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml", source: "BBC", category: "us-politics" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NYT", category: "world" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", source: "NYT", category: "us-politics" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera", category: "world" },
  { url: "https://www.politico.com/rss/politics08.xml", source: "Politico", category: "us-politics" },
  { url: "https://feeds.reuters.com/reuters/worldNews", source: "Reuters", category: "world" },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function makeId(url) {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function stripHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function fetchFeed(feed) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "User-Agent": "SITREP-News-Bot/1.0" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[FAIL] ${feed.source} (${feed.url}): HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const parsed = parser.parse(xml);

    // Handle both RSS and Atom formats
    let items = [];
    if (parsed.rss?.channel?.item) {
      items = Array.isArray(parsed.rss.channel.item)
        ? parsed.rss.channel.item
        : [parsed.rss.channel.item];
    } else if (parsed.feed?.entry) {
      items = Array.isArray(parsed.feed.entry)
        ? parsed.feed.entry
        : [parsed.feed.entry];
    }

    const articles = items.map((item) => {
      const title = stripHtml(item.title || "");
      const description = stripHtml(item.description || item.summary || item["media:description"] || "");
      const link = item.link?.["@_href"] || item.link || item.guid || "";
      const pubDate = item.pubDate || item.published || item.updated || "";

      const url = typeof link === "object" ? (link["@_href"] || "") : String(link);
      const categories = categorizeArticle(title, description);

      return {
        id: makeId(url || title),
        title,
        source: feed.source,
        url: url,
        publishedAt: parseDate(pubDate).toISOString(),
        categories,
        primaryCategory: categories[0],
        snippet: description.slice(0, 250),
      };
    });

    console.log(`[OK]   ${feed.source}: ${articles.length} articles`);
    return articles.filter((a) => a.title.length > 0);
  } catch (err) {
    console.error(`[FAIL] ${feed.source}: ${err.message}`);
    return [];
  }
}

function deduplicateArticles(articles) {
  const seen = new Map();

  for (const article of articles) {
    const normTitle = article.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    const words = normTitle.split(/\s+/).slice(0, 8).join(" ");

    if (!seen.has(words)) {
      seen.set(words, article);
    }
  }

  return Array.from(seen.values());
}

async function main() {
  console.log("=== SITREP NEWS FETCH ===");
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Feeds: ${RSS_FEEDS.length}\n`);

  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeed(feed))
  );

  let allArticles = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  console.log(`\nTotal raw articles: ${allArticles.length}`);

  // Deduplicate
  allArticles = deduplicateArticles(allArticles);
  console.log(`After dedup: ${allArticles.length}`);

  // Sort by date (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Keep latest 150
  allArticles = allArticles.slice(0, 150);

  // Mark breaking (< 1 hour old)
  const now = Date.now();
  allArticles = allArticles.map((a) => ({
    ...a,
    isBreaking: (now - new Date(a.publishedAt).getTime()) < 3600000,
  }));

  const output = {
    lastUpdated: new Date().toISOString(),
    articleCount: allArticles.length,
    articles: allArticles,
  };

  // Ensure data directory exists
  if (!existsSync("data")) mkdirSync("data", { recursive: true });
  if (!existsSync("data/archive")) mkdirSync("data/archive", { recursive: true });

  // Write current data
  writeFileSync("data/news.json", JSON.stringify(output, null, 2));
  console.log(`\nWrote data/news.json (${allArticles.length} articles)`);

  // Write daily archive
  const today = new Date().toISOString().split("T")[0];
  writeFileSync(`data/archive/${today}.json`, JSON.stringify(output, null, 2));
  console.log(`Wrote data/archive/${today}.json`);

  console.log("\n=== DONE ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
