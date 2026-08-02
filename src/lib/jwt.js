const encoder = new TextEncoder();

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
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
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
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (e) {
    return null;
  }
}
