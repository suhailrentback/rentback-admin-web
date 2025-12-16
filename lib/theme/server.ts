// lib/theme/server.ts
import { cookies } from "next/headers";

export type Theme = "light" | "dark";

export function getThemeFromCookies(): Theme {
  const c = cookies().get("theme")?.value as Theme | undefined;
  return c === "dark" ? "dark" : "light";
}
