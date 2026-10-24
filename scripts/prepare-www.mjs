import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webDir = path.join(root, "www");
const requiredFiles = ["index.html", "manifest.webmanifest", "sw.js", "icon-192.svg", "icon-512.svg"];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  try {
    const info = await stat(fullPath);
    if (!info.isFile() || info.size === 0) throw new Error("not a non-empty file");
  } catch {
    throw new Error(`Required web app file is missing or empty: ${file}`);
  }
}

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });
for (const file of requiredFiles) await cp(path.join(root, file), path.join(webDir, file));

console.log(`Prepared Capacitor web assets in ${webDir}`);
console.log(`Copied: ${requiredFiles.join(", ")}`);
