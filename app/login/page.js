'use client'
import { useState } from 'react'
import { sbBrowser } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const { error } = await sbBrowser().auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setErr(error.message); setBusy(false) } else window.location.href = '/'
    } catch (ex) {
      setErr('Connection error: ' + ex.message); setBusy(false)
    }
  }
  return (
    <main><form className="card login" onSubmit={submit}>
      <h2>Tiffany Guest Registration Portal</h2>
      <label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <p className="msg er">{err}</p>
      <button disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}</button>
    </form></main>
  )
}
