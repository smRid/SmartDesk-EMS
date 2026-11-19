"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "smartdesk-theme";

type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "smartdesk-theme-change";

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

export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
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
      className={cn(
        "h-11 w-11 cursor-pointer rounded-lg bg-sidebar/40 px-0 text-white hover:bg-sidebar/60",
        !compact && "lg:h-9 lg:w-auto lg:px-3",
        className,
      )}
      onClick={handleToggle}
      size="sm"
      title={label}
      type="button"
      variant="ghost"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className={compact ? "sr-only" : "hidden lg:inline"}>{isDark ? "Light" : "Dark"}</span>
      <span className="sr-only">{label}</span>
    </Button>
  );
}
