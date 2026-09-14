// Shared by create-mux-upload-url (and any future function that just needs
// "this is a real, logged-in, non-restricted/non-suspended PewFinder
// member" rather than church-ownership specifically — see
// verifyChurchOwner.ts for that narrower check).
import { createClient } from 'npm:@supabase/supabase-js@2'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

export async function verifyMember(req: Request) {
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
  const { data: profile, error: profileErr } = await serviceClient
    .from('profiles')
    .select('restricted, suspended')
    .eq('id', userRes.user.id)
    .maybeSingle()
  if (profileErr) throw new AuthError('Could not verify member', 500)
  if (profile?.restricted || profile?.suspended) {
    throw new AuthError('Your account cannot post right now', 403)
  }

  return { userId: userRes.user.id as string, email: userRes.user.email as string, serviceClient }
}
