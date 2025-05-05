"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LuFilter } from "react-icons/lu";
import { MdSearch, MdCategory, MdPerson, MdDelete } from "react-icons/md";
import MultipleSelect from "@/components/ui/multiple-select";

type SearchOption = "name" | "author" | "genre";

type FilterOption = {
  selected: boolean;
  value: string[];
};

type FilterState = Record<SearchOption, FilterOption>;

const genres = [
  { label: "Fiction", value: "fiction" },
  { label: "Non Fiction", value: "non-fiction" },
  { label: "Science Fiction", value: "science-fiction" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Mystery", value: "mystery" },
  { label: "Romance", value: "romance" },
  { label: "Thriller", value: "thriller" },
  { label: "Biography", value: "biography" },
];

export function FloatingFilterButton() {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filteredSearch, setFilteredSearch] = useState<FilterState>({
    author: { selected: false, value: [] },
    genre: { selected: false, value: [] },
    name: { selected: false, value: [] },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<
    Record<string, HTMLDivElement | HTMLInputElement | HTMLButtonElement | null>
  >({});

  const toggleFilter = () => {
    if (isFilterExpanded) onClose();
    else onOpen();
  };

  const toggleSearch = (type: SearchOption) => {
    setFilteredSearch((prev) => {
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
    setFilteredSearch((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as SearchOption[]).forEach((key) => {
        updated[key].selected = false;
      });
      return updated;
    });
  };

  const onCleanForce = () => {
    setFilteredSearch((prev) => {
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

  const hasAnyFilter = Object.values(filteredSearch).some(checkValue);
  const hasAnyFilterOpened = Object.values(filteredSearch).some(checkClosed);
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
          {filteredSearch.name.value.length > 0 && (
            <div className="absolute -left-1 -top-1 bg-destructive text-white rounded-2xl font-bold p-1">
              <MdSearch className="!h-4 !w-4" />
            </div>
          )}
          {filteredSearch.author.value.length > 0 && (
            <div className="absolute -right-1 -top-1 bg-destructive text-white rounded-2xl font-bold p-1">
              <MdPerson className="!h-4 !w-4" />
            </div>
          )}
          {filteredSearch.genre.value.length > 0 && (
            <div className="absolute -right-1 -bottom-1 bg-destructive text-white rounded-2xl font-bold p-1">
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
                filteredSearch.name
              ),
              "w-full opacity-100": checkClosed(filteredSearch.name),
            })}
          >
            <Input
              ref={(el) => {
                inputRefs.current["name"] = el;
              }}
              onChange={(val) => {
                const value = val.target.value;
                setFilteredSearch((prev) => ({
                  ...prev,
                  name: {
                    ...prev.name,
                    value: value ? [value] : [],
                  },
                }));
              }}
              value={filteredSearch.name.value[0] || ""}
              placeholder="Search by name..."
              className="h-14 rounded-full shadow-lg border-0 pr-14 text-sm"
            />
          </div>
          <Button
            size="icon"
            variant={
              filteredSearch.name.value.length === 0
                ? "secondary"
                : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              filteredSearch.name.value.length === 0
                ? checkClosed(filteredSearch.name)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => toggleSearch("name")}
          >
            <MdSearch className="!h-5 !w-5" />
          </Button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 justify-end">
          <div
            className={cn("transition-all duration-200 ease-in-out", {
              "w-[0] opacity-0 pointer-events-none": !checkClosed(
                filteredSearch.author
              ),
              "w-full opacity-100": checkClosed(filteredSearch.author),
            })}
          >
            <Input
              ref={(el) => {
                inputRefs.current["author"] = el;
              }}
              onChange={(val) => {
                const value = val.target.value;
                setFilteredSearch((prev) => ({
                  ...prev,
                  author: {
                    ...prev.author,
                    value: value ? [value] : [],
                  },
                }));
              }}
              value={filteredSearch.author.value[0] || ""}
              placeholder="Search by author..."
              className="h-14 rounded-full shadow-lg border-0 pr-14 text-sm"
            />
          </div>
          <Button
            size="icon"
            variant={
              filteredSearch.author.value.length === 0
                ? "secondary"
                : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              filteredSearch.author.value.length === 0
                ? checkClosed(filteredSearch.author)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => toggleSearch("author")}
          >
            <MdPerson className="!h-5 !w-5" />
          </Button>
        </div>

        {/* Genre */}
        <div
          className="flex items-center gap-3 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cn("transition-all duration-200 ease-in-out", {
              "w-[0] opacity-0 pointer-events-none": !checkClosed(
                filteredSearch.genre
              ),
              "w-full opacity-100": checkClosed(filteredSearch.genre),
            })}
            ref={(el) => {
              inputRefs.current["genre"] = el;
            }}
          >
            <MultipleSelect
              isOpen={checkClosed(filteredSearch.genre)}
              options={genres}
              placeholder="Search by genres..."
              selectedOptions={filteredSearch.genre.value}
              setSelectedOptions={(value) => {
                setFilteredSearch((prev) => ({
                  ...prev,
                  genre: {
                    ...prev.genre,
                    value:
                      typeof value === "function"
                        ? value(prev.genre.value)
                        : value,
                  },
                }));
              }}
            />
          </div>
          <Button
            size="icon"
            variant={
              filteredSearch.genre.value.length === 0
                ? "secondary"
                : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              filteredSearch.genre.value.length === 0
                ? checkClosed(filteredSearch.genre)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => toggleSearch("genre")}
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
