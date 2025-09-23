"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useId, useRef } from "react";
import { useWindowManager } from "./window-manager";
import { ScrollArea } from "@/components/ui/scroll-area";

type ResizeDir =
  | "none"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface Dimensions {
  width: number;
  height: number;
}

interface Coordinates {
  x: number;
  y: number;
}

interface ThreeDimensionalCoordinates extends Coordinates {
  z: number;
}

interface WindowProps
  extends Partial<Dimensions & ThreeDimensionalCoordinates> {
  children?: React.ReactNode;
  title?: string;
  id?: string;
  onClose?: () => void;
}

const MINIMUM_DIMENSIONS = {
  width: 300,
  height: 200,
} as Dimensions;

const INITIAL_DIMENSIONS = {
  width: 600,
  height: 500,
} as Dimensions;

/**
 * used to calculate the width or height if only one is provided
 */
const DEFAULT_ASPECT_RATIO =
  INITIAL_DIMENSIONS.width / INITIAL_DIMENSIONS.height;

function calculateDimensionsFromAR({ width, height }: WindowProps): Dimensions {
  if (width) {
    if (width < MINIMUM_DIMENSIONS.width)
      throw new Error(`Width must be greater than ${MINIMUM_DIMENSIONS.width}`);
    return { height: width * DEFAULT_ASPECT_RATIO, width };
  }
  if (height) {
    if (height < MINIMUM_DIMENSIONS.height)
      throw new Error(
        `Height must be greater than ${MINIMUM_DIMENSIONS.height}`
      );
    return { width: height * DEFAULT_ASPECT_RATIO, height };
  }
  return INITIAL_DIMENSIONS;
}

