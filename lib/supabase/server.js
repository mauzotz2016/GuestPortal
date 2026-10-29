import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function sbServer() {
  const c = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => c.getAll(),
      setAll(list) { try { list.forEach(({ name, value, options }) => c.set(name, value, options)) } catch {} },
    },
  })
}

export async function currentProfile() {
  const sb = await sbServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { sb, user: null, profile: null }
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single()
  return { sb, user, profile }
}
