// lib/supabase/server.ts
import { cookies } from 'next/headers'
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs'

// Canonical helpers
export function createServerSupabase() {
  return createServerComponentClient({ cookies })
}

export function createRouteSupabase() {
  return createRouteHandlerClient({ cookies })
}

// Back-compat aliases (leave these so older imports don't break)
export const supabaseServer = createServerSupabase
export const supabaseRoute = createRouteSupabase
