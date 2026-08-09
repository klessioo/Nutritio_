import { useMemo, useState } from 'react';
import Phaser from 'phaser';
import { motion } from 'motion/react';
import { PhaserGame } from './phaser-game';
import {
  CacaFrutasScene,
  GAME_W,
  GAME_H,
  type CacaFrutasDifficulty,
  type CacaFrutasResult,
} from './scenes/caca-frutas-scene';
import { ResultsScreen } from '../shared/results-screen';
import { useGameProgress } from '../../../lib/hooks/use-game-progress';

type Difficulty = 'facil' | 'medio' | 'dificil';

const LEVELS: Record<Difficulty, { label: string; emoji: string; config: CacaFrutasDifficulty }> = {
  facil: {
    label: 'Fácil',
    emoji: '🌱',
    config: { fallSpeedMin: 170, fallSpeedMax: 250, spawnEvery: 820, junkChance: 0.25, duration: 60, targetScore: 200 },
  },
  medio: {
    label: 'Médio',
    emoji: '🔥',
    config: { fallSpeedMin: 240, fallSpeedMax: 360, spawnEvery: 640, junkChance: 0.35, duration: 55, targetScore: 320 },
  },
  dificil: {
    label: 'Difícil',
    emoji: '⚡',
    config: { fallSpeedMin: 330, fallSpeedMax: 480, spawnEvery: 480, junkChance: 0.45, duration: 50, targetScore: 450 },
  },
};

export function CacaAsFrutasPhaser() {
  const { finishGame } = useGameProgress(3);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [result, setResult] = useState<CacaFrutasResult | null>(null);

  const config = useMemo<Omit<Phaser.Types.Core.GameConfig, 'parent'>>(
    () => ({
      type: Phaser.AUTO,
      width: GAME_W,
      height: GAME_H,
      backgroundColor: '#bfe9ff',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
      scene: [CacaFrutasScene],
    }),
    []
  );

  const registryData = useMemo(() => {
    if (!difficulty) return undefined;
    return {
      difficulty: LEVELS[difficulty].config,
      onGameOver: (r: CacaFrutasResult) => {
        setResult(r);
        finishGame({ score: r.score, stars: r.stars, completed: true });
      },
    };
  }, [difficulty, finishGame]);

  const handleRestart = () => {
    setResult(null);
    setDifficulty(null);
  };

  // Tela de seleção de dificuldade
  if (!difficulty) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="max-w-xl w-full text-center">
          <div className="text-6xl mb-4">🍓</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Caça às Frutas</h2>
          <p className="text-gray-600 mb-2">Mova a cesta para pegar as frutas 🍎 e desviar das besteiras 🍔!</p>
          <p className="text-gray-500 text-sm mb-8">Use o mouse/dedo ou as setas ← → · Você tem 3 vidas ❤️</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(LEVELS) as [Difficulty, (typeof LEVELS)[Difficulty]][]).map(([key, lvl]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(key)}
                className="bg-white border-4 border-green-200 hover:border-green-500 rounded-2xl p-6 shadow-lg transition-all"
              >
                <div className="text-4xl mb-2">{lvl.emoji}</div>
                <div className="font-bold text-gray-700">{lvl.label}</div>
                <div className="text-xs text-gray-500 mt-1">{lvl.config.duration}s</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tela de resultado
  if (result) {
    return (
      <ResultsScreen
        emoji={result.stars === 3 ? '🏆' : result.stars === 0 ? '💪' : '🎉'}
        title={result.stars === 3 ? 'Incrível!' : result.stars >= 1 ? 'Muito bem!' : 'Continue tentando!'}
        scoreLabel={`Você fez ${result.score} pontos`}
        detailLabel={`${result.collected} frutas coletadas`}
        stars={result.stars}
        accentGradient="from-green-500 to-green-700"
        onRestart={handleRestart}
      />
    );
  }

  // Jogo rodando
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-100 p-2">
      <PhaserGame
        key={difficulty}
        config={config}
        registryData={registryData}
        className="h-full w-full flex items-center justify-center [&_canvas]:max-h-full [&_canvas]:rounded-2xl [&_canvas]:shadow-2xl"
      />
    </div>
  );
}
