"use client";

import { SimpleProgressivePulse } from "@/app/[locale]/voting/[voteId]/components/SimlpeProgrsivePulse";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LuClock } from "react-icons/lu";

export function TimeToggle({
  onClick,
  className,
  endTime,
}: {
  onClick?: () => void;
  className?: string;
  endTime: string;
}) {
  return (
    <div
      className={cn(
        className,
        "left-[7rem] top-3 sm:left-[8rem] sm:top-8 absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between items-end z-20"
      )}
    >
      <SimpleProgressivePulse className="bg-primary" endDate={endTime}>
        <Button
          variant="secondary"
          size="icon"
          onClick={onClick}
          className={cn(
            "h-10 w-10 bg-transparent!",
            "bg-primary text-primary-foreground dark:text-shadow-white"
          )}
        >
          <LuClock className="w-5 h-5" />
        </Button>
      </SimpleProgressivePulse>
    </div>
  );
}
