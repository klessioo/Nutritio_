import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ResultsScreen } from './shared/results-screen';
import { useGameProgress } from '../../lib/hooks/use-game-progress';

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
}

interface Recipe {
  name: string;
  emoji: string;
  steps: Ingredient[];
}

const INGREDIENT_POOL: Ingredient[] = [
  { id: 'banana', name: 'Banana', emoji: '🍌' },
  { id: 'maca', name: 'Maçã', emoji: '🍎' },
  { id: 'uva', name: 'Uva', emoji: '🍇' },
  { id: 'granola', name: 'Granola', emoji: '🥣' },
  { id: 'espinafre', name: 'Espinafre', emoji: '🥬' },
  { id: 'leite', name: 'Leite', emoji: '🥛' },
  { id: 'mel', name: 'Mel', emoji: '🍯' },
  { id: 'pao', name: 'Pão Integral', emoji: '🍞' },
  { id: 'alface', name: 'Alface', emoji: '🥬' },
  { id: 'tomate', name: 'Tomate', emoji: '🍅' },
  { id: 'queijo', name: 'Queijo', emoji: '🧀' },
  { id: 'laranja', name: 'Laranja', emoji: '🍊' },
  { id: 'cenoura', name: 'Cenoura', emoji: '🥕' },
  { id: 'gengibre', name: 'Gengibre', emoji: '🫚' },
  { id: 'agua', name: 'Água', emoji: '💧' },
];

function findIngredient(id: string): Ingredient {
  return INGREDIENT_POOL.find((i) => i.id === id)!;
}

const RECIPES: Recipe[] = [
  {
    name: 'Salada de Frutas',
    emoji: '🥗',
    steps: ['banana', 'maca', 'uva', 'granola'].map(findIngredient),
  },
  {
    name: 'Vitamina Verde',
    emoji: '🥤',
    steps: ['banana', 'espinafre', 'leite', 'mel'].map(findIngredient),
  },
  {
    name: 'Sanduíche Natural',
    emoji: '🥪',
    steps: ['pao', 'alface', 'tomate', 'queijo'].map(findIngredient),
  },
  {
    name: 'Suco Detox',
    emoji: '🧃',
    steps: ['laranja', 'cenoura', 'gengibre', 'agua'].map(findIngredient),
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildTray(recipe: Recipe): Ingredient[] {
  const distractors = shuffle(INGREDIENT_POOL.filter((i) => !recipe.steps.includes(i))).slice(0, 3);
  return shuffle([...recipe.steps, ...distractors]);
}

export function ChefSaudavel() {
  const { finishGame } = useGameProgress(8);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [tray, setTray] = useState<Ingredient[]>(() => buildTray(RECIPES[0]));
  const [stepIndex, setStepIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const recipe = RECIPES[recipeIndex];

  const handlePick = (ingredient: Ingredient) => {
    if (feedback) return;
    setLastPicked(ingredient.id);

    if (ingredient.id === recipe.steps[stepIndex].id) {
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        setLastPicked(null);
        if (stepIndex + 1 < recipe.steps.length) {
          setStepIndex(stepIndex + 1);
        } else if (recipeIndex + 1 < RECIPES.length) {
          const nextIndex = recipeIndex + 1;
          setRecipeIndex(nextIndex);
          setTray(buildTray(RECIPES[nextIndex]));
          setStepIndex(0);
        } else {
          const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
          finishGame({ score: RECIPES.length * 40 - mistakes * 5, stars: stars as 1 | 2 | 3, completed: true });
          setFinished(true);
        }
      }, 500);
    } else {
      setFeedback('wrong');
      setMistakes((m) => m + 1);
      setTimeout(() => {
        setFeedback(null);
        setLastPicked(null);
      }, 500);
    }
  };

  const handleRestart = () => {
    setRecipeIndex(0);
    setTray(buildTray(RECIPES[0]));
    setStepIndex(0);
    setMistakes(0);
    setFeedback(null);
    setLastPicked(null);
    setFinished(false);
  };

  if (finished) {
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    return (
      <ResultsScreen
        emoji="👨‍🍳"
        title="Receitas Concluídas!"
        scoreLabel={`Você preparou ${RECIPES.length} receitas saudáveis`}
        detailLabel={mistakes === 0 ? 'Sem nenhum erro — perfeito!' : `${mistakes} tentativa(s) incorreta(s)`}
        stars={stars as 1 | 2 | 3}
        accentGradient="from-teal-500 to-teal-700"
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="h-full p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-1">
            Receita {recipeIndex + 1} de {RECIPES.length}
          </div>
          <div className="text-6xl mb-2">{recipe.emoji}</div>
          <h2 className="text-3xl font-bold text-gray-800">{recipe.name}</h2>
          <p className="text-gray-600 mt-2">Escolha os ingredientes na ordem certa da receita</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {recipe.steps.map((step, i) => (
            <div
              key={step.id}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-4 transition-all ${
                i < stepIndex
                  ? 'bg-green-100 border-green-400'
                  : i === stepIndex
                  ? 'bg-teal-50 border-teal-400 scale-110 shadow-lg'
                  : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              {i < stepIndex ? step.emoji : i === stepIndex ? '❓' : ''}
            </div>
          ))}
        </div>

        {/* Ingredient tray */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {tray.map((ingredient) => {
              const isPicked = lastPicked === ingredient.id;
              return (
                <motion.button
                  key={ingredient.id}
                  whileHover={!feedback ? { scale: 1.05 } : {}}
                  whileTap={!feedback ? { scale: 0.95 } : {}}
                  onClick={() => handlePick(ingredient)}
                  disabled={!!feedback}
                  className={`relative p-5 rounded-2xl border-4 transition-all ${
                    isPicked && feedback === 'correct'
                      ? 'bg-green-100 border-green-500'
                      : isPicked && feedback === 'wrong'
                      ? 'bg-red-100 border-red-500'
                      : 'bg-gray-50 border-gray-200 hover:border-teal-400'
                  } disabled:cursor-not-allowed`}
                >
                  <div className="text-4xl mb-1">{ingredient.emoji}</div>
                  <div className="text-xs font-semibold text-gray-700">{ingredient.name}</div>
                  <AnimatePresence>
                    {isPicked && feedback === 'correct' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                      >
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                    {isPicked && feedback === 'wrong' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                      >
                        <XCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
