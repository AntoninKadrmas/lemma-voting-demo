"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CSSProperties, FC, HTMLAttributes, useEffect, useState } from "react";
import { LuLoader } from "react-icons/lu";

type SaveButtonProps = {
  className?: string;
  isPending: boolean;
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: () => void;
  changed: boolean;
  maxAmount?: number;
  actualAmount?: number;
  voteMessage?: string;
  counter?: number;
} & HTMLAttributes<HTMLOrSVGElement>;

export const SaveButton: FC<SaveButtonProps> = ({
  className,
  isPending,
  isLoading,
  isFetching,
  onSubmit,
  changed,
  maxAmount,
  actualAmount,
  voteMessage,
  counter,
  ...props
}) => {
  return (
    <div
      className={cn(
        "absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between right-4 bottom-3 sm:right-8 sm:bottom-8 items-end z-20",
        className
      )}
      {...props}
    >
      <Button
        variant="default"
        size="default"
        onClick={onSubmit}
        disabled={!changed || isPending || isLoading || isFetching}
        className={cn(
          !changed || isPending || isLoading
            ? "cursor-none brightness-50"
            : "cursor-pointer",
          "h-14 w-auto relative p-0"
        )}
      >
        <div className="w-full h-full flex justify-center items-center relative m-4 gap-1">
          {/* {!isPending && <LuSave className="!w-5 !h-5" />} */}
          {isPending && <LuLoader className="animate-spin !w-5 !h-5" />}
          {voteMessage}
        </div>
        <div
          className={cn(
            "absolute -top-3 -right-2 px-2 py-1 h-[27.5px] flex justify-center items-baseline rounded-2xl  font-bold",
            { "bg-destructive dark:bg-destructive text-white": changed },
            { "bg-black text-white dark:bg-white dark:text-black": !changed }
          )}
        >
          <span className="font-bold">{actualAmount}</span>
          <span className="font-light text-[12px]">/{maxAmount}</span>
        </div>
        {changed && changed && (
          <div
            className={cn(
              "absolute -top-3 -left-2 px-2 py-1 h-[27.5px] flex justify-center items-center rounded-2xl font-bold",
              "bg-black text-white dark:bg-white dark:text-black"
            )}
          >
            <span className="countdown font-bold">
              <span style={{ "--value": counter } as CSSProperties}>30</span>
            </span>
          </div>
        )}
      </Button>
    </div>
  );
};

export const SaveButtonFallback: FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between right-0 bottom-3 sm:right-4 sm:bottom-8 items-end z-20",
        className
      )}
    >
      <Skeleton className="h-14 w-32" />
    </div>
  );
};
