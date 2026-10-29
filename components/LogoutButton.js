'use client'
import { sbBrowser } from '@/lib/supabase/client'
export default function LogoutButton() {
  return <button className="sec" style={{ color: '#f1ead9', borderColor: '#555' }}
    onClick={async () => { await sbBrowser().auth.signOut(); window.location.href = '/login' }}>Toka</button>
}
