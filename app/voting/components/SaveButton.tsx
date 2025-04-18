import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";
import { LuLoader, LuSave } from "react-icons/lu";

type SaveButtonProps = {
  className?: string;
  isPending: boolean;
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: () => void;
  changesAmount: number;
} & HTMLAttributes<HTMLOrSVGElement>;

export const SaveButton: FC<SaveButtonProps> = ({
  className,
  isPending,
  isLoading,
  isFetching,
  onSubmit,
  changesAmount,
  ...props
}) => {
  return (
    <div
      className={cn(
        "absolute w-auto transition-all duration-100 ease-in-out flex flex-row justify-between right-0 bottom-0 items-end z-20 pb-3 pr-3 sm:pr-8 sm:pb-8",
        className
      )}
      {...props}
    >
      <Button
        variant="default"
        size="icon"
        onClick={onSubmit}
        disabled={changesAmount == 0 || isPending || isLoading || isFetching}
        className={cn(
          changesAmount == 0 || isPending || isLoading
            ? "cursor-none brightness-50"
            : "cursor-pointer",
          "h-14 w-14 relative"
        )}
      >
        <div className="w-full h-full flex justify-center items-center relative">
          {!isPending && <LuSave className="!w-5 !h-5" />}
          {isPending && <LuLoader className="animate-spin !w-5 !h-5" />}
          {changesAmount > 0 && (
            <div className="absolute -top-2 -right-2 px-2 py-1 flex justify-center items-center rounded-2xl bg-destructive dark:bg-destructive text-white font-bold">
              {changesAmount}
            </div>
          )}
        </div>
      </Button>
    </div>
  );
};
