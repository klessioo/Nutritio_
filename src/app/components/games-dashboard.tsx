import { GameCard } from './game-card';
import { Trophy, Star, Heart, Zap } from 'lucide-react';
import { useState } from 'react';
import { GameModal } from './game-modal';
import { AvatarConfig, AvatarDisplay } from './avatar-creator';

interface GamesDashboardProps {
  userName: string;
  userAvatar?: AvatarConfig;
}

const games = [
  {
    id: 1,
    title: 'Missão Supermercado',
    description: 'Aprenda a escolher alimentos saudáveis no mercado!',
    icon: '🛒',
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    image: 'https://images.unsplash.com/photo-1617817236914-795f5a551eb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcm1hcmtldCUyMHNob3BwaW5nJTIwY2FydHxlbnwxfHx8fDE3Njg5MjM2Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: 'Prato Equilibrado',
    description: 'Monte um prato com todos os grupos alimentares!',
    icon: '🍽️',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    image: 'https://images.unsplash.com/photo-1749280447117-489c36d0e3d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMHBsYXRlJTIwYmFsYW5jZWR8ZW58MXx8fHwxNzY4OTIzNjc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'Caça às Frutas',
    description: 'Encontre as frutas escondidas e aprenda seus benefícios!',
    icon: '🍎',
    color: 'from-red-400 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    image: 'https://images.unsplash.com/photo-1607130813443-243737c21f7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMGNvbG9yZnVsfGVufDF8fHx8MTc2ODkxMTIwNHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    title: 'Horta Mágica',
    description: 'Plante e colha vegetais aprendendo sobre cada um!',
    icon: '🥕',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    image: 'https://images.unsplash.com/photo-1717959159782-98c42b1d4f37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGUlMjBnYXJkZW4lMjBjYXJyb3RzfGVufDF8fHx8MTc2ODkyMzY3OXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    title: 'Quiz da Nutrição',
    description: 'Teste seus conhecimentos sobre alimentação saudável!',
    icon: '🧠',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    image: 'https://images.unsplash.com/photo-1740560052706-fd75ee856b44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb24lMjBmb29kJTIwcXVpenxlbnwxfHx8fDE3Njg5MjM2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 6,
    title: 'Pirâmide Alimentar',
    description: 'Monte a pirâmide e aprenda sobre porções corretas!',
    icon: '🔺',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    image: 'https://images.unsplash.com/photo-1580334571318-a51dfe93f27f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcHlyYW1pZCUyMGhlYWx0aHl8ZW58MXx8fHwxNzY4OTIzNjgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 7,
    title: 'Rótulos Secretos',
    description: 'Desvende os segredos dos rótulos dos alimentos!',
    icon: '🔍',
    color: 'from-pink-400 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    image: 'https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwbGFiZWwlMjBudXRyaXRpb258ZW58MXx8fHwxNzY4OTIzNjgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 8,
    title: 'Chef Saudável',
    description: 'Prepare receitas deliciosas e nutritivas!',
    icon: '👨‍🍳',
    color: 'from-teal-400 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    image: 'https://images.unsplash.com/photo-1656711843820-f352e49714ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc2ODkyMzY4MHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function GamesDashboard({ userName, userAvatar }: GamesDashboardProps) {
  const [selectedGame, setSelectedGame] = useState<{
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
  } | null>(null);

  const handlePlayGame = (game: { id: number; title: string; description: string; icon: string; color: string }) => {
    setSelectedGame(game);
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Player Profile Card with Avatar and Stamina */}
      {userAvatar && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-purple-200">
          <div className="flex items-center gap-6">
            {/* Avatar Display */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-purple-300 bg-gradient-to-br from-purple-100 to-pink-100">
                <AvatarDisplay config={userAvatar} size={128} />
              </div>
            </div>

            {/* Player Info and Stats */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{userName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online agora
                </p>
              </div>

              {/* Stamina Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-bold text-gray-700">Energia</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">100/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 h-full rounded-full transition-all duration-500 animate-pulse"
                    style={{ width: '100%' }}
                  >
                    <div className="h-full w-full bg-gradient-to-t from-transparent to-white/30"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⚡ Energia completa! Jogue para ganhar XP
                </p>
              </div>

              {/* Health Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-bold text-gray-700">Vida</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">5/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  >
                    <div className="h-full w-full bg-gradient-to-t from-transparent to-white/30"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Badge */}
            <div className="flex-shrink-0 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-4 border-yellow-300">
                <div>
                  <div className="text-xs font-semibold text-white opacity-80">NÍVEL</div>
                  <div className="text-3xl font-bold text-white">1</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">XP: 0/100</div>
                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 md:p-10 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Olá, {userName}! 👋
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              Escolha um jogo e comece a aprender sobre alimentação saudável!
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <p className="text-sm font-semibold">Pontos</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Star className="w-8 h-8 text-yellow-300" />
              </div>
              <p className="text-sm font-semibold">Estrelas</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">🎮</span>
          Jogos Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} {...game} onPlay={handlePlayGame} />
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Seu Progresso</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Jogos Completados</span>
              <span className="font-semibold text-gray-800">0/8</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                style={{ width: '0%' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 rounded-2xl p-4 text-center border-2 border-green-200">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-2xl font-bold text-green-700">0</div>
              <div className="text-xs text-gray-600">Acertos</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-center border-2 border-blue-200">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-2xl font-bold text-blue-700">0h</div>
              <div className="text-xs text-gray-600">Tempo Jogado</div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4 text-center border-2 border-yellow-200">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-2xl font-bold text-yellow-700">0</div>
              <div className="text-xs text-gray-600">Conquistas</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center border-2 border-purple-200">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-2xl font-bold text-purple-700">0%</div>
              <div className="text-xs text-gray-600">Evolução</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <GameModal game={selectedGame} onClose={handleCloseGame} />
      )}
    </div>
  );
}