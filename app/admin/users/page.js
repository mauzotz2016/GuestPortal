'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const BRANCHES = ['Indira Gandhi', 'Chikongola', 'Makunganya']

export default function Users() {
  const [users, setUsers] = useState([]), [msg, setMsg] = useState(null)
  const [f, setF] = useState({ email: '', password: '', full_name: '', branch: BRANCHES[0] })
  const load = () => fetch('/api/users').then(r => r.ok ? r.json() : { users: [] }).then(j => setUsers(j.users || []))
  useEffect(() => { load() }, [])
  async function add(e) {
    e.preventDefault(); setMsg(null)
    const r = await fetch('/api/users', { method: 'POST', body: JSON.stringify(f), headers: { 'Content-Type': 'application/json' } })
    const j = await r.json()
    if (r.ok) { setMsg({ ok: 'User created successfully.' }); setF({ ...f, email: '', password: '', full_name: '' }); load() } else setMsg({ er: j.error })
  }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return (<main>
    <p><Link href="/">← Back to Dashboard</Link></p>
    <form className="card" onSubmit={add}>
      <h2>Add Branch User</h2>
      <div className="grid">
        <div><label>Name</label><input value={f.full_name} onChange={set('full_name')} required /></div>
        <div><label>Email</label><input type="email" value={f.email} onChange={set('email')} required /></div>
        <div><label>Password (8+)</label><input type="password" value={f.password} onChange={set('password')} minLength={8} required /></div>
        <div><label>Branch</label><select value={f.branch} onChange={set('branch')}>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select></div>
      </div>
      {msg && <p className={'msg ' + (msg.ok ? 'ok' : 'er')}>{msg.ok || msg.er}</p>}
      <button>Add</button>
    </form>
    <div className="card"><h2>Users</h2><div className="wrap"><table>
      <thead><tr><th>Name</th><th>Role</th><th>Branch</th></tr></thead>
      <tbody>{users.map(u => <tr key={u.id}><td>{u.full_name}</td><td>{u.role}</td><td>{u.branch || '—'}</td></tr>)}</tbody>
    </table></div></div>
  </main>)
}
