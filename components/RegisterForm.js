'use client'
import { useActionState } from 'react'
import { registerGuest } from '@/app/actions'

export default function RegisterForm({ branch }) {
  const [state, action, pending] = useActionState(registerGuest, {})
  const today = new Date().toISOString().slice(0, 10)
  return (
    <form action={action} className="card" key={state.ok ? Date.now() : 'f'}>
      <h2>Register Guest — {branch}</h2>
      <div className="grid">
        <div><label>Full Name</label><input name="full_name" required /></div>
        <div><label>Country of Origin</label><input name="country" required /></div>
        <div><label>Check-in Date</label><input name="check_in" type="date" defaultValue={today} required /></div>
        <div><label>Check-out Date</label><input name="check_out" type="date" required /></div>
      </div>
      {state.error && <p className="msg er">{state.error}</p>}
      {state.ok && <p className="msg ok">{state.ok}</p>}
      <button disabled={pending}>{pending ? 'Saving…' : 'Save Registration'}</button>
    </form>
  )
}
