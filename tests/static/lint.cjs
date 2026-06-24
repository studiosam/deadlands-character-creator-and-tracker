const { readFileSync, readdirSync, statSync } = require("node:fs");
const { join, relative } = require("node:path");

const root = process.cwd();
const ignored = new Set(["node_modules", ".git", "dist", "build"]);
const failures = [];

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (ignored.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) collectFiles(path, files);
    else files.push(path);
  }
  return files;
}

function checkNoNativeDialogs(file, text) {
  if (!file.includes(`${join("src")}${join("/", "app-ui.js")}`)) {
    const match = text.match(/\b(alert|confirm|prompt)\s*\(/);
    if (match)
      failures.push(`${relative(root, file)} uses native ${match[1]}().`);
  }
}

function checkSchemaVersion() {
  const config = readFileSync(join(root, "src", "config.js"), "utf8");
  if (!/APP_SCHEMA_VERSION\s*=/.test(config))
    failures.push("src/config.js must define APP_SCHEMA_VERSION.");
  const readme = readFileSync(join(root, "README.md"), "utf8");
  if (!/schemaVersion/.test(readme))
    failures.push("README.md must document schemaVersion exports.");
}

for (const file of collectFiles(root)) {
  if (!/\.(html|js|cjs|mjs)$/.test(file)) continue;
  checkNoNativeDialogs(file, readFileSync(file, "utf8"));
}
checkSchemaVersion();

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Static lint checks passed.");
