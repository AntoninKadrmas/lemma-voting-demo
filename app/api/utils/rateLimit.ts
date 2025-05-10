const rateLimitStore = new Map<
  string,
  { count: number; lastRequest: number }
>();

export function rateLimit(
  id: string,
  method: "GET" | "POST",
  endpoint: string,
  limit = 5,
  windowMs = 10000
): boolean {
  const now = Date.now();

  // Construct a unique key based on the method and endpoint
  const key = `${method}:${endpoint}:${id}`;

  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.lastRequest > windowMs) {
    // Reset the count if the window has expired
    rateLimitStore.set(key, { count: 1, lastRequest: now });
    return true;
  }

  if (entry.count >= limit) {
    console.log("Rate limit exceeded.");
    return false; // Too many requests in the time window
  }

  // Increment count for requests
  entry.count += 1;
  return true;
}
