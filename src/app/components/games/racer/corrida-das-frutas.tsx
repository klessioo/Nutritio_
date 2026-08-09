import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart, Loader2 } from 'lucide-react';
import { Pseudo3DRacer } from './pseudo3d-engine';
import { ResultsScreen } from '../shared/results-screen';
import { useGameProgress } from '../../../lib/hooks/use-game-progress';

const GAME_W = 800;
const GAME_H = 500;

const FRUITS = ['apple', 'banana', 'grape', 'strawberry', 'cherry', 'pineapple'];
const JUNK = ['donut', 'burger', 'pizza', 'milkshake', 'lollipop', 'candy'];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

interface Result {
  score: number;
  collected: number;
  stars: 0 | 1 | 2 | 3;
  won: boolean;
}

export function CorridaDasFrutas() {
  const { finishGame } = useGameProgress(9);
  const [phase, setPhase] = useState<'intro' | 'loading' | 'playing'>('intro');
  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ score: 0, lives: 3, speed: 0, time: 100, progress: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Pseudo3DRacer | null>(null);
  const assetsRef = useRef<{ good: HTMLImageElement[]; bad: HTMLImageElement[] } | null>(null);

  const start = useCallback(async () => {
    setPhase('loading');
    setResult(null);
    setHud({ score: 0, lives: 3, speed: 0, time: 100, progress: 0 });
    const [good, bad] = await Promise.all([
      Promise.all(FRUITS.map((f) => loadImage(`/assets/games/fruits/${f}.png`))),
      Promise.all(JUNK.map((j) => loadImage(`/assets/games/junk/${j}.png`))),
    ]);
    assetsRef.current = { good, bad };
    setPhase('playing');
  }, []);

  // Cria o motor só quando o canvas da fase 'playing' já está montado
  useEffect(() => {
    if (phase !== 'playing' || result) return;
    const canvas = canvasRef.current;
    const assets = assetsRef.current;
    if (!canvas || !assets) return;

    const ctx = canvas.getContext('2d')!;
    const engine = new Pseudo3DRacer(ctx, GAME_W, GAME_H, assets, {
      onScore: (s) => setHud((h) => ({ ...h, score: s })),
      onLives: (l) => setHud((h) => ({ ...h, lives: l })),
      onSpeed: (kmh) => setHud((h) => ({ ...h, speed: kmh })),
      onTime: (t) => setHud((h) => ({ ...h, time: t })),
      onProgress: (p) => setHud((h) => ({ ...h, progress: p })),
      onGameOver: (r) => {
        setResult(r);
        finishGame({ score: r.score, stars: r.stars, completed: true });
      },
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [phase, result, finishGame]);

  // teclado
  useEffect(() => {
    if (phase !== 'playing') return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') engineRef.current?.setSteer(-1);
      if (e.key === 'ArrowRight') engineRef.current?.setSteer(1);
      if (e.key === 'ArrowDown') engineRef.current?.setAccelerating(false);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') engineRef.current?.setSteer(0);
      if (e.key === 'ArrowDown') engineRef.current?.setAccelerating(true);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [phase]);

  const handleRestart = () => {
    engineRef.current?.stop();
    engineRef.current = null;
    setResult(null);
    setPhase('intro');
  };

  if (phase === 'intro') {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🏎️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Corrida das Frutas</h2>
          <p className="text-gray-600 mb-2">Dirija na pista pegando frutas 🍎 e desviando das besteiras 🍔!</p>
          <p className="text-gray-500 text-sm mb-8">Vire com ← → (ou os botões na tela) · 3 vidas ❤️</p>
          <button
            onClick={start}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Acelerar! 🏁
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Preparando a pista...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <ResultsScreen
        emoji={result.won ? '🏁' : result.stars === 0 ? '💪' : '🎉'}
        title={result.won ? 'Você cruzou a chegada! 🏆' : result.stars >= 1 ? 'Quase lá!' : 'Continue tentando!'}
        scoreLabel={`Você fez ${result.score} pontos`}
        detailLabel={`${result.collected} frutas coletadas`}
        stars={result.stars}
        accentGradient="from-red-500 to-orange-500"
        onRestart={handleRestart}
        restartLabel="Correr de Novo 🔄"
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-800 p-2">
      <div className="relative w-full max-w-4xl" style={{ aspectRatio: `${GAME_W} / ${GAME_H}` }}>
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className="w-full h-full rounded-2xl shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />
        {/* HUD sobreposto */}
        <div className="absolute top-3 left-4 flex flex-col gap-1 pointer-events-none">
          <div className="text-yellow-300 font-bold text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]" style={{ fontFamily: 'monospace' }}>
            {hud.speed} <span className="text-sm">km/h</span>
          </div>
          <div className="text-white font-bold text-lg drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]" style={{ fontFamily: 'monospace' }}>
            🏆 {hud.score}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Heart key={i} className={`w-6 h-6 drop-shadow ${i < hud.lives ? 'text-red-500 fill-red-500' : 'text-gray-400/60'}`} />
            ))}
          </div>
        </div>
        <div className="absolute top-3 right-4 text-white font-bold text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)] pointer-events-none" style={{ fontFamily: 'monospace' }}>
          ⏱ {hud.time}s
        </div>
        {/* Barra de progresso até a linha de chegada */}
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-sm">🚗</span>
            <div className="relative flex-1 h-2.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-300 to-lime-400 rounded-full transition-[width] duration-200"
                style={{ width: `${Math.round(hud.progress * 100)}%` }}
              />
            </div>
            <span className="text-base">🏁</span>
          </div>
        </div>
      </div>

      {/* Controles touch */}
      <div className="flex gap-6 mt-3">
        <button
          onPointerDown={() => engineRef.current?.setSteer(-1)}
          onPointerUp={() => engineRef.current?.setSteer(0)}
          onPointerLeave={() => engineRef.current?.setSteer(0)}
          className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all"
          aria-label="Virar à esquerda"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onPointerDown={() => engineRef.current?.setSteer(1)}
          onPointerUp={() => engineRef.current?.setSteer(0)}
          onPointerLeave={() => engineRef.current?.setSteer(0)}
          className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all"
          aria-label="Virar à direita"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
