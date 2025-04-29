export const AVAIL_LOCALES = ["cz-CZ", "en-US"] as const;
export type AvailableLocales = (typeof AVAIL_LOCALES)[number];
