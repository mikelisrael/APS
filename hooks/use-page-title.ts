"use client";

import { useEffect } from "react";

export function usePageTitle(title = "") {
  useEffect(() => {
    if (title) {
      document.title = title + " • UICS Connect";
    } else {
      document.title = "Loading...";
    }
  }, [title]);
}
