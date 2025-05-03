"use client";

import CountdownWrapper from "@/app/[locale]/voting/[voteId]/components/CountdownWrapper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { LuInfo } from "react-icons/lu";

export function TimeToggle({
  onClick,
  className,
  endTime,
  icon,
}: {
  onClick?: () => void;
  className?: string;
  endTime: string;
  icon  : ReactNode;
}) {
  const Icon = icon;
  return (
    <div
      className={cn(
        className,
        "absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between items-end z-20"
      )}
    >
      <CountdownWrapper endTime={endTime}>
        <Button
          variant="secondary"
          size="icon"
          onClick={onClick}
          className={cn(
            "h-10 w-10 ",
            "bg-primary text-primary-foreground dark:text-shadow-white"
          )}
        >
          {icon ?? <LuInfo className="w-5 h-5" />}
        </Button>
      </CountdownWrapper>
    </div>
  );
}
