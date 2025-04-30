"use client";

import * as React from "react";
import { CZ, US } from "country-flag-icons/react/3x2";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AvailableLocales } from "@/lib/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function LanguageToggle({ lang }: { lang?: AvailableLocales }) {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between left-14 top-3 sm:left-20 sm:top-8 items-end z-20"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-10 w-10 ",
              "bg-primary text-primary-foreground dark:text-shadow-white"
            )}
          >
            {lang === "cz-CZ" && <CZ title="Czech Republic" className="..." />}
            {lang === "en-US" && <US title="United States" className="..." />}
            <span className="sr-only">Toggle language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="ml-1">
          <Link href={`/cz/${pathname.substring(4)}`} locale="cz-CZ">
            <DropdownMenuItem
              onClick={() => {
                localStorage.setItem("lang", "cz-CZ");
              }}
            >
              <CZ className="..." />
              <span className="ml-2">Čeština</span>
            </DropdownMenuItem>
          </Link>
          <Link href={`/en/${pathname.substring(4)}`} locale="en-US">
            <DropdownMenuItem
              onClick={() => {
                localStorage.setItem("lang", "en-US");
              }}
            >
              <US className="..." />
              <span className="ml-2">English</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
