"use client";

import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <div
      className={cn(
        "absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between left-0 top-0 items-end z-30S pt-3 pl-3  sm:pl-8 sm:pt-8"
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
            <LuSun className="!h-5 !w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <LuMoon className="absolute !h-5 !w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="ml-1">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
