"use client";

import { useState, useRef, useEffect } from "react";
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

type FilterOptionMap = Map<SearchOption, FilterOption>;

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
  const [filteredSearch, setFilteredSearch] = useState<FilterOptionMap>(
    new Map<SearchOption, FilterOption>([
      [
        "author",
        {
          selected: false,
          value: [],
        },
      ],
      [
        "genre",
        {
          selected: false,
          value: [],
        },
      ],
      [
        "name",
        {
          selected: false,
          value: [],
        },
      ],
    ])
  );
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
      let clearedInput = false;
      const updatedMap = new Map(prev);
      updatedMap.forEach((value, key) => {
        let newValue: string[];
        if (key == type && value.selected && value.value.length > 0) {
          newValue = [];
          clearedInput = true;
        } else newValue = value.value;
        let newSelected;
        if (value.selected && value.value.length > 0) newSelected = true;
        else if (key == type) newSelected = !value.selected;
        else newSelected = value.value.length > 0;
        updatedMap.set(key, {
          selected: newSelected,
          value: newValue,
        });
      });
      if (clearedInput || checkClosed(updatedMap.get(type)!)) {
        setTimeout(() => {
          if (inputRefs.current[type]) {
            inputRefs.current[type]?.focus();
          }
        }, 100);
      }
      return updatedMap;
    });
  };

  const onClean = () => {
    setFilteredSearch((prev) => {
      const updatedMap = new Map(prev);
      updatedMap.forEach((value, key) => {
        updatedMap.set(key, { value: [], selected: false });
      });
      return updatedMap;
    });
  };

  const onClose = () => {
    setIsFilterExpanded(false);
    onClean();
  };

  const onOpen = () => {
    setIsFilterExpanded(true);
  };

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target =
        "touches" in e ? (e.touches[0].target as Node) : (e.target as Node);
      const clickedInsideFilter = containerRef.current?.contains(target);

      console.log("Clicked target", target);
      console.log("Inside filter:", clickedInsideFilter);

      if (!clickedInsideFilter) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const checkClosed = (data: FilterOption) => {
    return data.selected || checkValue(data);
  };

  const checkValue = (data: FilterOption) => {
    return data.value.length > 0;
  };

  return (
    <div
      ref={containerRef}
      className="absolute w-screen transition-all duration-100 ease-in-out flex flex-col right-0 top-0 items-end z-20 p-3 sm:p-8"
    >
      {/* Main filter button */}
      <Button
        size="icon"
        variant={isFilterExpanded ? "secondary" : "default"}
        className="h-14 w-14 rounded-full shadow-lg cursor-pointer"
        onClick={toggleFilter}
      >
        <div className="w-full h-full relative flex justify-center items-center transition-all duration-100 ease-in-out">
          {(filteredSearch.get("name")?.value?.length ?? 0) > 0 && (
            <div className="absolute -left-1 -top-1 bg-red-400 text-white rounded-2xl font-bold p-1">
              <MdSearch className="!h-4 !w-4" />
            </div>
          )}
          {(filteredSearch.get("author")?.value?.length ?? 0) > 0 && (
            <div className="absolute -right-1 -top-1 bg-red-400 text-white rounded-2xl font-bold p-1">
              <MdPerson className="!h-4 !w-4" />
            </div>
          )}
          {(filteredSearch.get("genre")?.value?.length ?? 0) > 0 && (
            <div className="absolute -right-1 -bottom-1 bg-red-400 text-white rounded-2xl font-bold p-1">
              <MdCategory className="!h-4 !w-4" />
            </div>
          )}
          <LuFilter className="!h-5 !w-5" />
        </div>
      </Button>

      {/* Filter options (vertical dropdown) */}
      <div
        className={cn(
          "flex flex-col gap-3 mt-3 transition-all duration-200 ease-in-out  w-full max-w-[400px]",
          isFilterExpanded
            ? "h-fit py-1 pl-1 opacity-100"
            : "max-h-0 pointer-events-none opacity-0"
        )}
      >
        {/* Search by name option */}
        <div className="flex items-center gap-3 justify-end">
          <div
            className={cn("transition-all duration-200 ease-in-out", {
              "w-[0] opacity-0 pointer-events-none": !checkClosed(
                filteredSearch.get("name")!
              ),
              "w-full opacity-100": checkClosed(filteredSearch.get("name")!),
            })}
          >
            <Input
              ref={(el) => {
                inputRefs.current["name"] = el;
              }}
              onChange={(val) => {
                setFilteredSearch((prev) => {
                  const updatedMap = new Map(prev);
                  const authorFilter = updatedMap.get("name");
                  if (authorFilter) {
                    authorFilter.value = val.target.value
                      ? [val.target.value]
                      : [];
                    updatedMap.set("name", authorFilter);
                  }
                  return updatedMap;
                });
              }}
              value={
                (filteredSearch.get("name")?.value?.length ?? 0) > 0
                  ? filteredSearch.get("name")?.value[0]
                  : ""
              }
              placeholder="Search by name..."
              className="h-14 rounded-full shadow-lg border-0 pr-14 text-sm"
            />
          </div>
          <Button
            size="icon"
            variant={
              filteredSearch.get("name")?.value.length == 0
                ? "secondary"
                : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              filteredSearch.get("name")?.value.length == 0
                ? checkClosed(filteredSearch.get("name")!)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => toggleSearch("name")}
          >
            <MdSearch className="!h-5 !w-5" />
          </Button>
        </div>

        {/* Search by author option */}
        <div className="flex items-center gap-3 justify-end">
          <div
            className={cn("transition-all duration-200 ease-in-out", {
              "w-[0] opacity-0 pointer-events-none": !checkClosed(
                filteredSearch.get("author")!
              ),
              "w-full opacity-100": checkClosed(filteredSearch.get("author")!),
            })}
          >
            <Input
              ref={(el) => {
                inputRefs.current["author"] = el;
              }}
              onChange={(val) => {
                setFilteredSearch((prev) => {
                  const updatedMap = new Map(prev);
                  const authorFilter = updatedMap.get("author");
                  if (authorFilter) {
                    authorFilter.value = val.target.value
                      ? [val.target.value]
                      : [];
                    updatedMap.set("author", authorFilter);
                  }
                  return updatedMap;
                });
              }}
              value={
                (filteredSearch.get("author")?.value?.length ?? 0) > 0
                  ? filteredSearch.get("author")?.value[0]
                  : ""
              }
              placeholder="Search by author..."
              className="h-14 rounded-full shadow-lg border-0 pr-14 text-sm"
            />
          </div>
          <Button
            size="icon"
            variant={
              filteredSearch.get("author")?.value.length == 0
                ? "secondary"
                : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              filteredSearch.get("author")?.value.length == 0
                ? checkClosed(filteredSearch.get("author")!)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => toggleSearch("author")}
          >
            <MdPerson className="!h-5 !w-5" />
          </Button>
        </div>

        {/* Genre selector option */}
        <div
          className="flex items-center gap-3 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cn("transition-all duration-200 ease-in-out", {
              "w-[0] opacity-0 pointer-events-none": !checkClosed(
                filteredSearch.get("genre")!
              ),
              "w-full opacity-100": checkClosed(filteredSearch.get("genre")!),
            })}
            ref={(el) => {
              inputRefs.current["genre"] = el;
            }}
          >
            <MultipleSelect
              isOpen={checkClosed(filteredSearch.get("genre")!)}
              options={genres}
              placeholder="Search by genres..."
              selectedOptions={
                (filteredSearch.get("genre")?.value as string[]) || []
              }
              setSelectedOptions={(
                value: string[] | ((prevState: string[]) => string[])
              ) => {
                setFilteredSearch((prev) => {
                  const genreFilter = prev.get("genre");
                  if (genreFilter) {
                    const newValue =
                      typeof value === "function"
                        ? value(genreFilter.value as string[])
                        : value;
                    return new Map(prev).set("genre", {
                      ...genreFilter,
                      value: newValue,
                    });
                  }
                  return prev;
                });
              }}
            />
          </div>
          <Button
            size="icon"
            variant={
              filteredSearch.get("genre")?.value.length == 0
                ? "secondary"
                : "destructive"
            }
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              filteredSearch.get("genre")?.value.length == 0
                ? checkClosed(filteredSearch.get("genre")!)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => {
              toggleSearch("genre");
            }}
          >
            <MdCategory className="!h-5 !w-5" />
          </Button>
        </div>
        {/* Clean selector option */}
        <div
          className={cn(
            "flex items-center justify-end",
            filteredSearch
              .values()
              .map(checkValue)
              .reduce((prev: boolean, curr: boolean) => prev || curr)
              ? "h-auto opacity-100"
              : "h-[0] overflow-hidden opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant={"destructive"}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex-shrink-0 cursor-pointer",
              filteredSearch.get("genre")?.value.length == 0
                ? checkClosed(filteredSearch.get("genre")!)
                  ? "bg-primary text-primary-foreground"
                  : ""
                : "text-shadow-white"
            )}
            onClick={() => {
              onClean();
            }}
          >
            <MdDelete className="!h-5 !w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
