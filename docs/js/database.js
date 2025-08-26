import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[配置缺失] 请在 js/config.js 中配置 SUPABASE_URL 与 SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Records CRUD
export async function addRecord(record) {
  const { data, error } = await supabase.from('records').insert(record).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteRecord(id) {
  const { error } = await supabase.from('records').delete().eq('id', id);
  if (error) throw error;
}

export async function listRecords(userId, { start, end, type }) {
  let query = supabase.from('records').select('*').eq('user_id', userId).order('record_date', { ascending: false }).order('record_time', { ascending: false, nullsFirst: true });
  if (start) query = query.gte('record_date', start);
  if (end) query = query.lte('record_date', end);
  if (type && type !== 'all') query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
