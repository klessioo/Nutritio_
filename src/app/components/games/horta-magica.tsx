import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout } from 'lucide-react';
import { ResultsScreen } from './shared/results-screen';
import { useGameProgress } from '../../lib/hooks/use-game-progress';

interface Vegetable {
  id: string;
  name: string;
  emoji: string;
  fact: string;
}

const VEGETABLES: Vegetable[] = [
  { id: 'cenoura', name: 'Cenoura', emoji: '🥕', fact: 'Rica em vitamina A, ótima para a visão!' },
  { id: 'tomate', name: 'Tomate', emoji: '🍅', fact: 'Cheio de licopeno, um poderoso antioxidante!' },
  { id: 'alface', name: 'Alface', emoji: '🥬', fact: 'Leve, cheia de água e fibras para a digestão!' },
  { id: 'milho', name: 'Milho', emoji: '🌽', fact: 'Boa fonte de energia e fibras!' },
  { id: 'pimentao', name: 'Pimentão', emoji: '🫑', fact: 'Tem mais vitamina C que a laranja!' },
  { id: 'batata-doce', name: 'Batata-doce', emoji: '🍠', fact: 'Carboidrato saudável cheio de vitamina A!' },
  { id: 'rabanete', name: 'Rabanete', emoji: '🔴', fact: 'Cresce rápido e é rico em vitamina C!' },
  { id: 'abobrinha', name: 'Abobrinha', emoji: '🥒', fact: 'Baixa caloria e rica em água e potássio!' },
];

type Stage = 'empty' | 'seed' | 'sprout' | 'grown';

interface Bed {
  stage: Stage;
  vegetable: Vegetable | null;
}

const BED_COUNT = 4;
const ACTIONS_BUDGET = 32;
const HARVEST_TARGET = 6;

function emptyBeds(): Bed[] {
  return Array.from({ length: BED_COUNT }, () => ({ stage: 'empty', vegetable: null }));
}

function starsForHarvests(count: number): 0 | 1 | 2 | 3 {
  if (count >= HARVEST_TARGET) return 3;
  if (count >= 4) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function HortaMagica() {
  const { finishGame } = useGameProgress(4);
  const [started, setStarted] = useState(false);
  const [beds, setBeds] = useState<Bed[]>(emptyBeds);
  const [actionsLeft, setActionsLeft] = useState(ACTIONS_BUDGET);
  const [harvestCount, setHarvestCount] = useState(0);
  const [lastHarvested, setLastHarvested] = useState<Vegetable | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [saved, setSaved] = useState(false);

  const spendAction = () => {
    setActionsLeft((prev) => {
      const next = prev - 1;
      if (next <= 0) setTimeout(() => setGameOver(true), 400);
      return next;
    });
  };

  const handlePlant = (index: number) => {
    if (actionsLeft <= 0 || gameOver) return;
    const vegetable = VEGETABLES[Math.floor(Math.random() * VEGETABLES.length)];
    setBeds((prev) => prev.map((b, i) => (i === index ? { stage: 'seed', vegetable } : b)));
    spendAction();
  };

  const handleWater = (index: number) => {
    if (actionsLeft <= 0 || gameOver) return;
    setBeds((prev) =>
      prev.map((b, i) => {
        if (i !== index) return b;
        if (b.stage === 'seed') return { ...b, stage: 'sprout' };
        if (b.stage === 'sprout') return { ...b, stage: 'grown' };
        return b;
      })
    );
    spendAction();
  };

  const handleHarvest = (index: number) => {
    if (actionsLeft <= 0 || gameOver) return;
    const bed = beds[index];
    if (bed.stage !== 'grown' || !bed.vegetable) return;

    setLastHarvested(bed.vegetable);
    setTimeout(() => setLastHarvested(null), 2800);
    setBeds((prev) => prev.map((b, i) => (i === index ? { stage: 'empty', vegetable: null } : b)));
    setHarvestCount((c) => {
      const next = c + 1;
      if (next >= HARVEST_TARGET) setTimeout(() => setGameOver(true), 400);
      return next;
    });
    spendAction();
  };

  useEffect(() => {
    if (gameOver && !saved) {
      setSaved(true);
      finishGame({ score: harvestCount * 20, stars: starsForHarvests(harvestCount), completed: true });
    }
  }, [gameOver, saved, harvestCount, finishGame]);

  const handleRestart = () => {
    setBeds(emptyBeds());
    setActionsLeft(ACTIONS_BUDGET);
    setHarvestCount(0);
    setLastHarvested(null);
    setGameOver(false);
    setSaved(false);
    setStarted(false);
  };

  if (!started) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Horta Mágica</h2>
          <p className="text-gray-600 mb-8">
            Plante, regue e colha vegetais nos {BED_COUNT} canteiros! Você tem {ACTIONS_BUDGET} ações — use-as com sabedoria para colher o máximo possível.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Começar a Plantar! 🌾
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <ResultsScreen
        emoji="🌻"
        title={harvestCount >= HARVEST_TARGET ? 'Horta Completa!' : 'Fim das Ações!'}
        scoreLabel={`Você colheu ${harvestCount} vegetais`}
        stars={starsForHarvests(harvestCount)}
        accentGradient="from-yellow-500 to-yellow-700"
        onRestart={handleRestart}
        restartLabel="Plantar de Novo 🔄"
      />
    );
  }

  return (
    <div className="h-full p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="bg-green-100 px-5 py-3 rounded-2xl border-2 border-green-300">
            <span className="text-green-800 font-bold text-lg">🧺 {harvestCount} colhidos</span>
          </div>
          <div className="bg-yellow-100 px-5 py-3 rounded-2xl border-2 border-yellow-300 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-yellow-700" />
            <span className="text-yellow-800 font-bold text-lg">{actionsLeft} ações restantes</span>
          </div>
        </div>

        {/* Garden beds */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {beds.map((bed, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-lg text-center border-4 border-amber-100">
              <motion.div
                key={bed.stage}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl mb-4 h-16 flex items-center justify-center"
              >
                {bed.stage === 'empty' && '🟫'}
                {bed.stage === 'seed' && '🌱'}
                {bed.stage === 'sprout' && '🌿'}
                {bed.stage === 'grown' && bed.vegetable?.emoji}
              </motion.div>

              {bed.stage === 'empty' && (
                <button
                  onClick={() => handlePlant(index)}
                  disabled={actionsLeft <= 0}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Plantar
                </button>
              )}
              {(bed.stage === 'seed' || bed.stage === 'sprout') && (
                <button
                  onClick={() => handleWater(index)}
                  disabled={actionsLeft <= 0}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Regar 💧
                </button>
              )}
              {bed.stage === 'grown' && (
                <button
                  onClick={() => handleHarvest(index)}
                  disabled={actionsLeft <= 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Colher 🧺
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Harvest fact popup */}
      <AnimatePresence>
        {lastHarvested && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-3xl p-6 shadow-2xl border-4 border-yellow-300 max-w-md z-20"
          >
            <div className="text-center">
              <div className="text-6xl mb-3">{lastHarvested.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{lastHarvested.name}</h3>
              <p className="text-yellow-700 font-semibold">{lastHarvested.fact}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
