import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const AdminContext = createContext(null)

export function AdminProvider({ churchId, role, children }) {
  const [church, setChurch] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: c, error: cErr }, { data: sub, error: sErr }] = await Promise.all([
        supabase.from('churches').select('*').eq('id', churchId).single(),
        supabase.from('subscriptions').select('*').eq('church_id', churchId).maybeSingle(),
      ])
      if (cErr) throw cErr
      if (sErr) throw sErr
      setChurch(c)
      setSubscription(sub)
    } catch (e) {
      console.error('AdminProvider refresh failed:', e)
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [churchId])

  useEffect(() => { refresh() }, [refresh])

  const isPro = subscription?.plan === 'pro' && subscription?.status !== 'cancelled'

  return (
    <AdminContext.Provider value={{ church, subscription, role, isPro, loading, error, refresh }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
