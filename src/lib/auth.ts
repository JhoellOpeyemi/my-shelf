import type { Session } from '@supabase/supabase-js'
import { requireSupabase } from './supabase'

export async function getSession(): Promise<Session | null> {
  const { data, error } = await requireSupabase().auth.getSession()
  if (error) throw new Error(error.message)
  return data.session
}

export function onAuthStateChange(
  callback: (session: Session | null) => void,
) {
  return requireSupabase().auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await requireSupabase().auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw new Error(error.message)
}
