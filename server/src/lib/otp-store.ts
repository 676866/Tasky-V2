/** In-memory OTP store: email -> { otp, expiresAt }. Cleans expired entries. */
const store = new Map<
  string,
  { otp: string; expiresAt: number }
>();

const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function setOtp(email: string, otp: string): void {
  const normalized = email.toLowerCase().trim();
  store.set(normalized, { otp, expiresAt: Date.now() + TTL_MS });
}

export function verifyOtp(email: string, otp: string): boolean {
  const normalized = email.toLowerCase().trim();
  const entry = store.get(normalized);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(normalized);
    return false;
  }
  const valid = entry.otp === otp;
  if (valid) store.delete(normalized);
  return valid;
}

function cleanup(): void {
  const now = Date.now();
  for (const [email, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(email);
  }
}
setInterval(cleanup, 60 * 1000);
