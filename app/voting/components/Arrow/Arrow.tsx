import { type FC } from "react";
import { NarrowHorizontalLine, VerticalLine, WideHorizontalLine } from "./Line";
import { cn } from "@/lib/utils";
import { type LineProps } from "./Line";

type ArrowProps = LineProps;

export const TopLeftArrow: FC<ArrowProps> = ({ className, ...props }) => {
  return (
    <>
      <VerticalLine
        className={cn(className, "left-0 top-0")}
        {...props}
      />
      <NarrowHorizontalLine
        className={cn(className, "left-0 top-0")}
        {...props}
      />
    </>
  );
};

export const TopRightArrow: FC<ArrowProps> = ({ className, ...props }) => {
  return (
    <>
      <VerticalLine
        className={cn(className, "right-0 top-0")}
        {...props}
      />
      <WideHorizontalLine
        className={cn(className, "right-0 top-0")}
        {...props}
      />
    </>
  );
};

export const BottomLeftArrow: FC<ArrowProps> = ({ className, ...props }) => {
  return (
    <>
      <VerticalLine
        className={cn(className, "bottom-0 left-0")}
        {...props}
      />
      <WideHorizontalLine
        className={cn(className, "bottom-0 left-0")}
        {...props}
      />
    </>
  );
};

export const BottomRightArrow: FC<ArrowProps> = ({ className, ...props }) => {
  return (
    <>
      <VerticalLine
        className={cn(className, "bottom-0 right-0")}
        {...props}
      />
      <NarrowHorizontalLine
        className={cn(className, "bottom-0 right-0")}
        {...props}
      />
    </>
  );
};
