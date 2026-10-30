import { createClient } from '@supabase/supabase-js'
import { currentProfile } from '@/lib/supabase/server'

const BRANCHES = ['Indira Gandhi', 'Chikongola', 'Makunganya']

export async function GET() {
  const { sb, profile } = await currentProfile()
  if (profile?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { data } = await sb.from('profiles').select('id, full_name, role, branch').order('branch')
  return Response.json({ users: data })
}

export async function POST(req) {
  const { profile } = await currentProfile()
  if (profile?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { email, password, full_name, branch } = await req.json()
  if (!email || !full_name || !password || password.length < 8 || !BRANCHES.includes(branch))
    return Response.json({ error: 'Fill in all fields (password at least 8 characters).' }, { status: 400 })
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) return Response.json({ error: error.message }, { status: 400 })
  const { error: e2 } = await admin.from('profiles').insert({ id: data.user.id, full_name, role: 'user', branch })
  if (e2) { await admin.auth.admin.deleteUser(data.user.id); return Response.json({ error: e2.message }, { status: 400 }) }
  return Response.json({ ok: true })
}
