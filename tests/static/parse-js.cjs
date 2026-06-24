const { execFileSync } = require("node:child_process");
const { readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const ignored = new Set(["node_modules", ".git", "dist", "build"]);

function collectJsFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (ignored.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) collectJsFiles(path, files);
    else if (
      entry.endsWith(".js") ||
      entry.endsWith(".cjs") ||
      entry.endsWith(".mjs")
    )
      files.push(path);
  }
  return files;
}

for (const file of collectJsFiles(root)) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}

console.log("Static parse check passed.");
