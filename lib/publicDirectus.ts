import { createDirectus, readFile, rest } from "@directus/sdk";
import { type ApiCollections } from "@/types/api-collection";
import { env } from "@/env";

const publicDirectus = createDirectus<ApiCollections>(
  env.NEXT_PUBLIC_DIRECTUS_URL,
).with(
  rest({
    onRequest: (options) => ({
      ...options,
      cache: "force-cache",
      mode: "no-cors",
    }),
  }),
);

export default publicDirectus;

export const getFileDataMetadata = async (id: string) => {
  const { width, height, ...props } = await publicDirectus.request(
    readFile(id),
  );

  return width && height
    ? {
        src: `${env.NEXT_PUBLIC_DIRECTUS_URL}assets/${id}`,
        width,
        height,
        ...props,
      }
    : {
        src: `${env.NEXT_PUBLIC_DIRECTUS_URL}assets/${id}`,
      };
};

export const handleError = console.error;
