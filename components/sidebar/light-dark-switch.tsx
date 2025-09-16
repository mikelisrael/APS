"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function LightDarkSwitch() {
  const { setTheme, theme } = useTheme();

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else setTheme("light");
        }}
        className="w-full"
      >
        Switch to {theme === "light" ? "dark" : "light"} mode
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    </div>
  );
}
