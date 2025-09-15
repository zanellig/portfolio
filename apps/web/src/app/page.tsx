"use client";
import Window from "@/components/window";

export default function Home() {
  return (
    <div className="relative w-dvw h-dvh select-none overflow-hidden">
      <Window>
        <div className="flex p-4">
          Window with children that overflow outside the container, to see how
          it behaves
        </div>
      </Window>
      <Window />
      <Window />
    </div>
  );
}
