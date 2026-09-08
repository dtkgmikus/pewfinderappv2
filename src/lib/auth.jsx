import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [churchRoles, setChurchRoles] = useState([]) // [{church_id, role, churches:{name,slug}}]
  const [staffRole, setStaffRole] = useState(null) // 'admin' | 'moderator' | null
  const [loading, setLoading] = useState(true)

  const loadForUser = useCallback(async (user) => {
    if (!user) {
      setProfile(null)
      setChurchRoles([])
      setStaffRole(null)
      return
    }
    let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (!prof) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email, name: user.email.split('@')[0] })
        .select('*')
        .single()
      prof = created
    }
    setProfile(prof)

    const { data: cs } = await supabase
      .from('church_staff')
      .select('church_id, role, churches(name, slug)')
      .eq('profile_id', user.id)
    setChurchRoles(cs || [])

    const { data: sm } = await supabase
      .from('staff_members')
      .select('role')
      .eq('profile_id', user.id)
      .maybeSingle()
    setStaffRole(sm?.role || null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadForUser(data.session?.user).finally(() => setLoading(false))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      loadForUser(sess?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadForUser])

  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()
  const refreshProfile = () => loadForUser(session?.user)

  const value = {
    session,
    user: session?.user || null,
    profile,
    churchRoles,
    staffRole,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
