"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeToTheme(listener: () => void) {
  window.addEventListener("smartdesk-theme-change", listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener("smartdesk-theme-change", listener);
    window.removeEventListener("storage", listener);
  };
}

export function ToasterProvider() {
  const theme = useSyncExternalStore<Theme>(subscribeToTheme, readTheme, () => "dark");

  return (
    <Toaster
      closeButton
      expand={false}
      position="top-right"
      richColors
      theme={theme}
    />
  );
}
