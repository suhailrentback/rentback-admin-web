// lib/supabase/client.ts
import {
  getSupabaseBrowser,
  supabase as baseClient,
} from "../supabaseClient";

/**
 * Back-compat shim so imports like:
 *   import { supabaseClient } from "@/lib/supabase/client"
 * keep working without touching pages/components.
 */
export const supabaseClient = baseClient;
export const createBrowserSupabase = getSupabaseBrowser;
export { getSupabaseBrowser };

/** Optional default export for extra compatibility */
export default supabaseClient;
