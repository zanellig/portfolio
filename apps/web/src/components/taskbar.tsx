"use client";

import { AppWindowMac } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWindowManager } from "./window-manager";

export function Taskbar() {
  const windowManager = useWindowManager();
  const minimizedWindows = Array.from(windowManager.windows.values()).filter(
    (window) => window.minimized
  );

  if (minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-black/20 border border-white/20 rounded-full">
        {minimizedWindows.map((window) => (
          <div
            key={window.id}
            className={cn(
              "relative p-2 rounded-full cursor-pointer transition-all duration-200",
              "hover:bg-white/20 hover:scale-110",
              "group"
            )}
            onClick={() => windowManager.restoreWindow(window.id)}
            aria-label={window.title || "Window"}
          >
            <AppWindowMac className="w-5 h-5 dark:text-white text-neutral-500" />

            {/* Tooltip */}
            {window.title && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {window.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
