"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import NoMobileView from "../shared/no-mobile-view";
import { ContextProvider } from "./context";
import KeyboardCommandsProvider from "./keyboard-commands-provider";
import { ThemeProvider } from "./theme-provider";

const queryClient = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NoMobileView />
          <KeyboardCommandsProvider>{children}</KeyboardCommandsProvider>
        </ThemeProvider>
      </ContextProvider>
    </QueryClientProvider>
  );
}
