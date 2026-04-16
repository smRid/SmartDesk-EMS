"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      closeButton
      expand={false}
      position="top-right"
      richColors
      theme="light"
    />
  );
}
