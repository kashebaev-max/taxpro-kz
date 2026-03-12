import { useState, useEffect, createContext, useContext } from 'react'
import '../styles/globals.css'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

let supabaseClient = null
function getSupabase() {
  if (typeof window === 'undefined') return null
  if (supabaseClient) return supabaseClient
  const { createClient } = require('@supabase/supabase-js')
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  return supabaseClient
}

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(supabase, session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) loadProfile(supabase, session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(supabase, userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  const value = { session, profile, setProfile, signOut, loading, getSupabase }

  return (
    <AuthContext.Provider value={value}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}
