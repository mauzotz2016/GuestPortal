'use client'
import { useState } from 'react'
import { sbBrowser } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await sbBrowser().auth.signInWithPassword({ email, password })
    if (error) { setErr('Email au password si sahihi.'); setBusy(false) } else window.location.href = '/'
  }
  return (
    <main><form className="card login" onSubmit={submit}>
      <h2>Tiffany Guest Registration Portal</h2>
      <label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <p className="msg er">{err}</p>
      <button disabled={busy}>{busy ? 'Subiri…' : 'Ingia'}</button>
    </form></main>
  )
}
