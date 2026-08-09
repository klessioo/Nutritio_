import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ResultsScreen } from './shared/results-screen';
import { useGameProgress } from '../../lib/hooks/use-game-progress';

type Visual = { kind: 'img'; src: string } | { kind: 'emoji'; char: string };

interface Fruit {
  id: string;
  name: string;
  visual: Visual;
  short: string; // texto curto no verso "fato"
  explain: string; // explicação completa mostrada ao acertar o par
}

// Pixel art CC0 (Pixel Fruit Pack, ver ATTRIBUTIONS.md) para as 6 frutas com
// sprite dedicado; as demais usam emoji nativo (nítido, sem estilo "clipart").
const POOL: Fruit[] = [
  {
    id: 'maca',
    name: 'Maçã',
    visual: { kind: 'img', src: '/assets/games/fruits/apple.png' },
    short: 'Rica em fibras',
    explain: 'A maçã tem fibras que ajudam sua barriga a digerir bem e deixam você satisfeito por mais tempo!',
  },
  {
    id: 'banana',
    name: 'Banana',
    visual: { kind: 'img', src: '/assets/games/fruits/banana.png' },
    short: 'Fonte de potássio',
    explain: 'A banana é rica em potássio, um mineral que dá energia para os músculos e ajuda o coração a bater certinho!',
  },
  {
    id: 'uva',
    name: 'Uva',
    visual: { kind: 'img', src: '/assets/games/fruits/grape.png' },
    short: 'Cheia de antioxidantes',
    explain: 'A uva tem antioxidantes que protegem as células do seu corpo e ajudam você a ficar saudável por dentro!',
  },
  {
    id: 'morango',
    name: 'Morango',
    visual: { kind: 'img', src: '/assets/games/fruits/strawberry.png' },
    short: 'Muita vitamina C',
    explain: 'O morango é cheio de vitamina C, que fortalece suas defesas contra gripes e resfriados!',
  },
  {
    id: 'cereja',
    name: 'Cereja',
    visual: { kind: 'img', src: '/assets/games/fruits/cherry.png' },
    short: 'Ajuda a dormir bem',
    explain: 'A cereja tem melatonina, uma substância que ajuda seu corpo a relaxar e dormir melhor à noite!',
  },
  {
    id: 'abacaxi',
    name: 'Abacaxi',
    visual: { kind: 'img', src: '/assets/games/fruits/pineapple.png' },
    short: 'Boa para a digestão',
    explain: 'O abacaxi tem a bromelina, uma enzima que ajuda a digerir os alimentos depois das refeições!',
  },
  {
    id: 'laranja',
    name: 'Laranja',
    visual: { kind: 'emoji', char: '🍊' },
    short: 'Rica em vitamina C',
    explain: 'A laranja é famosa pela vitamina C, que ajuda seu corpo a se defender de gripes e resfriados!',
  },
  {
    id: 'melancia',
    name: 'Melancia',
    visual: { kind: 'emoji', char: '🍉' },
    short: 'Muita água, hidrata',
    explain: 'A melancia tem mais de 90% de água, então ela ajuda a manter seu corpo hidratado em dias quentes!',
  },
  {
    id: 'manga',
    name: 'Manga',
    visual: { kind: 'emoji', char: '🥭' },
    short: 'Boa para a visão',
    explain: 'A manga é rica em vitamina A, que cuida da sua visão e deixa a pele saudável!',
  },
  {
    id: 'melao',
    name: 'Melão',
    visual: { kind: 'emoji', char: '🍈' },
    short: 'Hidrata e dá energia',
    explain: 'O melão tem bastante água e potássio, que ajudam seus músculos a funcionar bem!',
  },
  {
    id: 'pera',
    name: 'Pera',
    visual: { kind: 'emoji', char: '🍐' },
    short: 'Rica em fibras',
    explain: 'A pera tem muitas fibras que ajudam a digestão e deixam você satisfeito por mais tempo!',
  },
  {
    id: 'kiwi',
    name: 'Kiwi',
    visual: { kind: 'emoji', char: '🥝' },
    short: 'Mais vitamina C que a laranja',
    explain: 'O kiwi tem até mais vitamina C que a laranja e ajuda a fortalecer suas defesas!',
  },
  {
    id: 'limao',
    name: 'Limão',
    visual: { kind: 'emoji', char: '🍋' },
    short: 'Ajuda a absorver ferro',
    explain: 'O limão é rico em vitamina C e ajuda seu corpo a absorver melhor o ferro dos alimentos!',
  },
  {
    id: 'pessego',
    name: 'Pêssego',
    visual: { kind: 'emoji', char: '🍑' },
    short: 'Vitaminas A e C',
    explain: 'O pêssego tem vitaminas A e C, que cuidam da sua pele e fortalecem suas defesas!',
  },
  {
    id: 'coco',
    name: 'Coco',
    visual: { kind: 'emoji', char: '🥥' },
    short: 'Energia com gorduras boas',
    explain: 'O coco tem gorduras boas que dão energia para você brincar o dia inteiro!',
  },
  {
    id: 'mirtilo',
    name: 'Mirtilo',
    visual: { kind: 'emoji', char: '🫐' },
    short: 'Protege o cérebro',
    explain: 'O mirtilo é cheio de antioxidantes que ajudam a proteger o cérebro e a memória!',
  },
];

