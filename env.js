import dotenv from "dotenv";
dotenv.config();

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DIRECTUS_SECRET_TOKEN: z.string(),
    DIRECTUS_USERNAME: z.string().optional(),
    DIRECTUS_PASSWORD: z.string().optional(),
    NEXTAUTH_USERNAME: z.string().optional(),
    NEXRAUTH_PASSWORD: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_DIRECTUS_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DIRECTUS_SECRET_TOKEN: process.env.DIRECTUS_SECRET_TOKEN,
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
    DIRECTUS_PASSWORD: process.env.DIRECTUS_PASSWORD,
    DIRECTUS_USERNAME: process.env.DIRECTUS_USERNAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXTAUTH_USERNAME: process.env.NEXTAUTH_USERNAME,
    NEXRAUTH_PASSWORD: process.env.NEXRAUTH_PASSWORD,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

export default env;
