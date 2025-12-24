export { getSupabaseServer } from "./server";

// Back-compat aliases so existing imports keep working:
export const createServerSupabase = getSupabaseServer;
export const createRouteSupabase = getSupabaseServer;
export const supabaseServer = getSupabaseServer;
export const supabaseRoute = getSupabaseServer;
