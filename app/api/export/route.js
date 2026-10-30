import { currentProfile } from '@/lib/supabase/server'
import { buildPdf } from '@/lib/pdf'

export const runtime = 'nodejs'

export async function GET(req) {
  const { sb, profile } = await currentProfile()
  if (!profile || profile.role !== 'admin') return new Response('Forbidden', { status: 403 })   // regular users cannot download
  const p = new URL(req.url).searchParams
  const from = p.get('from'), to = p.get('to'), branch = p.get('branch')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from || '') || !/^\d{4}-\d{2}-\d{2}$/.test(to || '')) return new Response('Invalid date', { status: 400 })

  const rows = []
  for (let off = 0; ; off += 1000) {
    let qb = sb.from('guests').select('*').gte('registered_at', `${from}T00:00:00+03:00`).lte('registered_at', `${to}T23:59:59.999+03:00`)
      .order('registered_at').range(off, off + 999)
    if (branch) qb = qb.eq('branch', branch)
    const { data, error } = await qb
    if (error) return new Response(error.message, { status: 500 })
    rows.push(...data)
    if (data.length < 1000) break
  }
  const bytes = await buildPdf({ rows, from, to, branch, generatedBy: profile.full_name + ' (Admin)' })
  return new Response(bytes, { headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="tiffany-guest-report_${from}_${to}.pdf"` } })
}
