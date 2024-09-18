"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function LightDarkSwitch() {
  const { setTheme, theme } = useTheme();

  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else setTheme("light");
        }}
      >
        <Moon className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Sun className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </div>
  );
}
