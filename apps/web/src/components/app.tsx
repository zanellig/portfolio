"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWindowManager } from "./window-manager";
import Window from "./window";

interface AppProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  windowTitle?: string;
  windowContent: React.ReactNode;
  windowWidth?: number;
  windowHeight?: number;
  x?: number;
  y?: number;
}

export function App({
  id,
  icon,
  label,
  windowTitle,
  windowContent,
  windowWidth = 600,
  windowHeight = 500,
  x,
  y,
}: AppProps) {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const windowManager = useWindowManager();

  const handleClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleDoubleClick();
    } else {
      const timeout = setTimeout(() => {
        setClickTimeout(null);
      }, 300);
      setClickTimeout(timeout);
    }
  };

  const handleDoubleClick = () => {
    if (!isWindowOpen) {
      setIsWindowOpen(true);
    } else {
      windowManager.focusWindow(id);
    }
  };

  const handleWindowClose = useCallback(() => {
    setIsWindowOpen(false);
  }, []);

  return (
    <>
      <div
        className={cn(
          "flex flex-col items-center justify-center w-20 h-20 p-2 rounded-lg cursor-pointer",
          "hover:bg-accent/50 transition-colors duration-200",
          "select-none"
        )}
        onClick={handleClick}
      >
        <div className="mb-1 text-2xl">{icon}</div>
        <div className="text-xs text-center text-muted-foreground leading-tight">
          {label}
        </div>
      </div>

      {isWindowOpen && (
        <Window
          id={id}
          title={windowTitle || label}
          width={windowWidth}
          height={windowHeight}
          x={x}
          y={y}
          onClose={handleWindowClose}
        >
          <div className="p-4">{windowContent}</div>
        </Window>
      )}
    </>
  );
}
