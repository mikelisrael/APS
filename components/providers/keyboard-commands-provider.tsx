"use client";

import { useAuth } from "@/hooks/use-query-resource";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";

interface KeyboardCommandsContextType {
  openCommandDialog: boolean;
  setOpenCommandDialog: (open: boolean) => void;
}

const KeyboardCommandsContext = createContext<
  KeyboardCommandsContextType | undefined
>(undefined);

const KeyboardCommandsProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [openCommandDialog, setOpenCommandDialog] = useState(false);
  const { logout } = useAuth();
  const { setTheme, theme } = useTheme();

  const commands: { [key: string]: () => void } = {
    "CONTROL+K": () => {
      if (theme === "light") setTheme("dark");
      else setTheme("light");
    },
    "CONTROL+/": () =>
      setOpenCommandDialog((openCommandDialog) => !openCommandDialog),
    "SHIFT+CONTROL+Q": () => logout(undefined)
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key) {
        const keyCombo = [
          e.shiftKey ? "SHIFT+" : "",
          e.ctrlKey ? "CONTROL+" : "",
          e.key.toUpperCase()
        ].join("");

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
  }, [router, commands]);

  return (
    <KeyboardCommandsContext.Provider
      value={{ openCommandDialog, setOpenCommandDialog }}
    >
      {children}
    </KeyboardCommandsContext.Provider>
  );
};

export default KeyboardCommandsProvider;

export function useKeyboardCommands() {
  const context = useContext(KeyboardCommandsContext);
  if (!context) {
    throw new Error(
      "useKeyboardCommands must be used within a KeyboardCommandsProvider"
    );
  }
  return context;
}
