// lib/supabase/server.ts
import { cookies } from 'next/headers'
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs'

export function createServerSupabase() {
  return createServerComponentClient({ cookies })
}

export function createRouteSupabase() {
  return createRouteHandlerClient({ cookies })
}
