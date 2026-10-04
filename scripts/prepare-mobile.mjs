import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const files = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "logo.png",
  "icon-192.png",
  "icon-512.png",
  "robots.txt"
];

for (const file of files) {
  await cp(resolve(root, file), resolve(dist, file));
}

console.log("LIFEPASS web assets prepared for Capacitor:", dist);
