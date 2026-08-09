import { supabase, isSupabaseConfigured } from './supabase';

export interface GameProgress {
  gameId: number;
  stars: 0 | 1 | 2 | 3;
  bestScore: number;
  completed: boolean;
}

export type ProgressMap = Record<number, GameProgress>;

interface GameProgressRow {
  game_id: number;
  stars: number;
  best_score: number;
  completed: boolean;
}

export async function getProgress(profileId: string): Promise<ProgressMap> {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase.rpc('get_game_progress', { p_profile_id: profileId });
  if (error || !data) return {};

  const map: ProgressMap = {};
  for (const row of data as GameProgressRow[]) {
    map[row.game_id] = {
      gameId: row.game_id,
      stars: row.stars as 0 | 1 | 2 | 3,
      bestScore: row.best_score,
      completed: row.completed,
    };
  }
  return map;
}

export async function recordProgress(
  profileId: string,
  gameId: number,
  result: { stars: number; score: number; completed: boolean }
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Não foi possível salvar seu progresso. Verifique sua conexão.');
  const { error } = await supabase.rpc('upsert_game_progress', {
    p_profile_id: profileId,
    p_game_id: gameId,
    p_stars: result.stars,
    p_score: result.score,
    p_completed: result.completed,
  });
  if (error) throw new Error('Não foi possível salvar seu progresso. Verifique sua conexão.');
}
