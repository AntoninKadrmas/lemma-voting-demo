import { type FC } from "react";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LineProps = HTMLAttributes<HTMLDivElement>;

const Line: FC<LineProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(className, "absolute bg-current duration-300 ease-out")}
      {...props}
    />
  );
};

const HorizontalLine: FC<LineProps> = ({ className, ...props }) => {
  return (
    <Line
      className={cn(className, "h-[4px] w-6")}
      {...props}
    />
  );
};

export const NarrowHorizontalLine: FC<LineProps> = ({
  className,
  ...props
}) => {
  return (
    <HorizontalLine
      className={cn(className, "narrow-horizontal-line")}
      {...props}
    />
  );
};

export const WideHorizontalLine: FC<LineProps> = ({ className, ...props }) => {
  return (
    <HorizontalLine
      className={cn(className, "wide-horizontal-line")}
      {...props}
    />
  );
};

export const VerticalLine: FC<LineProps> = ({ className, ...props }) => {
  return (
    <Line
      className={cn(className, "vertical-line", "h-6 w-[4px]")}
      {...props}
    />
  );
};
