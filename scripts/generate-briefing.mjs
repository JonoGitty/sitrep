import { readFileSync, writeFileSync, existsSync } from "fs";

// Optional: Claude API daily briefing generator
// Requires ANTHROPIC_API_KEY environment variable

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("No ANTHROPIC_API_KEY set — skipping briefing generation");
    return;
  }

  if (!existsSync("data/news.json")) {
    console.log("No news.json found — skipping briefing");
    return;
  }

  const newsData = JSON.parse(readFileSync("data/news.json", "utf-8"));
  const top20 = newsData.articles.slice(0, 20);

  const headlines = top20
    .map((a, i) => `${i + 1}. [${a.source}] ${a.title}`)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a geopolitical analyst writing a daily intelligence briefing. Based on these top headlines, write a concise 3-paragraph morning briefing covering the most significant developments. Be factual, analytical, and direct. No fluff.\n\nHeadlines:\n${headlines}\n\nAlso provide the top 5 stories with a one-sentence significance note for each.\n\nRespond in JSON format:\n{\n  "summary": "Three paragraph briefing...",\n  "topStories": [\n    { "headline": "...", "significance": "..." }\n  ]\n}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`Claude API error: ${res.status}`);
    return;
  }

  const data = await res.json();
  const text = data.content[0].text;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Could not parse briefing JSON from response");
    return;
  }

  const briefing = JSON.parse(jsonMatch[0]);
  briefing.date = new Date().toISOString().split("T")[0];
  briefing.generatedAt = new Date().toISOString();

  writeFileSync("data/briefing.json", JSON.stringify(briefing, null, 2));
  console.log("Wrote data/briefing.json");
}

main().catch((err) => {
  console.error("Briefing generation failed:", err.message);
});
