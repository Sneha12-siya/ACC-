const Parser = require("rss-parser");
const parser = new Parser();

const feeds = [
  { category: "Defence", url: "https://news.google.com/rss/search?q=India+defence+OR+Indian+Air+Force+OR+DRDO+OR+military+exercise&hl=en-IN&gl=IN&ceid=IN:en" },
  { category: "National", url: "https://news.google.com/rss/search?q=India+national+current+affairs+government+scheme&hl=en-IN&gl=IN&ceid=IN:en" },
  { category: "International", url: "https://news.google.com/rss/search?q=international+current+affairs+India+relations&hl=en-IN&gl=IN&ceid=IN:en" },
  { category: "Science", url: "https://news.google.com/rss/search?q=ISRO+science+technology+India+current+affairs&hl=en-IN&gl=IN&ceid=IN:en" },
  { category: "Economy", url: "https://news.google.com/rss/search?q=India+economy+RBI+budget+current+affairs&hl=en-IN&gl=IN&ceid=IN:en" },
  { category: "Sports", url: "https://news.google.com/rss/search?q=India+sports+awards+current+affairs&hl=en-IN&gl=IN&ceid=IN:en" }
];

function cleanTitle(title = "") {
  return title.replace(/ - .+$/, "").trim();
}

module.exports = async function handler(req, res) {
  try {
    const allNews = [];

    for (const feed of feeds) {
      const parsed = await parser.parseURL(feed.url);
      parsed.items.slice(0, 5).forEach((item) => {
        const title = cleanTitle(item.title);
        allNews.push({
          category: feed.category,
          title,
          link: item.link,
          publishedAt: item.pubDate || "",
          summary: `${title}. ACC Focus: remember the key person, place, organization, date, and why this update matters.`,
          importance: feed.category === "Defence" ? "Very High" : "High",
          mcq: {
            question: `This headline belongs mainly to which ACC category: "${title}"?`,
            options: ["Defence", "National", "International", "Science", "Economy", "Sports"],
            answer: feed.category
          }
        });
      });
    }

    allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.status(200).json({
      success: true,
      updatedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      total: allNews.length,
      news: allNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Live current affairs could not be fetched right now.",
      error: error.message
    });
  }
};
