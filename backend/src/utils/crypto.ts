import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export function encryptJson(masterKeyBase64: string, obj: unknown): string {
  const key = Buffer.from(masterKeyBase64, 'base64');
  if (key.length !== 32) throw new Error('PII_MASTER_KEY must be 32 bytes base64');

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decryptJson(masterKeyBase64: string, payloadBase64: string): unknown {
  const key = Buffer.from(masterKeyBase64, 'base64');
  const raw = Buffer.from(payloadBase64, 'base64');

  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}
