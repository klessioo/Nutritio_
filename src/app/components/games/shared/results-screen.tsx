import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ResultsScreenProps {
  emoji: string;
  title: string;
  scoreLabel: string;
  detailLabel?: string;
  stars: 0 | 1 | 2 | 3;
  accentGradient?: string;
  onRestart: () => void;
  restartLabel?: string;
}

export function ResultsScreen({
  emoji,
  title,
  scoreLabel,
  detailLabel,
  stars,
  accentGradient = 'from-purple-500 to-purple-700',
  onRestart,
  restartLabel = 'Jogar Novamente 🔄',
}: ResultsScreenProps) {
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (stars >= 2 && !hasCelebrated.current) {
      hasCelebrated.current = true;
      confetti({
        particleCount: stars === 3 ? 140 : 80,
        spread: 75,
        origin: { y: 0.6 },
      });
    }
  }, [stars]);

  return (
    <div className="flex items-center justify-center h-full p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-2xl"
      >
        <div className="text-8xl mb-6">{emoji}</div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-2xl text-gray-600 mb-2">{scoreLabel}</p>
        {detailLabel && <p className="text-lg text-gray-500 mb-4">{detailLabel}</p>}

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
          onClick={onRestart}
          className={`bg-gradient-to-r ${accentGradient} text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105`}
        >
          {restartLabel}
        </button>
      </motion.div>
    </div>
  );
}
