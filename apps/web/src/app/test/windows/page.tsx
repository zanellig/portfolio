"use client";

import Window from "@/components/window";
import { App } from "@/components/app";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function WindowTestPage() {
  return (
    <div className="min-h-screen relative bg-background select-none">
      <h1 className="fixed top-4 left-4 z-50 text-2xl font-bold">
        Window Manager & App Launcher Test
      </h1>
      <p className="fixed top-12 left-4 z-50 text-sm text-muted-foreground">
        Double-click apps to open windows. Click on windows to focus them. Drag
        to move, use handles to resize.
      </p>

      <ModeToggle />

      {/* Desktop with app icons */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Applications</h3>
        <div className="flex flex-wrap gap-4 max-w-xs">
          <App
            id="calculator"
            icon="🧮"
            label="Calculator"
            windowTitle="Calculator"
            windowWidth={300}
            windowHeight={400}
            x={100}
            y={100}
            windowContent={
              <div>
                <h2 className="text-lg font-semibold mb-4">Calculator</h2>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    7,
                    8,
                    9,
                    "/",
                    4,
                    5,
                    6,
                    "*",
                    1,
                    2,
                    3,
                    "-",
                    0,
                    ".",
                    "=",
                    "+",
                  ].map((btn) => (
                    <Button key={btn} variant="outline" className="h-12">
                      {btn}
                    </Button>
                  ))}
                </div>
              </div>
            }
          />

          <App
            id="text-editor"
            icon="📝"
            label="Text Editor"
            windowTitle="Text Editor"
            windowWidth={500}
            windowHeight={400}
            x={150}
            y={150}
            windowContent={
              <div>
                <h2 className="text-lg font-semibold mb-4">Text Editor</h2>
                <textarea
                  className="w-full h-64 p-3 border rounded resize-none"
                  placeholder="Start typing your document..."
                />
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Save</Button>
                  <Button size="sm" variant="outline">
                    Open
                  </Button>
                  <Button size="sm" variant="outline">
                    New
                  </Button>
                </div>
              </div>
            }
          />

          <App
            id="file-manager"
            icon="📁"
            label="Files"
            windowTitle="File Manager"
            windowWidth={600}
            windowHeight={450}
            x={200}
            y={200}
            windowContent={
              <div>
                <h2 className="text-lg font-semibold mb-4">File Manager</h2>
                <div className="space-y-2">
                  {[
                    "Documents",
                    "Pictures",
                    "Downloads",
                    "Desktop",
                    "Music",
                    "Videos",
                  ].map((folder) => (
                    <div
                      key={folder}
                      className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <span>📁</span>
                      <span>{folder}</span>
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          <App
            id="settings"
            icon="⚙️"
            label="Settings"
            windowTitle="System Settings"
            windowWidth={400}
            windowHeight={500}
            x={250}
            y={250}
            windowContent={
              <div>
                <h2 className="text-lg font-semibold mb-4">System Settings</h2>
                <div className="space-y-4">
                  <div className="p-3 border rounded">
                    <h3 className="font-medium">Display</h3>
                    <p className="text-sm text-muted-foreground">
                      Brightness, resolution, orientation
                    </p>
                  </div>
                  <div className="p-3 border rounded">
                    <h3 className="font-medium">Sound</h3>
                    <p className="text-sm text-muted-foreground">
                      Volume, audio devices
                    </p>
                  </div>
                  <div className="p-3 border rounded">
                    <h3 className="font-medium">Network</h3>
                    <p className="text-sm text-muted-foreground">
                      Wi-Fi, ethernet, VPN
                    </p>
                  </div>
                  <div className="p-3 border rounded">
                    <h3 className="font-medium">Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      Permissions, data usage
                    </p>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Static demo windows */}
      <Window x={400} y={100} width={350} height={250} title="Demo Window">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Static Demo Window</h2>
          <p className="text-sm">
            This is a static window to demonstrate both app-launched and
            directly created windows working together.
          </p>
          <input
            type="text"
            placeholder="Type here..."
            className="mt-4 px-3 py-2 border rounded w-full"
          />
        </div>
      </Window>
    </div>
  );
}
