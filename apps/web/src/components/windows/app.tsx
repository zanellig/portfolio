"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useWindowManager } from "./window-manager";
import Window from "./window";
import type { Coordinates } from "./types";

interface AppProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  windowTitle?: string;
  windowContent: React.ReactNode;
  windowWidth?: number;
  windowHeight?: number;
  windowTargetCoordinates?: Coordinates;
}

export function App({
  id,
  icon,
  label,
  windowTitle,
  windowContent,
  windowWidth = 600,
  windowHeight = 500,
  windowTargetCoordinates,
}: AppProps) {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [spawnCoordinates, setSpawnCoordinates] = useState<
    Coordinates | undefined
  >(undefined);
  const appIconRef = useRef<HTMLDivElement>(null);
  const windowManager = useWindowManager();

  const calculateIconCenterCoordinates = useCallback(() => {
    if (!appIconRef.current) return undefined;

    const rect = appIconRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    } as Coordinates;
  }, []);

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
      const coordinates = calculateIconCenterCoordinates();
      if (coordinates) {
        setSpawnCoordinates(coordinates);
        setIsWindowOpen(true);
      }
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
        ref={appIconRef}
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

      {isWindowOpen && spawnCoordinates && (
        <Window
          id={id}
          title={windowTitle || label}
          width={windowWidth}
          height={windowHeight}
          spawnCoordinates={spawnCoordinates}
          x={windowTargetCoordinates?.x}
          y={windowTargetCoordinates?.y}
          onClose={handleWindowClose}
        >
          {windowContent}
        </Window>
      )}
    </>
  );
}
