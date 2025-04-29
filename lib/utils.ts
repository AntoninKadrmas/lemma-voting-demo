import { clsx, type ClassValue } from "clsx";
import { getImageProps } from "next/image";
import { twMerge } from "tailwind-merge";
import { AvailableLocales } from "./constants";
import env from "@/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function stripUrl(str?: string) {
  return str?.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function parseUrl(filename_disk?: string, key?: TransformationPresets) {
  return (
    (filename_disk &&
    (filename_disk.endsWith("jfif") || filename_disk.endsWith("jpeg"))
      ? filename_disk + ".jpg"
      : filename_disk) + (key ? `?key=${key}` : "")
  );
}

export function getImageSet(srcSet: string) {
  return srcSet
    .split(", ")
    .map((str: string) => {
      const [url, dpi] = str.split(" ");
      return `url("${url}") ${dpi}`;
    })
    .join(", ");
}

export function getBackgroundImage(imageProps: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  const {
    props: { srcSet },
  } = getImageProps(imageProps);

  return srcSet ? getImageSet(srcSet) : `url("${imageProps.src}")`;
}

export const getAssetUrl = (
  id?: string,
  key?: TransformationPresets,
  url = env.NEXT_PUBLIC_DIRECTUS_URL,
) => {
  return id ? parseUrl(`${url}assets/${id}`, key) : "";
};

export function parseTranslations<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Partial<{ translations: any[] | undefined | null }>,
>(value: T | undefined, lang: AvailableLocales): Omit<T, "translations"> {
  if (!value) {
    return value as any as T; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  const { translations, ...other } = value;
  return {
    ...other,
    ...(translations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.filter?.((t: any) => t.languages_code === lang)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .map(({ id, ...t }: any) => t)[0] as T),
  } as T;
}

export const areSetsEqual = (a: Set<number>, b: Set<number>) =>
  a.size === b.size &&
  [...a].every((x) => b.has(x)) &&
  [...b].every((x) => a.has(x));

export type TransformationPresets =
  | "thumb"
  | "full"
  | "800w"
  | "1200w"
  | "blur";
