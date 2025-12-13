// lib/supabase/index.ts
export {
  createServerSupabase,
  createRouteSupabase,
  createClient,
  supabaseServer,
  supabaseRoute,
} from "./server";

// Optional default (mirrors server default)
export { default } from "./server";
