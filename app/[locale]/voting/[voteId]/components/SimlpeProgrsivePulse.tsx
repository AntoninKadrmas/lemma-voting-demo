"use client";

import type React from "react";
import { useState, useEffect } from "react";
import moment from "moment";
import { cn } from "@/lib/utils";

interface SimpleProgressivePulseProps {
  children: React.ReactNode;
  className?: string;
  progressionDuration?: number;
  pulseSpeed?: number;
  endDate?: string; // New prop
}

export function SimpleProgressivePulse({
  children,
  className,
  pulseSpeed = 2,
  progressionDuration = 60 * 5,
  endDate,
}: SimpleProgressivePulseProps) {
  const [progress, setProgress] = useState(0);
  const [shouldStart, setShouldStart] = useState(false);

  // Check if we should start the animation
  useEffect(() => {
    if (!endDate) {
      setShouldStart(true);
      return;
    }
    setTimeout(() => {
      setShouldStart(true);
    }, moment(endDate).diff(moment().add(progressionDuration, "seconds")));
  }, [endDate, progressionDuration]);

  // Start the progression animation
  useEffect(() => {
    if (!shouldStart) return;

    const startTime = moment(endDate).subtract(progressionDuration, "seconds");

    let timeoutId: NodeJS.Timeout;

    const updateProgress = () => {
      const elapsedTime = moment().diff(startTime, "seconds");
      const newProgress = Math.min(
        100,
        (elapsedTime / progressionDuration) * 100
      );
      setProgress(newProgress);

      if (newProgress < 100) {
        timeoutId = setTimeout(updateProgress, pulseSpeed * 1000);
      }
    };

    updateProgress(); // Initial call

    return () => clearTimeout(timeoutId);
  }, [shouldStart, progressionDuration, pulseSpeed, endDate]);

  const greenValue = Math.round(255 * (1 - progress / 100));
  const currentColor = `rgb(255, ${greenValue}, 0)`;
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "transition-colors rounded-md relative overflow-hidden",
          className
        )}
        style={
          {
            "--pulse-color": currentColor,
            "--pulse-speed": `${pulseSpeed}s`,
          } as React.CSSProperties
        }
      >
        {shouldStart && (
          <div className="absolute inset-0 animate-pulse-bg"></div>
        )}
        <div className="relative z-10">{children}</div>

        <style jsx global>{`
          @keyframes pulse-bg {
            0% {
              background-color: white;
              opacity: 0;
            }
            50% {
              background-color: var(--pulse-color);
              opacity: 1;
            }
            100% {
              background-color: white;
              opacity: 0;
            }
          }

          .animate-pulse-bg {
            animation: pulse-bg var(--pulse-speed) infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
