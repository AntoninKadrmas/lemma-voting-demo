"use client";
import type { ImageLoaderProps } from "next/image";

interface DirectusImageProps {
  fit?: "cover" | "contain" | "inside" | "outside";
  key?: "800w" | "1200w" | "1500w" | "thumbnail";
}

export default function directusImageLoader({
  src,
  width,
  quality,
  fit,
  key = "1200w",
}: ImageLoaderProps & DirectusImageProps) {
  // const url = new URL(`${imgDomain}assets/${imageID}`);
  const url = new URL(src);
  if (!width) {
    url.searchParams.set("key", key);
  } else {
    url.searchParams.set("fit", fit ?? "contain");
    url.searchParams.set("width", width.toString());
    url.searchParams.set("quality", quality?.toString() ?? "75");
  }
  return url.href;
}
