"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LuFilter } from "react-icons/lu";
import { MdSearch, MdCategory, MdDelete } from "react-icons/md";
import { FilterOption, FilterState, SearchOption } from "./VotePage";
import MultipleSelect from "@/components/ui/multiple-select";
import { ApiCollections } from "@/types/api-collection";
import debounce from "lodash/debounce";
import { Skeleton } from "@/components/ui/skeleton";

export function FloatingFilterButton({
  filteredSearch,
  blocks,
  setFilteredSearch,
}: {
  filteredSearch: FilterState;
  blocks: ApiCollections["festival_block"][number][] &
    ApiCollections["festival_block_translations"][number][];
  setFilteredSearch: Dispatch<SetStateAction<FilterState>>;
}) {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [localFilter, setLocalFilter] = useState<FilterState>(filteredSearch);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<
    Record<string, HTMLDivElement | HTMLInputElement | HTMLButtonElement | null>
  >({});

  // Debounced propagation to parent
  const debouncedSetFilteredSearch = useRef(
    debounce((nextState: FilterState) => {
      setFilteredSearch(nextState);
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSetFilteredSearch(localFilter);
  }, [localFilter]);

  useEffect(() => {
    setLocalFilter(filteredSearch);
  }, [filteredSearch]);

  const toggleFilter = () => {
    if (isFilterExpanded) onClose();
    else onOpen();
  };

  const toggleSearch = (type: SearchOption) => {
    setLocalFilter((prev) => {
      const updated = { ...prev };
      let clearedInput = false;

      (Object.keys(updated) as SearchOption[]).forEach((key) => {
        const filter = updated[key];
        let newValue = filter.value;
        if (key === type && filter.value.length > 0) {
          newValue = [];
          clearedInput = true;
        }

        const newSelected =
          (filter.selected && filter.value.length > 0) ||
          (key === type ? !filter.selected : filter.value.length > 0);

        updated[key] = { selected: newSelected, value: newValue };
      });

      if (clearedInput || checkClosed(updated[type])) {
        setTimeout(() => {
          inputRefs.current[type]?.focus?.();
        }, 100);
      }

      return updated;
    });
  };

  const onClean = () => {
    setLocalFilter((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as SearchOption[]).forEach((key) => {
        updated[key].selected = false;
      });
      return updated;
    });
  };

  const onCleanForce = () => {
    setLocalFilter((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as SearchOption[]).forEach((key) => {
        updated[key] = { value: [], selected: false };
      });
      return updated;
    });
  };

  const onClose = useCallback(() => {
    setIsFilterExpanded(false);
    onClean();
  }, []);

  const onOpen = () => {
    setIsFilterExpanded(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target =
        "touches" in e ? (e.touches[0].target as Node) : (e.target as Node);
      const clickedInsideFilter = containerRef.current?.contains(target);
      if (!clickedInsideFilter) {
        onClose();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  const checkClosed = (data: FilterOption) => data.selected || checkValue(data);
  const checkValue = (data: FilterOption) => data.value.length > 0;

  const hasAnyFilter = Object.values(localFilter).some(checkValue);
  const hasAnyFilterOpened = Object.values(localFilter).some(checkClosed);

  const blockData = blocks.map(
    (x: ApiCollections["festival_block"][number]) => ({
      label: x.name ?? "",
      value: x.id?.toString() ?? "",
    })
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute transition-all duration-100 ease-in-out flex flex-col right-4 top-3 sm:right-8 sm:top-8 items-end z-20 ",
        hasAnyFilterOpened ? "w-screen md:w-[400px]" : "w-auto"
      )}
    >
      <Button
        size="icon"
        variant={isFilterExpanded ? "secondary" : "default"}
        className="h-14 w-14 rounded-full shadow-lg cursor-pointer"
        onClick={toggleFilter}
      >
        <div className="w-full h-full relative flex justify-center items-center transition-all duration-100 ease-in-out">
          {localFilter.name.value.length > 0 && (
            <div className="absolute -left-1 -top-1 bg-destructive text-white rounded-2xl font-bold p-1">
              <MdSearch className="!h-4 !w-4" />
            </div>
          )}
          {localFilter.block.value.length > 0 && (
            <div className="absolute -right-1 -top-1 bg-destructive text-white rounded-2xl font-bold p-1">
              <MdCategory className="!h-4 !w-4" />
            </div>
          )}
          <LuFilter className="!h-5 !w-5" />
        </div>
      </Button>

      {/* Dropdown */}
      <div
        className={cn(
          "flex flex-col transition-all duration-200 ease-in-out w-full max-w-[400px]",
          isFilterExpanded
            ? "h-fit py-1 pl-1 opacity-100 mt-3 gap-3"
            : "max-h-[0] pointer-events-none opacity-0"
        )}
      >
        {/* Name */}
        <div className="flex items-center gap-3 justify-end">
          <div
            className={cn("transition-all duration-200 ease-in-out", {
              "w-[0] opacity-0 pointer-events-none": !checkClosed(
                localFilter.name
              ),
              "w-full opacity-100": checkClosed(localFilter.name),
            })}
          >
            <Input
              ref={(el) => {
                inputRefs.current["name"] = el;
              }}
              onChange={(val) => {
                const value = val.target.value;
                setLocalFilter((prev) => ({
                  ...prev,
                  name: {
                    ...prev.name,
                    value: value ? [value] : [],
                  },
                }));
              }}
              value={localFilter.name.value[0] || ""}
              placeholder="Search by name..."
              className="h-14 rounded-full shadow-lg border-0 pr-14 text-sm"
            />
          </div>
          <Button
            size="icon"
            variant={
              localFilter.name.value.length === 0 ? "secondary" : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              localFilter.name.value.length === 0
                ? checkClosed(localFilter.name)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => toggleSearch("name")}
          >
            <MdSearch className="!h-5 !w-5" />
          </Button>
        </div>

        {/* Block */}
        <div
          className="flex items-center gap-3 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cn("transition-all duration-200 ease-in-out", {
              "w-[0] opacity-0 pointer-events-none": !checkClosed(
                localFilter.block
              ),
              "w-full opacity-100": checkClosed(localFilter.block),
            })}
            ref={(el) => {
              inputRefs.current["genre"] = el;
            }}
          >
            <MultipleSelect
              isOpen={checkClosed(localFilter.block)}
              options={blockData}
              placeholder="Search by blocks..."
              selectedOptions={localFilter.block.value}
              setSelectedOptions={(value) => {
                setLocalFilter((prev) => ({
                  ...prev,
                  block: {
                    ...prev.block,
                    value:
                      typeof value === "function"
                        ? value(prev.block.value)
                        : value,
                  },
                }));
              }}
            />
          </div>
          <Button
            size="icon"
            variant={
              localFilter.block.value.length === 0 ? "secondary" : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              localFilter.block.value.length === 0
                ? checkClosed(localFilter.block)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => toggleSearch("block")}
          >
            <MdCategory className="!h-5 !w-5" />
          </Button>
        </div>

        {/* Clear All */}
        <div
          className={cn(
            "flex items-center justify-end",
            hasAnyFilter
              ? "h-auto opacity-100"
              : "h-[0] overflow-hidden opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="destructive"
            className="h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer"
            onClick={onCleanForce}
          >
            <MdDelete className="!h-5 !w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const FloatingFilterButtonSkeleton = () => {
  return (
    <Skeleton className="h-14 w-14 rounded-full absolute right-4 top-3 sm:right-8 sm:top-8 z-20" />
  );
};
