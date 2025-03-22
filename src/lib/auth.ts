import { supabase } from './supabase';
import { Profile } from '@/types';

export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return profile as Profile | null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === 'admin';
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 