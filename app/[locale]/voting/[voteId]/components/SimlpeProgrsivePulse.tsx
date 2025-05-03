"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SimpleProgressivePulseProps {
  children: React.ReactNode;
  className?: string;
  progressionDuration?: number;
  pulseSpeed?: number;
}

export function SimpleProgressivePulse({
  children,
  className,
  progressionDuration = 10, // Duration in seconds for yellow to red progression
  pulseSpeed = 1, // Base pulse speed (will get faster)
}: SimpleProgressivePulseProps) {
  // Track the current progress (0 to 100)
  const [progress, setProgress] = useState(0);

  // Update progress over time
  useEffect(() => {
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
      const newProgress = Math.min(
        100,
        (elapsedTime / progressionDuration) * 100
      );
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [progressionDuration]);

  // Calculate current color based on progress
  // Yellow (255, 255, 0) to Red (255, 0, 0)
  const greenValue = Math.round(255 * (1 - progress / 100));
  const currentColor = `rgb(255, ${greenValue}, 0)`;

  // Calculate current pulse speed based on progress
  // Gets faster as progress increases
  const currentPulseSpeed = pulseSpeed * (1 - progress / 200); // Reduces by up to 50%

  return (
    <div className="space-y-2">
      {/* The pulsing element */}
      <div
        className={cn(
          "transition-colors rounded-md relative overflow-hidden",
          className
        )}
        style={
          {
            "--pulse-color": currentColor,
            "--pulse-speed": `${currentPulseSpeed}s`,
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 animate-pulse-bg"></div>
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

      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500">
        <div>Progress: {Math.round(progress)}%</div>
        <div>Color: {currentColor}</div>
        <div>Pulse Speed: {currentPulseSpeed.toFixed(2)}s</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <h1 className="text-2xl font-bold mb-8">Progressive Pulse Animation</h1>

      <div className="text-center mb-6">
        <p className="text-gray-600">
          Watch as the pulsing color shifts from yellow to red and gets faster
          over time
        </p>
      </div>

      {/* Default example - 10 second progression */}
      <SimpleProgressivePulse className="p-4 w-80">
        <div className="text-center p-4">
          <h3 className="font-medium">Default Progression (10s)</h3>
          <p>Yellow → Orange → Red</p>
        </div>
      </SimpleProgressivePulse>

      {/* Slower example - 20 second progression */}
      <SimpleProgressivePulse progressionDuration={20} className="p-4 w-80">
        <div className="text-center p-4">
          <h3 className="font-medium">Slow Progression (20s)</h3>
          <p>Yellow → Orange → Red (Slower)</p>
        </div>
      </SimpleProgressivePulse>
    </div>
  );
}
