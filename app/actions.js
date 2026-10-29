'use server'
import { revalidatePath } from 'next/cache'
import { currentProfile } from '@/lib/supabase/server'

export async function registerGuest(_prev, fd) {
  const { sb, user, profile } = await currentProfile()
  if (!user || !profile || profile.role !== 'user') return { error: 'Huna ruhusa ya kusajili.' }
  const full_name = String(fd.get('full_name') || '').trim()
  const country = String(fd.get('country') || '').trim()
  const check_in = fd.get('check_in'), check_out = fd.get('check_out')
  if (!full_name || !country || !check_in || !check_out) return { error: 'Jaza sehemu zote.' }
  if (check_out < check_in) return { error: 'Siku ya kutoka haiwezi kuwa kabla ya kuingia.' }
  const { error } = await sb.from('guests').insert({
    full_name, country, check_in, check_out,
    branch: profile.branch, user_id: user.id, user_name: profile.full_name,   // branch na user vinatoka seva, si fomu
  })
  if (error) return { error: error.code === '23505' ? 'Jaribu tena sekunde moja baadaye.' : 'Imeshindikana: ' + error.message }
  revalidatePath('/')
  return { ok: 'Mgeni amesajiliwa.' }
}
