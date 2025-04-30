import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";
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
            "absolute -top-2 -right-2 px-2 py-1 flex justify-center items-baseline rounded-2xl  font-bold",
            { "bg-destructive dark:bg-destructive text-white": changed },
            { "bg-black text-white dark:bg-white dark:text-black": !changed }
          )}
        >
          <span className="font-bold">{actualAmount}</span>
          <span className="font-light text-[12px]">/{maxAmount}</span>
        </div>
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
        "absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between right-0 bottom-0 items-end z-20 pb-3 pr-3 sm:pr-8 sm:pb-8",
        className
      )}
    >
      <Skeleton className="h-14 w-32" />
    </div>
  );
};
