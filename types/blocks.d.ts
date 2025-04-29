import type { AvailableLocales } from "@/utils/constants";
import type { HTMLAttributes } from "react";

export type BlockBaseProps = {
  className?: string;
} & { lang?: AvailableLocales } & Omit<
    HTMLAttributes<HTMLOrSVGElement>,
    "id" | "title"
  >;
