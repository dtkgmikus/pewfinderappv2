// Shared by create-checkout-session and create-billing-portal-session: both
// need to confirm "the person calling this holds a valid PewFinder session,
// and that session's user is the OWNER of the church_id they're asking to
// bill" before an edge function (running with the powerful service-role key)
// touches Stripe or the subscriptions table on that church's behalf.
//
// Two Supabase clients are used deliberately:
//   - `anonClient` carries the caller's own JWT, so auth.getUser() validates
//     it exactly the way PostgREST would (expired/forged tokens rejected).
//   - `serviceClient` (service-role key) then checks church_staff directly,
//     bypassing RLS — safe here because we already know exactly which
//     profile_id we're checking, from the verified JWT above.
import { createClient } from 'npm:@supabase/supabase-js@2'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

export async function verifyChurchOwner(req: Request, churchId: string) {
  const authHeader = req.headers.get('Authorization') || ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '')
  if (!jwt) throw new AuthError('Missing Authorization header', 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const anonClient = createClient(supabaseUrl, anonKey)
  const { data: userRes, error: userErr } = await anonClient.auth.getUser(jwt)
  if (userErr || !userRes?.user) throw new AuthError('Invalid or expired session', 401)

  const serviceClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: staffRow, error: staffErr } = await serviceClient
    .from('church_staff')
    .select('role')
    .eq('church_id', churchId)
    .eq('profile_id', userRes.user.id)
    .maybeSingle()
  if (staffErr) throw new AuthError('Could not verify church role', 500)
  if (!staffRow || staffRow.role !== 'owner') {
    throw new AuthError('Only a church\'s owner can manage its billing', 403)
  }

  return { userId: userRes.user.id, email: userRes.user.email as string, serviceClient }
}
