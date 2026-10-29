import { currentProfile } from '@/lib/supabase/server'

const cell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"'

export async function GET(req) {
  const { sb, profile } = await currentProfile()
  if (!profile || profile.role !== 'admin') return new Response('Forbidden', { status: 403 })   // user hawezi kupakua
  const p = new URL(req.url).searchParams
  const from = p.get('from'), to = p.get('to'), branch = p.get('branch')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from || '') || !/^\d{4}-\d{2}-\d{2}$/.test(to || '')) return new Response('Tarehe si sahihi', { status: 400 })

  const lines = ['Date,FullName,Country,CheckIn,CheckOut,Branch,User']
  for (let off = 0; ; off += 1000) {
    let qb = sb.from('guests').select('*').gte('registered_at', `${from}T00:00:00+03:00`).lte('registered_at', `${to}T23:59:59.999+03:00`)
      .order('registered_at').range(off, off + 999)
    if (branch) qb = qb.eq('branch', branch)
    const { data, error } = await qb
    if (error) return new Response(error.message, { status: 500 })
    data.forEach(g => lines.push([
      new Date(g.registered_at).toLocaleString('en-GB', { timeZone: 'Africa/Dar_es_Salaam' }),
      g.full_name, g.country, g.check_in, g.check_out, g.branch, g.user_name].map(cell).join(',')))
    if (data.length < 1000) break
  }
  return new Response('\ufeff' + lines.join('\n'), { headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="tiffany-guests_${from}_${to}.csv"` } })
}
