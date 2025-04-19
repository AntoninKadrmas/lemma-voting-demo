"use client";

import {
  Dispatch,
  FC,
  ForwardedRef,
  forwardRef,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

interface ISelectProps {
  placeholder: string;
  options: Option[];
  selectedOptions: string[];
  isOpen: boolean;
  className?: string;
  setSelectedOptions: Dispatch<SetStateAction<string[]>>;
}

const MultipleSelect = forwardRef<HTMLDivElement, ISelectProps>(
  (
    {
      placeholder,
      isOpen,
      options: values,
      className,
      selectedOptions: selectedItems,
      setSelectedOptions: setSelectedItems,
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (value: string) => {
      setSelectedItems((current: string[]) => {
        if (current.includes(value)) {
          return current.filter((v: string) => v !== value);
        }
        return [...current, value];
      });
    };

    useEffect(() => {
      if (!isOpen) {
        setOpen(false);
      }
    }, [isOpen]);

    return (
      <div className={cn("relative", className)} ref={ref}>
        <Button
          variant="secondary"
          aria-expanded={open}
          className="w-full h-14 rounded-full shadow-lg overflow-hidden text-ellipsis whitespace-nowrap"
          role="combobox"
          onClick={() => setOpen(!open)}
        >
          <p className="w-full flex justify-between text-sm">
            {" "}
            {selectedItems.length > 0
              ? `${selectedItems.length} selected`
              : placeholder}
          </p>
          <LuChevronDown />
        </Button>
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md transition-all duration-100 ease-in-out",
            {
              "h-auto w-full opacity-100 p-2": open,
              "h-0 w-0 overflow-hidden opacity-0": !open,
            }
          )}
        >
          {values.map((value) => (
            <div
              key={value.value}
              className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-all duration-100 ease-in-out",
                selectedItems.includes(value.value) &&
                  "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSelect(value.value)}
            >
              <span
                className={cn(
                  "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
                  selectedItems.includes(value.value)
                    ? "opacity-100"
                    : "opacity-0"
                )}
              >
                <LuCheck className="h-4 w-4" />
              </span>
              {value.label}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default MultipleSelect;
