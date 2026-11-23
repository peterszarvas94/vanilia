import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "::";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

// In-memory store for demo image uploads during local testing (max 25 images, 10MB each)
const uploads = new Map();
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    // Demo stack-agnostic image upload endpoint: POST /api/upload with raw image body + Content-Type
    if (req.method === "POST" && url.pathname === "/api/upload") {
      const contentType = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
      if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
        res.writeHead(415, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Unsupported image type: ${contentType || "unknown"}` }));
        return;
      }
      const buffer = await readBody(req, MAX_UPLOAD_BYTES);
      const id = crypto.randomUUID();
      if (uploads.size >= 25) {
        const oldestKey = uploads.keys().next().value;
        uploads.delete(oldestKey);
      }
      uploads.set(id, { buffer, contentType });
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify({ url: `/uploads/${id}`, size: buffer.length, contentType }));
      return;
    }

    // Serve uploaded demo images
    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
      const id = url.pathname.slice("/uploads/".length);
      const item = uploads.get(id);
      if (!item) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": item.contentType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(item.buffer);
      return;
    }

    // Static file serving
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      return;
    }

    const rawPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const resolved = path.resolve(__dirname, "." + rawPath);
    if (!resolved.startsWith(__dirname + path.sep) && resolved !== __dirname) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

    const stat = await fs.stat(resolved).catch(() => null);
    if (!stat || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(resolved).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    const data = await fs.readFile(resolved);
    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "no-store",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch (err) {
    const status = err?.status || 500;
    res.writeHead(status, { "Content-Type": "text/plain" });
    res.end(err?.message || "Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Vanilla WYSIWYG dev server running at http://${HOST}:${PORT}`);
});
