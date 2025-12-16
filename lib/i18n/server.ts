import { cookies, headers } from "next/headers";
import type { Lang } from "../i18n";
import { resolveLocale } from "../i18n";

export function getLangFromCookies(): Lang {
  const c = cookies().get("lang")?.value;
  const accept = headers().get("accept-language") || "";
  const hinted = accept.toLowerCase().startsWith("ur") ? "ur" : "en";
  return resolveLocale(c ?? hinted);
}
