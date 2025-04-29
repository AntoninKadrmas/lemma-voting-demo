"use client";
import type React from "react";
import { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
interface CarouselProps {
  items: ReactNode[];
  state: boolean;
  onSelected: (state: boolean) => void;
}

export default function DragCarousel({
  items,
  state,
  onSelected,
}: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardWidth = 350;
  const threshold = cardWidth / 4;
  const limitToTapX = 50;
  const limitToTapY = 10;

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setCurrentY(clientY);
  };

  // Handle dragging
  const handleDrag = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    if (clientX > currentX && activeIndex == 0) {
      setCurrentY(startY + limitToTapY + 1);
      return;
    }
    setCurrentY(clientY);
    setCurrentX(clientX);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;
    const dragDistanceX = startX - currentX;
    const dragDistanceY = startY - currentY;
    if (dragDistanceX > threshold && activeIndex < items.length - 1) {
      // Dragged left (next card)
      setActiveIndex(activeIndex + 1);
    } else if (dragDistanceX < -threshold && activeIndex > 0) {
      // Dragged right (previous card)
      setActiveIndex(activeIndex - 1);
    } else if (
      Math.abs(dragDistanceX) < limitToTapX &&
      Math.abs(dragDistanceY) < limitToTapY
    )
      onSelected(!state);

    setIsDragging(false);
    setCurrentX(0);
    setStartX(0);
    setCurrentY(0);
    setStartY(0);
  };

  // Calculate drag percentage for animation
  const getDragPercentage = () => {
    if (!isDragging) return 0;
    const dragDistance = startX - currentX;
    return Math.min(Math.max(dragDistance / cardWidth, -1), 1);
  };

  const dragPercentage = getDragPercentage();

  return (
    <div
      className={cn(
        "group relative mx-auto h-[270px] w-[300px] max-w-lg overflow-hidden",
        "transition-all duration-100 ease-in-out",
        state
          ? "saturate-[1.5]"
          : "saturate-[0.2] border-3  border-gray-200 dark:border-gray-800 shadow-[0_0_10px_4px_rgba(0,0,0,0.8)] shadow-gray-200 dark:shadow-gray-800",
        state &&
          "border-3 border-green-300 shadow-[0_0_10px_4px_rgba(0,0,0,0.8)] shadow-green-300 dark:shadow-white dark:border-white",
        // "[&_.narrow-horizontal-line]:w-1/3 [&_.vertical-line]:h-1/2 [&_.wide-horizontal-line]:w-2/3",
        isDragging ? "cursor-grabbing" : "cursor-pointer",
        "select-none"
      )}
      ref={containerRef}
    >
      <div
        className="relative h-full w-full"
        onTouchStart={handleDragStart}
        // onMouseDown={handleDragStart}
        onTouchEnd={handleDragEnd}
        // onMouseUp={handleDragEnd}
        onTouchMove={(e) => handleDrag(e as unknown as TouchEvent)}
        // onMouseMove={(e) => handleDrag(e as unknown as MouseEvent)}
        onMouseLeave={handleDragEnd}
        onPointerDown={handleDragStart}
        onPointerMove={(e) => handleDrag(e as unknown as PointerEvent)}
        onPointerUp={handleDragEnd}
        // onPointerLeave={handleDragEnd}
      >
        {items.map((item, index) => {
          // Calculate the base position based on index relative to active index
          const position = index - activeIndex;

          // Adjust position if dragging
          let adjustedPosition = position;
          if (isDragging) {
            adjustedPosition = position - dragPercentage;
          }

          // Calculate z-index (higher for cards that should be on top)
          const zIndex = index; //items.length - Math.abs(adjustedPosition)

          // Calculate opacity (fade out cards that are further away)
          const opacity = 1;

          // Calculate scale (smaller for cards that are further away)
          const scale = 1; //Math.max(0.8, 1 - Math.abs(adjustedPosition) * 0.1)

          // Calculate x position
          const x = Math.max(adjustedPosition * (cardWidth * 0.9), 0);

          return (
            <Card
              key={`${index}`}
              className={cn(
                "absolute left-1/2 top-1/2 h-[270px] w-[300px] rounded-none border-none p-0",
                isDragging
                  ? "transition-none"
                  : "transition-all duration-100 ease-out"
              )}
              style={{
                transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <CardContent className="flex h-full items-center justify-between p-0 text-2xl font-bold dark:text-white">
                <>
                  {index != 0 && (
                    <div
                      className="absolute left-0 flex h-full cursor-grab items-center justify-center pr-2 group-hover:opacity-100 sm:opacity-0"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent)",
                      }}
                      onClick={() => {
                        setActiveIndex(index - 1);
                        onSelected(!state);
                      }}
                    >
                      <LuChevronLeft className="h-8 w-8 text-white" />
                    </div>
                  )}
                  {item}
                  {index != items.length - 1 && (
                    <div
                      className="absolute right-0 flex h-full cursor-grab items-center justify-center pl-2 group-hover:opacity-100 sm:opacity-0"
                      style={{
                        background:
                          "linear-gradient(to left, rgba(0, 0, 0, 0.6), transparent)",
                      }}
                      onClick={() => {
                        setActiveIndex(index + 1);
                        onSelected(!state);
                      }}
                    >
                      <LuChevronRight className="h-8 w-8 text-white" />
                    </div>
                  )}
                </>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-[0.5rem] right-2 z-30 flex transform space-x-1">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === activeIndex
                ? "w-4 bg-gray-800 dark:bg-white"
                : "bg-gray-400 white:bg-gray-400"
            )}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
