import env from "@/env";
import { createDirectus, rest, staticToken } from "@directus/sdk";
export const directus = createDirectus(env.NEXT_PUBLIC_DIRECTUS_URL || "")
  .with(
    rest({
      onRequest: (options) => ({
        ...options,
        cache: "force-cache",
        mode: "no-cors",
      }),
    }),
  )
  .with(staticToken(env.DIRECTUS_SECRET_TOKEN || ""));
