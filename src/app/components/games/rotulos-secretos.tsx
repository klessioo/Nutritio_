import { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { ResultsScreen } from './shared/results-screen';
import { useGameProgress, starsFromRatio } from '../../lib/hooks/use-game-progress';

interface Label {
  id: string;
  product: string;
  emoji: string;
  calories: number;
  sugarG: number;
  sodiumMg: number;
  fatG: number;
  healthy: boolean;
  explanation: string;
}

const LABELS: Label[] = [
  { id: 'suco-caixinha', product: 'Suco de Caixinha', emoji: '🧃', calories: 140, sugarG: 26, sodiumMg: 35, fatG: 0, healthy: false, explanation: 'Tem quase tanto açúcar quanto um refrigerante!' },
  { id: 'iogurte-natural', product: 'Iogurte Natural', emoji: '🥛', calories: 90, sugarG: 6, sodiumMg: 50, fatG: 3, healthy: true, explanation: 'Pouco açúcar e boa fonte de cálcio e proteína.' },
  { id: 'refrigerante', product: 'Refrigerante', emoji: '🥤', calories: 150, sugarG: 39, sodiumMg: 20, fatG: 0, healthy: false, explanation: 'Extremamente rico em açúcar, quase sem nutrientes.' },
  { id: 'barra-cereal', product: 'Barra de Cereal Integral', emoji: '🍫', calories: 110, sugarG: 5, sodiumMg: 60, fatG: 3, healthy: true, explanation: 'Rica em fibras e com pouco açúcar adicionado.' },
  { id: 'salgadinho', product: 'Salgadinho de Pacote', emoji: '🍟', calories: 160, sugarG: 1, sodiumMg: 320, fatG: 11, healthy: false, explanation: 'Sódio e gordura muito altos para uma porção pequena.' },
  { id: 'agua-coco', product: 'Água de Coco', emoji: '🥥', calories: 45, sugarG: 6, sodiumMg: 60, fatG: 0, healthy: true, explanation: 'Hidrata bem, com pouco açúcar e poucas calorias.' },
  { id: 'achocolatado', product: 'Achocolatado', emoji: '🍫', calories: 180, sugarG: 27, sodiumMg: 140, fatG: 6, healthy: false, explanation: 'Muito açúcar adicionado em uma única porção.' },
  { id: 'pao-integral', product: 'Pão Integral', emoji: '🍞', calories: 80, sugarG: 2, sodiumMg: 150, fatG: 1, healthy: true, explanation: 'Fibras que ajudam a digestão, com pouco açúcar.' },
  { id: 'macarrao-instantaneo', product: 'Macarrão Instantâneo', emoji: '🍜', calories: 380, sugarG: 2, sodiumMg: 860, fatG: 14, healthy: false, explanation: 'Sódio altíssimo — bem acima do recomendado por porção.' },
  { id: 'castanhas', product: 'Mix de Castanhas', emoji: '🥜', calories: 170, sugarG: 1, sodiumMg: 5, fatG: 15, healthy: true, explanation: 'Gorduras boas para o coração, sem açúcar adicionado.' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const SWIPE_THRESHOLD = 100;

export function RotulosSecretos() {
  const { finishGame } = useGameProgress(7);
  const [deck] = useState<Label[]>(() => shuffle(LABELS));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [exitDir, setExitDir] = useState<'left' | 'right'>('right');
  const [finished, setFinished] = useState(false);

  const label = deck[index];

  const handleAnswer = (saysHealthy: boolean) => {
    if (feedback) return;
    setExitDir(saysHealthy ? 'right' : 'left');
    const isCorrect = saysHealthy === label.healthy;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 < deck.length) {
        setIndex(index + 1);
      } else {
        finishGame({ score: (isCorrect ? score + 1 : score) * 10, stars: starsFromRatio((isCorrect ? score + 1 : score) / deck.length), completed: true });
        setFinished(true);
      }
    }, 1400);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) handleAnswer(true);
    else if (info.offset.x < -SWIPE_THRESHOLD) handleAnswer(false);
  };

  const handleRestart = () => {
    setIndex(0);
    setScore(0);
    setFeedback(null);
    setFinished(false);
  };

  if (finished) {
    return (
      <ResultsScreen
        emoji={score === deck.length ? '🕵️‍♂️🏆' : '🕵️'}
        title="Investigação Concluída!"
        scoreLabel={`Você acertou ${score} de ${deck.length} rótulos`}
        stars={starsFromRatio(score / deck.length)}
        accentGradient="from-pink-500 to-pink-700"
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Rótulos Secretos 🔍</h2>
          <p className="text-gray-600 text-sm mt-1">
            Card {index + 1} de {deck.length} · Acertos: {score}
          </p>
        </div>

        <div className="relative h-[420px]">
          <AnimatePresence mode="wait">
            {label && (
              <motion.div
                key={label.id}
                drag={!feedback ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.9, opacity: 0, x: 0 }}
                animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
                exit={{
                  x: exitDir === 'right' ? 300 : -300,
                  rotate: exitDir === 'right' ? 15 : -15,
                  opacity: 0,
                }}
                className="absolute inset-0 bg-white rounded-3xl shadow-2xl border-4 border-gray-100 p-6 cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{label.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-800">{label.product}</h3>
                  <p className="text-xs text-gray-400">Informação Nutricional (por porção)</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600 text-sm">Calorias</span>
                    <span className="font-bold text-gray-800">{label.calories} kcal</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600 text-sm">Açúcares</span>
                    <span className="font-bold text-gray-800">{label.sugarG} g</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600 text-sm">Sódio</span>
                    <span className="font-bold text-gray-800">{label.sodiumMg} mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Gorduras</span>
                    <span className="font-bold text-gray-800">{label.fatG} g</span>
                  </div>
                </div>

                {feedback ? (
                  <div
                    className={`text-center p-3 rounded-2xl ${
                      feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <p className="font-bold">
                      {feedback === 'correct' ? '✅ Correto!' : `❌ Este produto é ${label.healthy ? 'saudável' : 'não saudável'}`}
                    </p>
                    <p className="text-xs mt-1">{label.explanation}</p>
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-400">Arraste o card ou use os botões abaixo</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <button
            onClick={() => handleAnswer(false)}
            disabled={!!feedback}
            className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-red-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            <ThumbsDown className="w-5 h-5" />
            Não Saudável
          </button>
          <button
            onClick={() => handleAnswer(true)}
            disabled={!!feedback}
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            <ThumbsUp className="w-5 h-5" />
            Saudável
          </button>
        </div>
      </div>
    </div>
  );
}
