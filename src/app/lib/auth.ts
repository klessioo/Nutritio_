import { supabase, isSupabaseConfigured } from './supabase';
import type { AvatarConfig } from '../components/avatar-creator';

const SESSION_KEY = 'nutritio_session';

export interface Profile {
  id: string;
  username: string;
  avatarConfig: AvatarConfig | null;
}

interface ProfileRow {
  id: string;
  username: string;
  avatar_config: Record<string, unknown>;
}

function isAvatarConfig(value: Record<string, unknown>): boolean {
  return typeof value.skinTone === 'number' && typeof value.hairStyle === 'number';
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    avatarConfig: isAvatarConfig(row.avatar_config) ? (row.avatar_config as unknown as AvatarConfig) : null,
  };
}

const GENERIC_ERROR = 'Não foi possível completar a ação. Tente novamente em instantes.';
const NOT_CONFIGURED_ERROR =
  'O servidor ainda não foi configurado pela equipe do projeto. Tente novamente mais tarde.';

function friendlyError(error: { message?: string } | null): string {
  if (!error?.message) return GENERIC_ERROR;
  // Erros lançados pelas nossas funções RPC (RAISE EXCEPTION) já vêm em português.
  return error.message;
}

export async function registerUser(username: string, password: string): Promise<Profile> {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_ERROR);
  const { data, error } = await supabase.rpc('register_user', {
    p_username: username,
    p_password: password,
  });
  if (error) throw new Error(friendlyError(error));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error(GENERIC_ERROR);
  return toProfile(row as ProfileRow);
}

export async function loginUser(username: string, password: string): Promise<Profile> {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_ERROR);
  const { data, error } = await supabase.rpc('login_user', {
    p_username: username,
    p_password: password,
  });
  if (error) throw new Error(friendlyError(error));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Usuário ou senha inválidos');
  return toProfile(row as ProfileRow);
}

export async function fetchProfile(profileId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('get_profile', { p_profile_id: profileId });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? toProfile(row as ProfileRow) : null;
}

export async function saveAvatar(profileId: string, avatarConfig: AvatarConfig): Promise<void> {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_ERROR);
  const { error } = await supabase.rpc('update_avatar', {
    p_profile_id: profileId,
    p_avatar_config: avatarConfig,
  });
  if (error) throw new Error(friendlyError(error));
}

export function persistSession(profileId: string): void {
  localStorage.setItem(SESSION_KEY, profileId);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function restoreSession(): Promise<Profile | null> {
  const profileId = localStorage.getItem(SESSION_KEY);
  if (!profileId) return null;
  const profile = await fetchProfile(profileId);
  if (!profile) {
    clearSession();
    return null;
  }
  return profile;
}
