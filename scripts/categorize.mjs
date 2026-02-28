export const CATEGORIES = {
  "us-politics": {
    label: "\u{1f1fa}\u{1f1f8} US Politics",
    color: "#3b82f6",
    keywords: ["trump", "biden", "congress", "senate", "white house", "republican", "democrat", "executive order", "tariff", "gop", "dnc", "capitol hill", "oval office", "pentagon"]
  },
  "ukraine": {
    label: "\u{1f1fa}\u{1f1e6} Ukraine",
    color: "#fbbf24",
    keywords: ["ukraine", "kyiv", "zelenskyy", "zelensky", "crimea", "donbas", "kharkiv", "odesa", "ukrainian"]
  },
  "middle-east": {
    label: "\u{1f1f5}\u{1f1f8} Middle East",
    color: "#f97316",
    keywords: ["gaza", "israel", "hamas", "hezbollah", "iran", "syria", "yemen", "houthi", "netanyahu", "palestinian", "west bank", "tehran", "idf"]
  },
  "china": {
    label: "\u{1f1e8}\u{1f1f3} China",
    color: "#ef4444",
    keywords: ["china", "beijing", "xi jinping", "taiwan", "south china sea", "ccp", "chinese", "hong kong"]
  },
  "russia": {
    label: "\u{1f1f7}\u{1f1fa} Russia",
    color: "#a855f7",
    keywords: ["russia", "putin", "moscow", "kremlin", "russian"]
  },
  "europe": {
    label: "\u{1f1ea}\u{1f1fa} Europe",
    color: "#6366f1",
    keywords: ["eu", "european union", "nato", "macron", "scholz", "starmer", "uk", "britain", "brussels", "european"]
  },
  "asia": {
    label: "\u{1f30f} Asia-Pacific",
    color: "#ec4899",
    keywords: ["india", "modi", "japan", "korea", "asean", "pacific", "south korea", "north korea", "pyongyang"]
  },
  "africa": {
    label: "\u{1f30d} Africa",
    color: "#84cc16",
    keywords: ["africa", "sahel", "sudan", "ethiopia", "nigeria", "congo", "african", "kenyan", "somalia"]
  },
  "trade-economy": {
    label: "\u{1f4b0} Trade & Economy",
    color: "#10b981",
    keywords: ["tariff", "sanctions", "trade war", "economy", "inflation", "oil", "opec", "gdp", "recession", "interest rate", "federal reserve"]
  },
  "conflicts": {
    label: "\u{2694}\u{fe0f} Conflicts",
    color: "#f59e0b",
    keywords: ["war", "military", "troops", "airstrike", "offensive", "ceasefire", "casualties", "missile", "drone strike", "bombing", "artillery"]
  }
};

export function categorizeArticle(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();
  const matched = [];

  for (const [key, cat] of Object.entries(CATEGORIES)) {
    for (const keyword of cat.keywords) {
      if (text.includes(keyword)) {
        matched.push(key);
        break;
      }
    }
  }

  return matched.length > 0 ? matched : ["world"];
}
