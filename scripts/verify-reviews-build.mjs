import fs from "node:fs";
import path from "node:path";

const servicePages = fs.readdirSync("build_php/services", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join("build_php/services", entry.name, "index.html"))
  .filter((file) => fs.existsSync(file));
if (servicePages.length === 0) throw new Error("No rendered service pages found");
const serviceHtml = servicePages.map((file) => ({
  file,
  html: fs.readFileSync(file, "utf8"),
}));
const homeHtml = fs.readFileSync("build_php/index.html", "utf8");

console.log("=== RENDERED SERVICE PAGES ===");
console.log("Service pages checked:", serviceHtml.length);
console.log("All have reviews section:", serviceHtml.every(({ html }) => html.includes('id="service-reviews"')));
console.log("At least one customer review rendered:", serviceHtml.some(({ html }) => /مراجعة|تقييم|عميل/u.test(html)));
console.log("No self-serving AggregateRating in Schema:", serviceHtml.every(({ html }) => !html.includes('"@type": "AggregateRating"')));

console.log("\n=== HOMEPAGE ===");
console.log("No self-serving AggregateRating in Schema:", !homeHtml.includes('"@type": "AggregateRating"'));
console.log("H1 present:", homeHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.trim());
