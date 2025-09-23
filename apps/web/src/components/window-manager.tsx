"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from "react";
import { Taskbar } from "./taskbar";

export interface WindowInfo {
  id: string;
  zIndex: number;
  title?: string;
  minimized: boolean;
  maximized: boolean;
  onClose?: () => void;
}

interface WindowManagerContextType {
  windows: Map<string, WindowInfo>;
  focusedWindowId: string | null;
  registerWindow: (id: string, title?: string, onClose?: () => void) => number;
  unregisterWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  getWindowZIndex: (id: string) => number;
  isWindowFocused: (id: string) => boolean;
  isWindowMinimized: (id: string) => boolean;
  isWindowMaximized: (id: string) => boolean;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error("useWindowManager must be used within a WindowManagerProvider");
  }
  return context;
}

interface WindowManagerProviderProps {
  children: React.ReactNode;
  baseZIndex?: number;
}

export function WindowManagerProvider({
  children,
  baseZIndex = 1000
}: WindowManagerProviderProps) {
  const [windows, setWindows] = useState<Map<string, WindowInfo>>(new Map());
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  const nextZIndexRef = useRef(baseZIndex);

  const registerWindow = useCallback((id: string, title?: string, onClose?: () => void): number => {
    const zIndex = nextZIndexRef.current++;

    setWindows(prev => {
      const newWindows = new Map(prev);
      newWindows.set(id, { id, zIndex, title, minimized: false, maximized: false, onClose });
      return newWindows;
    });

    setFocusedWindowId(id);
    return zIndex;
  }, []);

  const unregisterWindow = useCallback((id: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      newWindows.delete(id);
      return newWindows;
    });

    setFocusedWindowId(prev => {
      if (prev === id) {
        return null;
      }
      return prev;
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    const window = windows.get(id);
    if (window?.onClose) {
      window.onClose();
    }
    unregisterWindow(id);
  }, [unregisterWindow, windows]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      if (!prev.has(id)) return prev;

      const currentWindow = prev.get(id)!;
      const newWindows = new Map(prev);
      newWindows.set(id, { ...currentWindow, minimized: true });
      return newWindows;
    });

    setFocusedWindowId(prev => {
      if (prev === id) {
        return null;
      }
      return prev;
    });
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => {
      if (!prev.has(id)) return prev;

      const currentWindow = prev.get(id)!;
      const newZIndex = nextZIndexRef.current++;
      const newWindows = new Map(prev);
      newWindows.set(id, { ...currentWindow, minimized: false, maximized: false, zIndex: newZIndex });
      return newWindows;
    });

    setFocusedWindowId(id);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      if (!prev.has(id)) return prev;

      const currentWindow = prev.get(id)!;
      const newZIndex = nextZIndexRef.current++;
      const newWindows = new Map(prev);
      newWindows.set(id, { ...currentWindow, maximized: !currentWindow.maximized, minimized: false, zIndex: newZIndex });
      return newWindows;
    });

    setFocusedWindowId(id);
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      if (!prev.has(id)) return prev;

      const currentWindow = prev.get(id)!;
      const newZIndex = nextZIndexRef.current++;
      const newWindows = new Map(prev);
      newWindows.set(id, { ...currentWindow, zIndex: newZIndex });
      return newWindows;
    });

    setFocusedWindowId(id);
  }, []);

  const getWindowZIndex = useCallback((id: string): number => {
    const window = windows.get(id);
    return window?.zIndex || baseZIndex;
  }, [windows, baseZIndex]);

  const isWindowFocused = useCallback((id: string): boolean => {
    return focusedWindowId === id;
  }, [focusedWindowId]);

  const isWindowMinimized = useCallback((id: string): boolean => {
    const window = windows.get(id);
    return window?.minimized || false;
  }, [windows]);

  const isWindowMaximized = useCallback((id: string): boolean => {
    const window = windows.get(id);
    return window?.maximized || false;
  }, [windows]);


  const value: WindowManagerContextType = useMemo(() => ({
    windows,
    focusedWindowId,
    registerWindow,
    unregisterWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    maximizeWindow,
    focusWindow,
    getWindowZIndex,
    isWindowFocused,
    isWindowMinimized,
    isWindowMaximized,
  }), [windows, focusedWindowId, registerWindow, unregisterWindow, closeWindow, minimizeWindow, restoreWindow, maximizeWindow, focusWindow, getWindowZIndex, isWindowFocused, isWindowMinimized, isWindowMaximized]);

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
      <Taskbar />
    </WindowManagerContext.Provider>
  );
}