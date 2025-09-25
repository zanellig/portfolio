"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useId, useRef, useMemo } from "react";
import { useWindowManager } from "./window-manager";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Coordinates,
  Dimensions,
  ThreeDimensionalCoordinates,
} from "./types";

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

interface WindowProps
  extends Partial<Dimensions & ThreeDimensionalCoordinates> {
  spawnCoordinates?: Coordinates;
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

/**
 * Calculate the center coordinates of the viewport
 */
function getScreenCenter(): Coordinates {
  if (typeof window === "undefined") {
    // Fallback for SSR - use reasonable default center
    return { x: 400, y: 300 };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    x: Math.floor(viewportWidth / 2),
    y: Math.floor(viewportHeight / 2),
  };
}

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
  spawnCoordinates,
  children,
  title,
  id: providedId,
  onClose,
}: WindowProps) {
  const generatedId = useId();
  const windowId = providedId || generatedId;
  const windowManager = useWindowManager();
  const screenCenter = useMemo(() => getScreenCenter(), []);
  const [position, setPosition] = useState<Coordinates>(
    spawnCoordinates ?? screenCenter
  );
  const [dimensions, setDimensions] = useState(
    calculateDimensionsFromAR({ width, height })
  );
  const targetCoordinates = useMemo(() => {
    return {
      x: x ?? screenCenter.x - dimensions.width / 2,
      y: y ?? screenCenter.y - dimensions.height / 2,
    };
  }, [x, y, screenCenter, dimensions]);
  const [offset, setOffset] = useState<Coordinates>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<boolean>(false);
  const [resizing, setResizing] = useState<ResizeDir>("none");
  const [isSpawning, setIsSpawning] = useState<boolean>(true);

  console.group("Window rendered");
  console.log("Position:", position);
  console.log("Spawn Coordinates:", spawnCoordinates);
  console.log("Target Coordinates:", targetCoordinates);
  console.log("Dimensions:", dimensions);
  console.log("ID:", windowId);
  console.log("Title:", title);
  console.groupEnd();

  const positionRef = useRef(position);
  const dimensionsRef = useRef(dimensions);
  const animationRef = useRef<number>(undefined);

  // Keep refs up to date
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

  // Trigger scale-in animation and position transition on mount
  useEffect(() => {
    const spawnTimeout = setTimeout(() => {
      setIsSpawning(false);

      // Start logarithmic ease-in animation after spawn animation
      if (spawnCoordinates) {
        const startPosition = spawnCoordinates;
        const endPosition = targetCoordinates;
        const startTime = performance.now();
        const duration = 300; // 300ms animation

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Logarithmic ease-in function
          const easeInLog = progress === 0 ? 0 : Math.log10(1 + 9 * progress);

          const currentX =
            startPosition.x + (endPosition.x - startPosition.x) * easeInLog;
          const currentY =
            startPosition.y + (endPosition.y - startPosition.y) * easeInLog;

          setPosition({ x: currentX, y: currentY });

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          }
        };

        // Start animation after spawn delay
        const animationTimeout = setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, 0);

        return () => {
          clearTimeout(animationTimeout);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }
    }, 50); // Small delay to ensure initial render with scale(0)

    return () => {
      clearTimeout(spawnTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpawning, spawnCoordinates]);

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

        const currentPos = positionRef.current;
        const currentDim = dimensionsRef.current;

        // Initialize new geometry with current values
        let newWidth = currentDim.width;
        let newHeight = currentDim.height;
        let newX = currentPos.x;
        let newY = currentPos.y;

        // Calculate the anchor points for the right and bottom edges
        const rightAnchor = currentPos.x + currentDim.width;
        const bottomAnchor = currentPos.y + currentDim.height;

        switch (resizing) {
          case "top": {
            newHeight = Math.max(minH, bottomAnchor - mouseY);
            newY = bottomAnchor - newHeight;
            // Clamp position and recalculate dimension to keep anchor fixed
            newY = Math.max(0, newY);
            newHeight = bottomAnchor - newY;
            break;
          }
          case "right": {
            newWidth = Math.max(minW, mouseX - newX);
            // Clamp to parent boundary
            newWidth = Math.min(newWidth, parentW - newX);
            break;
          }
          case "bottom": {
            newHeight = Math.max(minH, mouseY - newY);
            // Clamp to parent boundary
            newHeight = Math.min(newHeight, parentH - newY);
            break;
          }
          case "left": {
            newWidth = Math.max(minW, rightAnchor - mouseX);
            newX = rightAnchor - newWidth;
            // Clamp position and recalculate dimension to keep anchor fixed
            newX = Math.max(0, newX);
            newWidth = rightAnchor - newX;
            break;
          }
          case "bottom-right": {
            newWidth = Math.max(minW, mouseX - newX);
            newWidth = Math.min(newWidth, parentW - newX);
            newHeight = Math.max(minH, mouseY - newY);
            newHeight = Math.min(newHeight, parentH - newY);
            break;
          }
          case "bottom-left": {
            // Handle left (anchored)
            newWidth = Math.max(minW, rightAnchor - mouseX);
            newX = rightAnchor - newWidth;
            newX = Math.max(0, newX);
            newWidth = rightAnchor - newX;
            // Handle bottom (normal)
            newHeight = Math.max(minH, mouseY - newY);
            newHeight = Math.min(newHeight, parentH - newY);
            break;
          }
          case "top-right": {
            // Handle top (anchored)
            newHeight = Math.max(minH, bottomAnchor - mouseY);
            newY = bottomAnchor - newHeight;
            newY = Math.max(0, newY);
            newHeight = bottomAnchor - newY;
            // Handle right (normal)
            newWidth = Math.max(minW, mouseX - newX);
            newWidth = Math.min(newWidth, parentW - newX);
            break;
          }
          case "top-left": {
            // Handle left (anchored)
            newWidth = Math.max(minW, rightAnchor - mouseX);
            newX = rightAnchor - newWidth;
            newX = Math.max(0, newX);
            newWidth = rightAnchor - newX;
            // Handle top (anchored)
            newHeight = Math.max(minH, bottomAnchor - mouseY);
            newY = bottomAnchor - newHeight;
            newY = Math.max(0, newY);
            newHeight = bottomAnchor - newY;
            break;
          }
        }

        // Apply the new geometry
        setPosition({ x: newX, y: newY });
        setDimensions({ width: newWidth, height: newHeight });
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
        "absolute shadow-2xl transition-transform duration-300 ease-in-out",
        isFocused ? "drop-shadow-2xl" : null,
        isMaximized ? "!top-0 !left-0 !w-full !h-full" : null,
        isSpawning ? "scale-50" : "scale-100"
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
