"use client";

import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

const KeyboardCommandsProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const commands: { [key: string]: () => void } = {
    "Shift+Control+P": () => router.push("/profile"),
    "Control+S": () => router.push("/settings"),
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key) {
        const keyCombo = `${e.shiftKey ? "Shift+" : ""}${e.ctrlKey ? "Control+" : ""}${e.key.toUpperCase()}`;
        const action = commands[keyCombo];
        if (action) {
          e.preventDefault();
          action();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return <>{children}</>;
};

export default KeyboardCommandsProvider;