export default function Window({
  width,
  height,
  x,
  y,
  z,
  children,
  title,
  id: providedId,
  onClose,
}: WindowProps) {
  const generatedId = useId();
  const windowId = providedId || generatedId;
  const windowManager = useWindowManager();
  const [position, setPosition] = useState<Coordinates>({
    x: x ?? 100,
    y: y ?? 100,
  });
  const [dimensions, setDimensions] = useState(
    calculateDimensionsFromAR({ width, height })
  );
  const [offset, setOffset] = useState<Coordinates>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<boolean>(false);
  const [resizing, setResizing] = useState<ResizeDir>("none");

  const positionRef = useRef(position);
  const dimensionsRef = useRef(dimensions);


  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  const managedZIndex = windowManager.getWindowZIndex(windowId);
  const isFocused = windowManager.isWindowFocused(windowId);
  const isMinimized = windowManager.isWindowMinimized(windowId);
  const isMaximized = windowManager.isWindowMaximized(windowId);
  const windowExists = windowManager.windows.has(windowId);

  useEffect(() => {
    windowManager.registerWindow(windowId, title, onClose);
    return () => {
      windowManager.unregisterWindow(windowId);
    };
  }, [windowId, title, onClose]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const parent = document.documentElement;
      const parentW = parent.clientWidth;
      const parentH = parent.clientHeight;

      if (dragging) {
        const elemWidth = dimensionsRef.current.width;
        const elemHeight = dimensionsRef.current.height;

        let newX = e.clientX - offset.x;
        let newY = e.clientY - offset.y;

        // Clamp inside viewport
        newX = Math.max(0, Math.min(newX, parentW - elemWidth));
        newY = Math.max(0, Math.min(newY, parentH - elemHeight));

        setPosition({ x: newX, y: newY });
        return;
      }
      if (resizing !== "none") {
        const minW = MINIMUM_DIMENSIONS.width;
        const minH = MINIMUM_DIMENSIONS.height;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        setDimensions((prev) => {
          let { width, height } = prev;
          let { x, y } = positionRef.current;

          switch (resizing) {
            case "top": {
              const newY = Math.max(0, Math.min(mouseY, y + height - minH));
              height = Math.max(minH, height + (y - newY));
              y = newY;
              break;
            }
            case "right":
              width = Math.max(minW, Math.min(mouseX - x, parentW - x));
              break;
            case "bottom":
              height = Math.max(minH, Math.min(mouseY - y, parentH - y));
              break;
            case "left": {
              const newX = Math.max(0, Math.min(mouseX, x + width - minW));
              width = Math.max(minW, width + (x - newX));
              x = newX;
              break;
            }
            case "bottom-right":
              width = Math.max(minW, Math.min(mouseX - x, parentW - x));
              height = Math.max(minH, Math.min(mouseY - y, parentH - y));
              break;
            case "bottom-left": {
              const newX = Math.max(0, Math.min(mouseX, x + width - minW));
              width = Math.max(minW, width + (x - newX));
              x = newX;
              height = Math.max(minH, Math.min(mouseY - y, parentH - y));
              break;
            }
            case "top-right": {
              const newY = Math.max(0, Math.min(mouseY, y + height - minH));
              height = Math.max(minH, height + (y - newY));
              y = newY;
              width = Math.max(minW, Math.min(mouseX - x, parentW - x));
              break;
            }
            case "top-left": {
              const newX = Math.max(0, Math.min(mouseX, x + width - minW));
              const newY = Math.max(0, Math.min(mouseY, y + height - minH));
              width = Math.max(minW, width + (x - newX));
              height = Math.max(minH, height + (y - newY));
              x = newX;
              y = newY;
              break;
            }
          }

          setPosition({ x, y });
          return { width, height };
        });
      }
    }

    function handleMouseUp() {
      setDragging(false);
      setResizing("none");
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset, resizing]);

  if (!windowExists || isMinimized) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute shadow-2xl",
        isFocused ? "drop-shadow-2xl" : null,
        isMaximized ? "!top-0 !left-0 !w-full !h-full" : null
      )}
      style={
        isMaximized
          ? {
              zIndex: z ?? managedZIndex,
            }
          : {
              top: `${position.y}px`,
              left: `${position.x}px`,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              zIndex: z ?? managedZIndex,
            }
      }
    >
      {/* Inner window with overflow hidden for content */}
      <div
        className={cn(
          "relative w-full h-full border-2 bg-popover overflow-hidden flex flex-col",
          isFocused
            ? "border-neutral-300 dark:border-neutral-700"
            : "border-border",
          isMaximized ? "rounded-none" : "rounded-lg"
        )}
        onMouseDown={() => windowManager.focusWindow(windowId)}
      >
        {/* Header bar (dragging) */}
        <div
          className={cn(
            "flex relative items-center justify-start p-2 border-b bg-accent w-full h-10",
            !isMaximized ? (dragging ? "cursor-grabbing" : "cursor-grab") : null
          )}
          onMouseDown={(e) => {
            windowManager.focusWindow(windowId);
            if (!isMaximized) {
              setDragging(true);
              const rect = (
                e.currentTarget.parentElement?.parentElement as HTMLElement
              ).getBoundingClientRect();
              setOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
          }}
        >
          <div
            className="h-4 w-4 bg-transparent flex items-center justify-center cursor-pointer hover:bg-red-200 dark:hover:bg-red-900 rounded-full"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              windowManager.closeWindow(windowId);
            }}
          >
            <div className="rounded-full h-2 w-2 bg-red-500"></div>
          </div>
          <div
            className="h-4 w-4 bg-transparent flex items-center justify-center cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-900 rounded-full"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              if (isMinimized) {
                windowManager.restoreWindow(windowId);
              } else {
                windowManager.minimizeWindow(windowId);
              }
            }}
          >
            <div className="rounded-full h-2 w-2 bg-yellow-500"></div>
          </div>
          <div
            className="h-4 w-4 bg-transparent flex items-center justify-center cursor-pointer hover:bg-green-200 dark:hover:bg-green-900 rounded-full"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              windowManager.maximizeWindow(windowId);
            }}
          >
            <div className="rounded-full h-2 w-2 bg-green-500"></div>
          </div>
          <p className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
            {title}
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">{children}</ScrollArea>
        </div>
      </div>

      {/* Resize handles positioned relative to outer container */}
      {!isMaximized && (
        <>
          {/* Corner resize handles */}
          <div
            className="absolute w-4 h-4 bg-transparent cursor-nwse-resize z-10"
            style={{ top: -6, left: -6 }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("top-left");
            }}
          ></div>
          <div
            className="absolute w-4 h-4 bg-transparent cursor-nesw-resize z-10"
            style={{ top: -6, right: -6 }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("top-right");
            }}
          ></div>
          <div
            className="absolute w-4 h-4 bg-transparent cursor-nesw-resize z-10"
            style={{ bottom: -6, left: -6 }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("bottom-left");
            }}
          ></div>
          <div
            className="absolute w-4 h-4 bg-transparent cursor-nwse-resize z-10"
            style={{ bottom: -6, right: -6 }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("bottom-right");
            }}
          ></div>

          {/* Edge resize handles */}
          {/* Top edge */}
          <div
            className="absolute h-4 bg-transparent cursor-ns-resize"
            style={{
              top: -6,
              left: 12,
              right: 12,
            }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("top");
            }}
          ></div>

          {/* Right edge */}
          <div
            className="absolute w-4 bg-transparent cursor-ew-resize"
            style={{
              right: -6,
              top: 12,
              bottom: 12,
            }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("right");
            }}
          ></div>

          {/* Bottom edge */}
          <div
            className="absolute h-4 bg-transparent cursor-ns-resize"
            style={{
              bottom: -6,
              left: 12,
              right: 12,
            }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("bottom");
            }}
          ></div>

          {/* Left edge */}
          <div
            className="absolute w-4 bg-transparent cursor-ew-resize"
            style={{
              left: -6,
              top: 12,
              bottom: 12,
            }}
            onMouseDown={() => {
              windowManager.focusWindow(windowId);
              setResizing("left");
            }}
          ></div>
        </>
      )}
    </div>
  );
}
