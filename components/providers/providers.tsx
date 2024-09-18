import { PropsWithChildren } from "react";
import { ContextProvider } from "./context";
import KeyboardCommandsProvider from "./keyboard-commands-provider";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ContextProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <KeyboardCommandsProvider>{children}</KeyboardCommandsProvider>
      </ThemeProvider>
    </ContextProvider>
  );
}
