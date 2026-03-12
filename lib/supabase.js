import { createClient } from '@supabase/supabase-js'

export const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null

// ── КЛИЕНТЫ ──────────────────────────────────────────────────
export async function getClients(userId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('name')
  if (error) throw error
  return data
}

export async function createClient_db(userId, clientData) {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...clientData, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClient(clientId, clientData) {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── ДЕКЛАРАЦИИ ────────────────────────────────────────────────
export async function getDeclarations(userId, filters = {}) {
  let query = supabase
    .from('declarations')
    .select('*, clients(name, bin, type, regime)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters.client_id) query = query.eq('client_id', filters.client_id)
  if (filters.form_code) query = query.eq('form_code', filters.form_code)
  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function saveDeclaration(userId, decl) {
  const payload = {
    user_id: userId,
    client_id: decl.client_id,
    form_code: decl.form_code,
    period: decl.period,
    status: decl.status || 'draft',
    form_data: decl.form_data,
    xml_content: decl.xml_content || null,
  }
  if (decl.id) {
    const { data, error } = await supabase.from('declarations').update(payload).eq('id', decl.id).select().single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase.from('declarations').insert(payload).select().single()
    if (error) throw error
    return data
  }
}

// ── ПРОФИЛЬ ───────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

// ── УВЕДОМЛЕНИЯ ───────────────────────────────────────────────
export async function getNotifications(userId) {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
  if (error) throw error
  return data
}
