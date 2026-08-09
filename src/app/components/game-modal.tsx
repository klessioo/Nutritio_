import { lazy, Suspense } from 'react';
import { X, Trophy, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizNutricao } from './games/quiz-nutricao';
import { ChefSaudavel } from './games/chef-saudavel';
import { HortaMagica } from './games/horta-magica';
import { MemoriaNutritiva } from './games/memoria-nutritiva';
import { PiramideAlimentar } from './games/piramide-alimentar';
import { RotulosSecretos } from './games/rotulos-secretos';
import { CorridaDasFrutas } from './games/racer/corrida-das-frutas';
import { useSession } from '../lib/session-context';

// Jogos baseados em Phaser são carregados sob demanda (lazy) para não pesar
// o carregamento inicial do site — o Phaser (~1MB) só baixa ao abrir o jogo.
const CacaAsFrutasPhaser = lazy(() =>
  import('./games/phaser/caca-as-frutas-phaser').then((m) => ({ default: m.CacaAsFrutasPhaser }))
);
const MissaoSupermercado = lazy(() =>
  import('./games/phaser/missao-supermercado-phaser').then((m) => ({ default: m.MissaoSupermercado }))
);
const PratoEquilibrado = lazy(() =>
  import('./games/phaser/prato-equilibrado-phaser').then((m) => ({ default: m.PratoEquilibrado }))
);

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
  const { progress } = useSession();
  if (!game) return null;

  const gameProgress = progress[game.id];

  // Função para renderizar o jogo correto
  const renderGame = () => {
    switch (game.id) {
      case 1: // Missão Supermercado
        return <MissaoSupermercado />;
      case 2: // Prato Equilibrado
        return <PratoEquilibrado />;
      case 3: // Caça às Frutas (Phaser)
        return <CacaAsFrutasPhaser />;
      case 4: // Horta Mágica
        return <HortaMagica />;
      case 5: // Quiz da Nutrição
        return <QuizNutricao />;
      case 6: // Pirâmide Alimentar
        return <PiramideAlimentar />;
      case 7: // Rótulos Secretos
        return <RotulosSecretos />;
      case 8: // Chef Saudável
        return <ChefSaudavel />;
      case 9: // Corrida das Frutas (pseudo-3D estilo OutRun)
        return <CorridaDasFrutas />;
      case 10: // Memória Nutritiva
        return <MemoriaNutritiva />;
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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden"
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
                <span className="font-bold">Recorde: {gameProgress?.bestScore ?? 0} pontos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Star className="w-5 h-5" />
                <span className="font-bold">{gameProgress?.stars ?? 0}/3 estrelas</span>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Carregando jogo...</p>
                  </div>
                </div>
              }
            >
              {renderGame()}
            </Suspense>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}