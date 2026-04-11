import crypto from "crypto";
import speakeasy from "speakeasy";

function getEncryptionKey() {
  const hexKey = process.env.ERP_ENCRYPTION_KEY || process.env.MFA_ENCRYPTION_KEY;
  if (hexKey && hexKey.length === 64) {
    return Buffer.from(hexKey, "hex");
  }
  return crypto.createHash("sha256").update(process.env.JWT_SECRET || "govcon-totp-fallback").digest();
}

export function encryptTotpSecret(plain) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptTotpSecret(payload) {
  const key = getEncryptionKey();
  const [ivHex, tagHex, encHex] = payload.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

export function verifyTotpCode(encryptedSecret, token) {
  const secret = decryptTotpSecret(encryptedSecret);
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2
  });
}
