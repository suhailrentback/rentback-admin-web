// ADMIN /lib/supabase/server.ts
import { cookies } from 'next/headers';
import {
  createServerComponentClient,
  createRouteHandlerClient
} from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createServerSupabase(): SupabaseClient {
  return createServerComponentClient({ cookies });
}

export function createRouteSupabase(): SupabaseClient {
  return createRouteHandlerClient({ cookies });
}
