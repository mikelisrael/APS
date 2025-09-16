"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeColorUpdater() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;

    const themeColors = {
      light: "#ffffff",
      dark: "#121212"
    };

    const themeColor =
      themeColors[currentTheme as keyof typeof themeColors] ||
      themeColors.light;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute("content", themeColor);
  }, [theme, systemTheme]);

  return null;
}
