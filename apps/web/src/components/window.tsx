"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

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

interface WindowProps extends Partial<Dimensions & Coordinates> {
  children?: React.ReactNode;
  z?: number;
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
}: WindowProps) {
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

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const parent = document.documentElement;
      const parentW = parent.clientWidth;
      const parentH = parent.clientHeight;

      if (dragging) {
        const elemWidth = dimensions.width;
        const elemHeight = dimensions.height;

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
          let { x, y } = position;

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
  }, [dragging, offset, resizing, position, dimensions]);

  return (
    <div
      className="absolute"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        zIndex: z ?? "auto",
      }}
    >
      {/* Inner window with overflow hidden for content */}
      <div className="relative w-full h-full rounded-lg border-2 bg-popover overflow-hidden">
        {/* Header bar (dragging) */}
        <div
          className={cn(
            "flex items-center justify-start p-2 border-b bg-accent w-full h-10",
            dragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onMouseDown={(e) => {
            setDragging(true);
            const rect = (
              e.currentTarget.parentElement?.parentElement as HTMLElement
            ).getBoundingClientRect();
            setOffset({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
        >
          <div className="h-4 w-4 bg-transparent flex items-center justify-center cursor-pointer">
            <div className="rounded-full h-2 w-2 bg-red-500"></div>
          </div>
          <div className="h-4 w-4 bg-transparent flex items-center justify-center cursor-pointer">
            <div className="rounded-full h-2 w-2 bg-yellow-500"></div>
          </div>
          <div className="h-4 w-4 bg-transparent flex items-center justify-center cursor-pointer">
            <div className="rounded-full h-2 w-2 bg-green-500"></div>
          </div>
        </div>
        {children}
      </div>

      {/* Resize handles positioned relative to outer container */}
      {/* Corner resize handles */}
      <div
        className="absolute w-4 h-4 bg-transparent cursor-nwse-resize z-10"
        style={{ top: -6, left: -6 }}
        onMouseDown={() => setResizing("top-left")}
      ></div>
      <div
        className="absolute w-4 h-4 bg-transparent cursor-nesw-resize z-10"
        style={{ top: -6, right: -6 }}
        onMouseDown={() => setResizing("top-right")}
      ></div>
      <div
        className="absolute w-4 h-4 bg-transparent cursor-nesw-resize z-10"
        style={{ bottom: -6, left: -6 }}
        onMouseDown={() => setResizing("bottom-left")}
      ></div>
      <div
        className="absolute w-4 h-4 bg-transparent cursor-nwse-resize z-10"
        style={{ bottom: -6, right: -6 }}
        onMouseDown={() => setResizing("bottom-right")}
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
        onMouseDown={() => setResizing("top")}
      ></div>

      {/* Right edge */}
      <div
        className="absolute w-4 bg-transparent cursor-ew-resize"
        style={{
          right: -6,
          top: 12,
          bottom: 12,
        }}
        onMouseDown={() => setResizing("right")}
      ></div>

      {/* Bottom edge */}
      <div
        className="absolute h-4 bg-transparent cursor-ns-resize"
        style={{
          bottom: -6,
          left: 12,
          right: 12,
        }}
        onMouseDown={() => setResizing("bottom")}
      ></div>

      {/* Left edge */}
      <div
        className="absolute w-4 bg-transparent cursor-ew-resize"
        style={{
          left: -6,
          top: 12,
          bottom: 12,
        }}
        onMouseDown={() => setResizing("left")}
      ></div>
    </div>
  );
}
