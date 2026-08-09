import { useMemo, useState } from 'react';
import Phaser from 'phaser';
import { PhaserGame } from './phaser-game';
import { PlateScene, GAME_W, GAME_H, type PlateResult } from './scenes/plate-scene';
import { ResultsScreen } from '../shared/results-screen';
import { useGameProgress } from '../../../lib/hooks/use-game-progress';

export function PratoEquilibrado() {
  const { finishGame } = useGameProgress(2);
  const [result, setResult] = useState<PlateResult | null>(null);
  const [runId, setRunId] = useState(0);

  const config = useMemo<Omit<Phaser.Types.Core.GameConfig, 'parent'>>(
    () => ({
      type: Phaser.AUTO,
      width: GAME_W,
      height: GAME_H,
      backgroundColor: '#c68a45',
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [PlateScene],
    }),
    []
  );

  const registryData = useMemo(
    () => ({
      onGameOver: (r: PlateResult) => {
        setResult(r);
        finishGame({ score: r.score, stars: r.stars, completed: true });
      },
    }),
    [finishGame]
  );

  const handleRestart = () => {
    setResult(null);
    setRunId((n) => n + 1);
  };

  if (result) {
    const perfect = result.junkCount === 0;
    return (
      <ResultsScreen
        emoji={perfect ? '🍽️' : '🥗'}
        title={perfect ? 'Prato Perfeitamente Equilibrado!' : 'Prato Equilibrado!'}
        scoreLabel={`Você montou um prato com ${result.plateCount} alimentos`}
        detailLabel={
          perfect
            ? 'Só escolhas saudáveis — mandou muito bem!'
            : `Mas colocou ${result.junkCount} item(ns) menos saudável(is) — repare melhor da próxima vez!`
        }
        stars={result.stars}
        accentGradient="from-green-500 to-green-700"
        onRestart={handleRestart}
        restartLabel="Montar Outro Prato 🔄"
      />
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-amber-100 to-amber-200 p-2">
      <PhaserGame
        key={runId}
        config={config}
        registryData={registryData}
        className="h-full w-full flex items-center justify-center [&_canvas]:max-h-full [&_canvas]:rounded-2xl [&_canvas]:shadow-2xl"
      />
    </div>
  );
}
