"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const THEME_STORAGE_KEY = "arenadesk-theme";

type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "arenadesk-theme-change";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;

  document.body?.classList.toggle("dark", theme === "dark");

  if (document.body) {
    document.body.dataset.theme = theme;
  }
}

function storeTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still changes for the current page even if storage is blocked.
  }
}

function readTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.classList.contains("dark") ||
    document.documentElement.dataset.theme === "dark"
    ? "dark"
    : "light";
}

function subscribeToTheme(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(THEME_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function notifyThemeListeners() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function setTheme(nextTheme: Theme) {
  applyTheme(nextTheme);
  storeTheme(nextTheme);
  notifyThemeListeners();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => "light");
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  useLayoutEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      applyTheme(storedTheme === "dark" ? "dark" : "light");
    } catch {
      applyTheme("light");
    }
  }, []);

  function handleToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      aria-label={label}
      aria-pressed={isDark}
      className="h-9 cursor-pointer rounded-lg bg-sidebar/40 px-3 text-white hover:bg-sidebar/60"
      onClick={handleToggle}
      size="sm"
      title={label}
      type="button"
      variant="ghost"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
      <span className="sr-only">{label}</span>
    </Button>
  );
}
