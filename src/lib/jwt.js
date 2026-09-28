const encoder = new TextEncoder();
// Admin sessions are intentionally fixed-duration and are not refreshed per request.
const ADMIN_SESSION_DURATION = process.env.JWT_EXPIRES_IN || "7d";
const DURATION_UNITS_IN_SECONDS = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

function parseDurationSeconds(duration) {
  const match = /^(\d+)([smhd])$/i.exec(duration.trim());
  if (!match) {
    throw new Error(
      "JWT_EXPIRES_IN must be a positive duration in s, m, h, or d",
    );
  }

  const amount = Number(match[1]);
  const unitSeconds = DURATION_UNITS_IN_SECONDS[match[2].toLowerCase()];
  const seconds = amount * unitSeconds;
  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error("JWT_EXPIRES_IN is outside the supported duration range");
  }

  return seconds;
}

export const ADMIN_SESSION_SECONDS = parseDurationSeconds(
  ADMIN_SESSION_DURATION,
);
export const ADMIN_SESSION_MILLISECONDS = ADMIN_SESSION_SECONDS * 1000;

async function getCryptoKey() {
  const secret =
    process.env.JWT_SECRET || "default-secret-placeholder-minimum-32-chars";
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(payload) {
  const key = await getCryptoKey();
  const stringifiedPayload = JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS,
  });
  const data = encoder.encode(stringifiedPayload);
  const signature = await crypto.subtle.sign("HMAC", key, data);

  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${btoa(stringifiedPayload)}.${signatureHex}`;
}

export async function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const payloadStr = atob(parts[0]);
    const signatureHex = parts[1];
    const key = await getCryptoKey();

    const sigBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
    );

    const data = encoder.encode(payloadStr);
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, data);

    if (!isValid) return null;

    const payload = JSON.parse(payloadStr);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      !Number.isSafeInteger(payload.exp) ||
      payload.exp <= nowSeconds ||
      payload.exp > nowSeconds + ADMIN_SESSION_SECONDS
    ) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}