const TOTAL_PHASES = 8;
const PAIRS_PER_PHASE = 9; // 9 combinações = 18 cartas por fase

interface Card {
  cardId: string;
  pairId: string;
  kind: 'food' | 'fact';
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildPhaseRound(): { pairs: Fruit[]; deck: Card[] } {
  const pairs = shuffle(POOL).slice(0, PAIRS_PER_PHASE);
  const deck = shuffle(
    pairs.flatMap((p) => [
      { cardId: `${p.id}-food`, pairId: p.id, kind: 'food' as const },
      { cardId: `${p.id}-fact`, pairId: p.id, kind: 'fact' as const },
    ])
  );
  return { pairs, deck };
}

function starsFor(moves: number, totalPairs: number): 1 | 2 | 3 {
  if (moves <= totalPairs * 1.5) return 3;
  if (moves <= totalPairs * 2.5) return 2;
  return 1;
}

function FruitVisual({ visual, className }: { visual: Visual; className: string }) {
  if (visual.kind === 'img') {
    return (
      <img
        src={visual.src}
        alt=""
        draggable={false}
        style={{ imageRendering: 'pixelated' }}
        className={className}
      />
    );
  }
  return <span className={`${className} flex items-center justify-center leading-none`}>{visual.char}</span>;
}

export function MemoriaNutritiva() {
  const { finishGame } = useGameProgress(10);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState(1);
  const [round, setRound] = useState(buildPhaseRound);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Fruit | null>(null);
  const [movesThisPhase, setMovesThisPhase] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [phaseDone, setPhaseDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pairs, deck } = round;
  const isPhaseComplete = matched.size === PAIRS_PER_PHASE;

  const pairsById = useMemo(() => new Map(pairs.map((p) => [p.id, p])), [pairs]);

  useEffect(() => {
    if (isPhaseComplete && !phaseDone) {
      const t = setTimeout(() => {
        setTotalMoves((m) => m + movesThisPhase);
        setPhaseDone(true);
        if (phase < TOTAL_PHASES) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
      }, 900);
      return () => clearTimeout(t);
    }
  }, [isPhaseComplete, phaseDone, movesThisPhase, phase]);

  useEffect(() => {
    if (phaseDone && phase >= TOTAL_PHASES && !finished) {
      setFinished(true);
    }
  }, [phaseDone, phase, finished]);

  useEffect(() => {
    if (finished && !saved) {
      setSaved(true);
      finishGame({
        score: Math.max(220 * TOTAL_PHASES - totalMoves * 5, 20),
        stars: starsFor(totalMoves, PAIRS_PER_PHASE * TOTAL_PHASES),
        completed: true,
      });
    }
  }, [finished, saved, totalMoves, finishGame]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const handleFlip = (card: Card) => {
    if (locked || flipped.includes(card.cardId) || matched.has(card.pairId)) return;
    if (flipped.length === 2) return;

    const nextFlipped = [...flipped, card.cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      setMovesThisPhase((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const first = deck.find((c) => c.cardId === firstId)!;
      const second = deck.find((c) => c.cardId === secondId)!;

      if (first.pairId === second.pairId) {
        setTimeout(() => {
          setMatched((prev) => new Set(prev).add(first.pairId));
          setFlipped([]);
          setLocked(false);

          const fruit = pairsById.get(first.pairId) ?? null;
          if (toastTimer.current) clearTimeout(toastTimer.current);
          setToast(fruit);
          toastTimer.current = setTimeout(() => setToast(null), 3200);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  const startPhase = (n: number) => {
    setPhase(n);
    setRound(buildPhaseRound());
    setFlipped([]);
    setMatched(new Set());
    setToast(null);
    setMovesThisPhase(0);
    setLocked(false);
    setPhaseDone(false);
  };

  const handleBegin = () => {
    setStarted(true);
    startPhase(1);
  };

  const handleNextPhase = () => {
    startPhase(phase + 1);
  };

  const handleRestartAll = () => {
    setStarted(true);
    setTotalMoves(0);
    setFinished(false);
    setSaved(false);
    startPhase(1);
  };

  // Tela inicial
  if (!started) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="text-7xl mb-4">🧠</div>
          <h2 className="text-3xl font-extrabold text-indigo-900 mb-2">Memória Nutritiva</h2>
          <p className="text-indigo-900/70 font-semibold mb-1">
            8 fases · 9 combinações de fruta + benefício por fase
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Encontre os pares e descubra o superpoder nutricional de cada fruta!
          </p>
          <button
            onClick={handleBegin}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Começar Fase 1 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  // Resultado final (depois da fase 8)
  if (finished) {
    return (
      <ResultsScreen
        emoji="🏆"
        title="Todas as Fases Completas!"
        scoreLabel={`Você passou pelas ${TOTAL_PHASES} fases com ${totalMoves} tentativas no total`}
        stars={starsFor(totalMoves, PAIRS_PER_PHASE * TOTAL_PHASES)}
        accentGradient="from-indigo-500 to-indigo-700"
        onRestart={handleRestartAll}
        restartLabel="Jogar Todas as Fases de Novo 🔄"
      />
    );
  }

  // Interstício entre fases
  if (phaseDone) {
    const stars = starsFor(movesThisPhase, PAIRS_PER_PHASE);
    return (
      <div className="flex items-center justify-center h-full p-8 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-extrabold text-indigo-900 mb-2">Fase {phase} Completa!</h2>
          <p className="text-gray-600 mb-4">{movesThisPhase} tentativas para achar os {PAIRS_PER_PHASE} pares</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((n) => (
              <motion.span
                key={n}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: n * 0.15, type: 'spring', stiffness: 250 }}
                className="text-5xl"
              >
                {n <= stars ? '⭐' : '☆'}
              </motion.span>
            ))}
          </div>
          <button
            onClick={handleNextPhase}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Fase {phase + 1} de {TOTAL_PHASES} ➡️
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 sm:p-8 overflow-auto bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h2 className="text-2xl font-extrabold text-indigo-900">🧠 Fase {phase} de {TOTAL_PHASES}</h2>
          <div className="flex gap-2">
            <div className="bg-white px-4 py-1.5 rounded-full border-2 border-indigo-200 shadow-sm">
              <span className="text-indigo-800 font-extrabold text-sm">
                ⭐ {matched.size}/{PAIRS_PER_PHASE} pares
              </span>
            </div>
            <div className="bg-white px-4 py-1.5 rounded-full border-2 border-purple-200 shadow-sm">
              <span className="text-purple-800 font-extrabold text-sm">🎯 {movesThisPhase} tentativas</span>
            </div>
          </div>
        </div>
        {/* Progresso das fases */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: TOTAL_PHASES }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`h-2 rounded-full transition-all ${
                n < phase ? 'w-6 bg-green-400' : n === phase ? 'w-8 bg-indigo-500' : 'w-6 bg-indigo-100'
              }`}
            />
          ))}
        </div>
        <p className="text-indigo-900/60 font-semibold text-center mb-5">
          Combine cada fruta com o seu superpoder nutricional!
        </p>

        {/* Explicação ao acertar um par */}
        <div className="min-h-[4.5rem] mb-3 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-5 py-2.5 shadow-lg border-2 border-green-300 max-w-xl"
              >
                <FruitVisual visual={toast.visual} className="w-10 h-10 sm:w-11 sm:h-11 text-3xl shrink-0 select-none" />
                <span className="text-sm sm:text-[15px] leading-snug">
                  <span className="font-extrabold text-gray-800">✅ {toast.name}: </span>
                  <span className="text-gray-700">{toast.explain}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grade de cartas */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {deck.map((card) => {
            const fruit = pairsById.get(card.pairId)!;
            const isFaceUp = flipped.includes(card.cardId) || matched.has(card.pairId);
            const isMatched = matched.has(card.pairId);
            return (
              <div key={card.cardId} className="aspect-[4/5]" style={{ perspective: 1000 }}>
                <motion.button
                  onClick={() => handleFlip(card)}
                  animate={{ rotateY: isFaceUp ? 180 : 0, scale: isMatched ? [1, 1.08, 1] : 1 }}
                  transition={{ rotateY: { duration: 0.4 }, scale: { duration: 0.35 } }}
                  style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
                  className="relative"
                  disabled={isMatched}
                >
                  {/* Verso (fechada) */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      backgroundImage:
                        'radial-gradient(circle at 8px 8px, rgba(255,255,255,0.18) 2.5px, transparent 3px)',
                      backgroundSize: '22px 22px',
                    }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white/40 shadow-lg flex items-center justify-center"
                  >
                    <span className="text-3xl sm:text-4xl drop-shadow-md">❓</span>
                  </div>

                  {/* Frente (conteúdo) */}
                  <div
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    className={`absolute inset-0 rounded-2xl shadow-lg border-4 flex flex-col items-center justify-center gap-1 p-2 ${
                      isMatched
                        ? 'bg-green-50 border-green-400'
                        : card.kind === 'food'
                        ? 'bg-amber-50 border-orange-300'
                        : 'bg-purple-50 border-purple-300'
                    }`}
                  >
                    {card.kind === 'food' ? (
                      <>
                        <FruitVisual
                          visual={fruit.visual}
                          className="w-10 h-10 sm:w-14 sm:h-14 text-4xl sm:text-5xl select-none"
                        />
                        <span className="text-xs sm:text-sm font-extrabold text-gray-800 leading-tight text-center">
                          {fruit.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg sm:text-xl">💡</span>
                        <span className="text-[11px] sm:text-xs font-extrabold text-purple-900 leading-snug text-center">
                          {fruit.short}
                        </span>
                      </>
                    )}
                    {isMatched && (
                      <span className="absolute -top-2.5 -right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-500 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center shadow-md border-2 border-white">
                        ✓
                      </span>
                    )}
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
