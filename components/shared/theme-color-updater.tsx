"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeColorUpdater() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Determine the current effective theme
    const currentTheme = theme === "system" ? systemTheme : theme;

    // Define your theme colors (match these to your app's background colors)
    const themeColors = {
      light: "#ffffff",
      dark: "#100c0b"
    };

    // Get the appropriate color
    const themeColor =
      themeColors[currentTheme as keyof typeof themeColors] ||
      themeColors.light;

    // Update the meta theme-color tag
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
