import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:8080";
const PAGES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "services", path: "/services" },
  { name: "projects", path: "/projects" },
  { name: "contact", path: "/contact" },
];

const reportsDir = path.join(rootDir, "lighthouse-reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log("Starting Lighthouse audits on key pages...");
const summary = [];

for (const p of PAGES) {
  const targetUrl = `${BASE_URL}${p.path}`;
  const outJson = path.join(reportsDir, `${p.name}.json`);
  console.log(`\nAuditing ${p.name} (${targetUrl})...`);

  try {
    const cmd = `npx --yes lighthouse "${targetUrl}" --preset=desktop --throttling-method=provided --chrome-flags="--headless --no-sandbox --disable-gpu" --output=json --output-path="${outJson}" --only-categories=performance,accessibility,seo --quiet`;
    execSync(cmd, {
      cwd: rootDir,
      env: { ...process.env, CHROME_PATH },
      stdio: "inherit",
      timeout: 120000,
    });

    if (fs.existsSync(outJson)) {
      const data = JSON.parse(fs.readFileSync(outJson, "utf8"));
      const categories = data.categories;
      const perf = Math.round((categories.performance?.score || 0) * 100);
      const a11y = Math.round((categories.accessibility?.score || 0) * 100);
      const seo = Math.round((categories.seo?.score || 0) * 100);

      const result = { page: p.name, url: p.path, performance: perf, accessibility: a11y, seo };
      summary.push(result);
      console.log(`Result for ${p.name}: Performance: ${perf} | Accessibility: ${a11y} | SEO: ${seo}`);

      // Log audits that need attention
      if (perf < 90 || a11y < 90 || seo < 90) {
        console.log(`\n--- Potential improvements for ${p.name} ---`);
        for (const [auditId, audit] of Object.entries(data.audits)) {
          if (audit.score !== null && audit.score < 0.9 && audit.details?.type !== "opportunity") {
            console.log(`  [${auditId}] (score: ${audit.score}): ${audit.title} - ${audit.description?.slice(0, 100)}`);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Audit failed for ${p.name}:`, err.message);
  }
}

console.log("\n==========================================");
console.log("LIGHTHOUSE SUMMARY RESULTS");
console.log("==========================================");
console.table(summary);

fs.writeFileSync(path.join(reportsDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
