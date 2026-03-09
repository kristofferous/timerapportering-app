"use client";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export function AppToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const update = () => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      theme={theme}
      richColors
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "font-sans text-sm",
        },
      }}
    />
  );
}
