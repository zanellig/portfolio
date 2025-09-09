"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    // { to: "/tech", label: "Tech Stack" },
    // { to: "/posts", label: "Posts (coming soon)" },
    // { to: "/about", label: "About" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-center px-2 py-4">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute right-2 flex items-center gap-2">
          <ModeToggle />
          <Button>Get in touch</Button>
        </div>
      </div>
      <hr />
    </div>
  );
}
