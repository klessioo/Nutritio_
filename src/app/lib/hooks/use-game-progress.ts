import { useCallback } from 'react';
import { useSession } from '../session-context';

export interface GameResult {
  score: number;
  stars: 0 | 1 | 2 | 3;
  completed: boolean;
}

/** Grava o resultado de uma partida no perfil do jogador (sem interromper o jogo em caso de falha). */
export function useGameProgress(gameId: number) {
  const { finishGame: recordGameFinish } = useSession();

  const finishGame = useCallback(
    async (result: GameResult) => {
      try {
        await recordGameFinish(gameId, result);
      } catch (err) {
        console.warn('Não foi possível salvar o progresso do jogo', err);
      }
    },
    [gameId, recordGameFinish]
  );

  return { finishGame };
}

export function starsFromRatio(ratio: number): 0 | 1 | 2 | 3 {
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio > 0) return 1;
  return 0;
}
