import { createDirectus, rest, createItem, staticToken } from "@directus/sdk";
export const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_SECRET_TOKEN));
