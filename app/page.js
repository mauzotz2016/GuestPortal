import Link from 'next/link'
import { currentProfile } from '@/lib/supabase/server'
import RegisterForm from '@/components/RegisterForm'
import LogoutButton from '@/components/LogoutButton'

const BRANCHES = ['Indira Gandhi', 'Chikongola', 'Makunganya']
const fmt = iso => new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Dar_es_Salaam' })
const d = s => s.split('-').reverse().join('.')

export default async function Home({ searchParams }) {
  const { sb, profile } = await currentProfile()
  if (!profile) return <main><div className="card login"><p>Akaunti yako haina profile. Wasiliana na Admin.</p><LogoutButton /></div></main>
  const admin = profile.role === 'admin'
  const sp = await searchParams
  const year = new Date().getFullYear()
  const from = sp.from || `${year}-01-01`, to = sp.to || `${year}-12-31`
  const branch = admin ? (sp.branch || '') : profile.branch
  const q = (sp.q || '').trim()

  const range = qb => {
    qb = qb.gte('registered_at', `${from}T00:00:00+03:00`).lte('registered_at', `${to}T23:59:59.999+03:00`)
    if (branch) qb = qb.eq('branch', branch)
    if (q) qb = qb.ilike('full_name', `%${q.replace(/[%,]/g, '')}%`)
    return qb
  }
  const { data: rows, count } = await range(sb.from('guests').select('*', { count: 'exact' })).order('registered_at', { ascending: false }).limit(200)

  let perBranch = []
  if (admin) {
    perBranch = await Promise.all(BRANCHES.map(async b => {
      const { count: c } = await sb.from('guests').select('*', { count: 'exact', head: true })
        .eq('branch', b).gte('registered_at', `${from}T00:00:00+03:00`).lte('registered_at', `${to}T23:59:59.999+03:00`)
      return [b, c ?? 0]
    }))
  }
  const exportUrl = `/api/export?from=${from}&to=${to}${branch ? `&branch=${encodeURIComponent(branch)}` : ''}`

  return (<>
    <header>
      <div><h1>Tiffany Guest Registration Portal</h1><small>{profile.full_name}{profile.branch ? ` · ${profile.branch}` : ' · Admin'}</small></div>
      <nav>{admin && <Link href="/admin/users">Watumiaji</Link>}<LogoutButton /></nav>
    </header>
    <main>
      {admin && <div className="grid" style={{ marginBottom: 16 }}>
        <div className="card stat"><b>{perBranch.reduce((a, [, c]) => a + c, 0)}</b><span>Wageni wote (kipindi)</span></div>
        {perBranch.map(([b, c]) => <div className="card stat" key={b}><b>{c}</b><span>{b}</span></div>)}
      </div>}
      {!admin && <RegisterForm branch={profile.branch} />}
      <div className="card">
        <h2>{admin ? 'Wageni — Branch Zote' : `Wageni wa ${profile.branch}`}</h2>
        <form className="row" style={{ marginBottom: 12 }}>
          <div><label>Kuanzia</label><input type="date" name="from" defaultValue={from} /></div>
          <div><label>Hadi</label><input type="date" name="to" defaultValue={to} /></div>
          {admin && <div><label>Branch</label><select name="branch" defaultValue={branch}><option value="">Zote</option>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select></div>}
          <div><label>Tafuta jina</label><input name="q" defaultValue={q} /></div>
          <div style={{ flex: 0 }}><button>Chuja</button></div>
          {admin && <div style={{ flex: 0 }}><a className="btn" href={exportUrl}>Pakua CSV</a></div>}
        </form>
        <p className="msg">Jumla: {count ?? 0} {count > 200 && '(zinaonyeshwa 200 za karibuni; CSV ina zote)'}</p>
        <div className="wrap"><table>
          <thead><tr><th>Tarehe ya Usajili</th><th>Jina Kamili</th><th>Nchi</th><th>Kuingia</th><th>Kutoka</th><th>Branch</th><th>User</th></tr></thead>
          <tbody>{(rows || []).map(g => <tr key={g.id}><td>{fmt(g.registered_at)}</td><td>{g.full_name}</td><td>{g.country}</td><td>{d(g.check_in)}</td><td>{d(g.check_out)}</td><td>{g.branch}</td><td>{g.user_name}</td></tr>)}
            {!rows?.length && <tr><td colSpan="7">Hakuna rekodi.</td></tr>}</tbody>
        </table></div>
      </div>
    </main>
  </>)
}
