const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

export function rateLimit(id: string, limit = 5, windowMs = 10000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(id);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(id, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
