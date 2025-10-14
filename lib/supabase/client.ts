// lib/supabase/client.ts
import { getSupabaseBrowser } from "../supabaseClient";

/**
 * Minimal compat shim so imports like:
 *   import { supabaseClient } from "@/lib/supabase/client"
 * continue to work without touching components.
 */
const supabaseClient = getSupabaseBrowser();

export { supabaseClient, getSupabaseBrowser };
export default supabaseClient;
