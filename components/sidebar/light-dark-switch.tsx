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
      </Button>
    </div>
  );
}
