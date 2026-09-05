import crypto from "node:crypto";

const PRIVATE_UPLOAD_PATTERN = /^\/api\/private-uploads\/([^/?#]+)$/;

export function refreshPrivateUploadUrl(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (!raw.startsWith("/api/private-uploads/")) return raw;

  const path = raw.split("?")[0];
  const match = path.match(PRIVATE_UPLOAD_PATTERN);
  const filename = match ? decodeURIComponent(match[1]) : "";
  const secret = process.env.SESSION_SECRET;
  if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename) || !secret) return raw;

  const expires = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${filename}.${expires}`)
    .digest("base64url");
  return `/api/private-uploads/${encodeURIComponent(filename)}?expires=${expires}&signature=${signature}`;
}