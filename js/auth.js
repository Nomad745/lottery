import { supabase } from './database.js';

export async function sendOtp(phone) {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyOtp(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw error;
  return data.session || null;
}
