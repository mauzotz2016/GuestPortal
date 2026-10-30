'use server'
import { revalidatePath } from 'next/cache'
import { currentProfile } from '@/lib/supabase/server'

export async function registerGuest(_prev, fd) {
  const { sb, user, profile } = await currentProfile()
  if (!user || !profile || profile.role !== 'user') return { error: 'You are not allowed to register guests.' }
  const full_name = String(fd.get('full_name') || '').trim()
  const country = String(fd.get('country') || '').trim()
  const check_in = fd.get('check_in'), check_out = fd.get('check_out')
  if (!full_name || !country || !check_in || !check_out) return { error: 'Please fill in all fields.' }
  if (check_out < check_in) return { error: 'Check-out date cannot be before check-in date.' }
  const { error } = await sb.from('guests').insert({
    full_name, country, check_in, check_out,
    branch: profile.branch, user_id: user.id, user_name: profile.full_name,   // branch and user come from the server, not the form
  })
  if (error) return { error: error.code === '23505' ? 'Please try again in a second.' : 'Failed: ' + error.message }
  revalidatePath('/')
  return { ok: 'Guest registered successfully.' }
}
