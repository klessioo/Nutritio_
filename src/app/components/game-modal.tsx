import { X, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizNutricao } from './games/quiz-nutricao';
import { PratoEquilibrado } from './games/prato-equilibrado';
import { CacaAsFrutas } from './games/caca-as-frutas';

interface GameModalProps {
  game: {
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
  } | null;
  onClose: () => void;
}

export function GameModal({ game, onClose }: GameModalProps) {
  if (!game) return null;

  // Função para renderizar o jogo correto
  const renderGame = () => {
    switch (game.id) {
      case 2: // Prato Equilibrado
        return <PratoEquilibrado />;
      case 3: // Caça às Frutas
        return <CacaAsFrutas />;
      case 5: // Quiz da Nutrição
        return <QuizNutricao />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">{game.icon}</div>
              <p className="text-gray-600">Jogo em desenvolvimento...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${game.color} p-6 text-white relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {game.icon}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{game.title}</h2>
                <p className="text-white/90">{game.description}</p>
              </div>
            </div>
            {/* Score Bar */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">0 pontos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Star className="w-5 h-5" />
                <span className="font-bold">0/3 estrelas</span>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
            {renderGame()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}