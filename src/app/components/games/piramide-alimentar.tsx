import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ResultsScreen } from './shared/results-screen';
import { useGameProgress } from '../../lib/hooks/use-game-progress';

type TierId = 'base' | 'vegetais-frutas' | 'proteinas' | 'topo';

interface FoodChip {
  id: string;
  name: string;
  emoji: string;
  tier: TierId;
}

interface Tier {
  id: TierId;
  label: string;
  hint: string;
  widthPct: number;
  gradient: string;
}

const TIERS: Tier[] = [
  { id: 'topo', label: 'Gorduras e Doces', hint: 'Consuma com moderação', widthPct: 35, gradient: 'from-red-400 to-red-500' },
  { id: 'proteinas', label: 'Proteínas e Laticínios', hint: 'Todos os dias, porções médias', widthPct: 55, gradient: 'from-orange-400 to-orange-500' },
  { id: 'vegetais-frutas', label: 'Vegetais e Frutas', hint: 'Várias porções por dia', widthPct: 75, gradient: 'from-green-400 to-green-500' },
  { id: 'base', label: 'Carboidratos e Grãos', hint: 'A base da alimentação diária', widthPct: 95, gradient: 'from-yellow-400 to-yellow-500' },
];

const FOOD_CHIPS: FoodChip[] = [
  { id: 'pao', name: 'Pão', emoji: '🍞', tier: 'base' },
  { id: 'arroz', name: 'Arroz', emoji: '🍚', tier: 'base' },
  { id: 'batata', name: 'Batata', emoji: '🥔', tier: 'base' },
  { id: 'brocolis', name: 'Brócolis', emoji: '🥦', tier: 'vegetais-frutas' },
  { id: 'maca', name: 'Maçã', emoji: '🍎', tier: 'vegetais-frutas' },
  { id: 'cenoura', name: 'Cenoura', emoji: '🥕', tier: 'vegetais-frutas' },
  { id: 'frango', name: 'Frango', emoji: '🍗', tier: 'proteinas' },
  { id: 'leite', name: 'Leite', emoji: '🥛', tier: 'proteinas' },
  { id: 'ovo', name: 'Ovo', emoji: '🥚', tier: 'proteinas' },
  { id: 'bolo', name: 'Bolo', emoji: '🍰', tier: 'topo' },
  { id: 'sorvete', name: 'Sorvete', emoji: '🍦', tier: 'topo' },
  { id: 'refri', name: 'Refrigerante', emoji: '🥤', tier: 'topo' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function DraggableChip({ chip }: { chip: FoodChip }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: chip.id,
    data: chip,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform), zIndex: 50 } : undefined;

  return (
    <motion.button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl px-3 py-2 shadow-md flex items-center gap-2 touch-none ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <span className="text-2xl">{chip.emoji}</span>
      <span className="text-xs font-semibold text-gray-700">{chip.name}</span>
    </motion.button>
  );
}

function TierZone({ tier, placedChips }: { tier: Tier; placedChips: FoodChip[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: tier.id });

  return (
    <div className="flex flex-col items-center">
      <div
        ref={setNodeRef}
        style={{ width: `${tier.widthPct}%` }}
        className={`bg-gradient-to-r ${tier.gradient} rounded-2xl p-4 shadow-lg transition-all border-4 ${
          isOver ? 'border-white scale-[1.02]' : 'border-transparent'
        }`}
      >
        <div className="text-center text-white mb-2">
          <div className="font-bold text-sm">{tier.label}</div>
          <div className="text-xs opacity-90">{tier.hint}</div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center min-h-[2.5rem]">
          {placedChips.map((chip) => (
            <motion.div
              key={chip.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/90 rounded-lg px-2 py-1 flex items-center gap-1"
            >
              <span className="text-lg">{chip.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{chip.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PiramideAlimentar() {
  const { finishGame } = useGameProgress(6);
  const [tray, setTray] = useState<FoodChip[]>(() => shuffle(FOOD_CHIPS));
  const [placed, setPlaced] = useState<Record<TierId, FoodChip[]>>({
    base: [],
    'vegetais-frutas': [],
    proteinas: [],
    topo: [],
  });
  const [mistakes, setMistakes] = useState(0);
  const [wrongPulse, setWrongPulse] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const totalPlaced = Object.values(placed).reduce((sum, arr) => sum + arr.length, 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over) return;
    const chip = active.data.current as FoodChip;
    const targetTier = over.id as TierId;

    if (chip.tier === targetTier) {
      setTray((prev) => prev.filter((c) => c.id !== chip.id));
      setPlaced((prev) => {
        const next = { ...prev, [targetTier]: [...prev[targetTier], chip] };
        const newTotal = Object.values(next).reduce((sum, arr) => sum + arr.length, 0);
        if (newTotal === FOOD_CHIPS.length) {
          setTimeout(() => setFinished(true), 500);
        }
        return next;
      });
    } else {
      setMistakes((m) => m + 1);
      setWrongPulse(true);
      setTimeout(() => setWrongPulse(false), 400);
    }
  };

  const handleRestart = () => {
    setTray(shuffle(FOOD_CHIPS));
    setPlaced({ base: [], 'vegetais-frutas': [], proteinas: [], topo: [] });
    setMistakes(0);
    setFinished(false);
    setSaved(false);
  };

  useEffect(() => {
    if (finished && !saved) {
      setSaved(true);
      const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
      finishGame({ score: FOOD_CHIPS.length * 15 - mistakes * 5, stars: stars as 1 | 2 | 3, completed: true });
    }
  }, [finished, saved, mistakes, finishGame]);

  if (finished) {
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    return (
      <ResultsScreen
        emoji="🔺"
        title="Pirâmide Completa!"
        scoreLabel={`Você organizou os ${FOOD_CHIPS.length} alimentos corretamente`}
        detailLabel={mistakes === 0 ? 'Sem nenhum erro!' : `${mistakes} tentativa(s) na camada errada`}
        stars={stars as 1 | 2 | 3}
        accentGradient="from-blue-500 to-blue-700"
        onRestart={handleRestart}
      />
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Pirâmide Alimentar</h2>
            <p className="text-gray-600">
              Arraste cada alimento para a camada certa da pirâmide ({totalPlaced}/{FOOD_CHIPS.length})
            </p>
          </div>

          {/* Pyramid */}
          <div className="space-y-3 mb-8">
            {TIERS.map((tier) => (
              <TierZone key={tier.id} tier={tier} placedChips={placed[tier.id]} />
            ))}
          </div>

          {/* Tray */}
          <motion.div
            animate={wrongPulse ? { x: [0, -6, 6, -6, 6, 0] } : {}}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            <h3 className="font-bold text-gray-700 mb-4 text-center">Alimentos para Organizar</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {tray.map((chip) => (
                <DraggableChip key={chip.id} chip={chip} />
              ))}
              {tray.length === 0 && (
                <p className="text-gray-400 text-sm">Todos os alimentos foram organizados!</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DndContext>
  );
}
