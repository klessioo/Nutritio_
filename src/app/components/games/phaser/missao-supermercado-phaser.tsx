import { useMemo, useState } from 'react';
import Phaser from 'phaser';
import { motion } from 'motion/react';
import { PhaserGame } from './phaser-game';
import { MercadoScene, GAME_W, GAME_H, type MercadoDifficulty, type MercadoResult } from './scenes/mercado-scene';
import { ResultsScreen } from '../shared/results-screen';
import { useGameProgress } from '../../../lib/hooks/use-game-progress';

type Difficulty = 'facil' | 'medio' | 'dificil';

const LEVELS: Record<Difficulty, { label: string; emoji: string; hint: string; config: MercadoDifficulty }> = {
  facil: {
    label: 'Fácil',
    emoji: '🌱',
    hint: '2 de cada · esteira calma',
    config: { duration: 60, spawnEvery: 850, startSpeed: 160, maxSpeed: 300, junkChance: 0.28, perItem: 2 },
  },
  medio: {
    label: 'Médio',
    emoji: '🔥',
    hint: '3 de cada · vai acelerando',
    config: { duration: 75, spawnEvery: 700, startSpeed: 200, maxSpeed: 360, junkChance: 0.36, perItem: 3 },
  },
  dificil: {
    label: 'Difícil',
    emoji: '⚡',
    hint: '4 de cada · esteira veloz',
    config: { duration: 90, spawnEvery: 560, startSpeed: 240, maxSpeed: 430, junkChance: 0.45, perItem: 4 },
  },
};

export function MissaoSupermercado() {
  const { finishGame } = useGameProgress(1);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [result, setResult] = useState<MercadoResult | null>(null);

  const config = useMemo<Omit<Phaser.Types.Core.GameConfig, 'parent'>>(
    () => ({
      type: Phaser.AUTO,
      width: GAME_W,
      height: GAME_H,
      backgroundColor: '#f3e9d8',
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
      scene: [MercadoScene],
    }),
    []
  );

  const registryData = useMemo(() => {
    if (!difficulty) return undefined;
    return {
      difficulty: LEVELS[difficulty].config,
      onGameOver: (r: MercadoResult) => {
        setResult(r);
        finishGame({ score: r.score, stars: r.stars, completed: true });
      },
    };
  }, [difficulty, finishGame]);

  const handleRestart = () => {
    setResult(null);
    setDifficulty(null);
  };

  // Seleção de nível
  if (!difficulty) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="max-w-xl w-full text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Missão Supermercado</h2>
          <p className="text-gray-600 mb-2">
            Empurre o carrinho pelo corredor e complete a lista de compras 🍎, desviando das besteiras 🍔!
          </p>
          <p className="text-gray-500 text-sm mb-8">Troque de prateleira com ↑ ↓ (ou toque/arraste) · 3 vidas ❤️</p>
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
                <div className="text-xs text-gray-500 mt-1">{lvl.hint}</div>
                <div className="text-xs text-gray-400 mt-0.5">{lvl.config.duration}s</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const won = result.collected >= result.total;
    return (
      <ResultsScreen
        emoji={won ? '🏆' : result.stars >= 1 ? '🛒' : '💪'}
        title={won ? 'Lista Completa!' : result.stars >= 1 ? 'Quase lá!' : 'Continue tentando!'}
        scoreLabel={`Você fez ${result.score} pontos`}
        detailLabel={`${result.collected} de ${result.total} itens da lista concluídos`}
        stars={result.stars}
        accentGradient="from-green-500 to-green-700"
        onRestart={handleRestart}
        restartLabel="Nova Lista de Compras 🔄"
      />
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-amber-100 to-amber-200 p-2">
      <PhaserGame
        key={difficulty}
        config={config}
        registryData={registryData}
        className="h-full w-full flex items-center justify-center [&_canvas]:max-h-full [&_canvas]:rounded-2xl [&_canvas]:shadow-2xl"
      />
    </div>
  );
}
