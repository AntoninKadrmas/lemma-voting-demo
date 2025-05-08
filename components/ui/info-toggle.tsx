"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LuInfo } from "react-icons/lu";

export function InfoToggle({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className,
        "left-[10rem] top-3 sm:left-[11rem] sm:top-8 absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between items-end z-20"
      )}
    >
      <Button
        variant="secondary"
        size="icon"
        onClick={onClick}
        className={cn(
          "h-10 w-10 ",
          "bg-primary text-primary-foreground dark:text-shadow-white"
        )}
      >
        <LuInfo className="w-5 h-5" />
      </Button>
    </div>
  );
}
