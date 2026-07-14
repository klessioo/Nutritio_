import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer } from 'lucide-react';

interface Fruit {
  id: number;
  emoji: string;
  name: string;
  benefit: string;
  x: number;
  y: number;
  found: boolean;
}

const fruitsData = [
  { emoji: '🍎', name: 'Maçã', benefit: 'Rica em fibras e vitamina C!' },
  { emoji: '🍌', name: 'Banana', benefit: 'Fonte de potássio e energia!' },
  { emoji: '🍊', name: 'Laranja', benefit: 'Cheia de vitamina C!' },
  { emoji: '🍇', name: 'Uva', benefit: 'Antioxidantes poderosos!' },
  { emoji: '🍓', name: 'Morango', benefit: 'Vitaminas e baixa caloria!' },
  { emoji: '🥝', name: 'Kiwi', benefit: 'Vitamina C e fibras!' },
  { emoji: '🍑', name: 'Pêssego', benefit: 'Vitamina A e hidratação!' },
  { emoji: '🍒', name: 'Cereja', benefit: 'Antioxidantes e anti-inflamatória!' },
];

export function CacaAsFrutas() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);

  useEffect(() => {
    // Inicializar frutas em posições aleatórias
    const initialFruits = fruitsData.map((fruit, index) => ({
      id: index,
      ...fruit,
      x: Math.random() * 80 + 5, // 5-85% da largura
      y: Math.random() * 80 + 5, // 5-85% da altura
      found: false,
    }));
    setFruits(initialFruits);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  const handleFruitClick = (fruit: Fruit) => {
    if (fruit.found || gameOver) return;

    const updatedFruits = fruits.map(f =>
      f.id === fruit.id ? { ...f, found: true } : f
    );
    setFruits(updatedFruits);
    setScore(score + 10);
    setSelectedFruit(fruit);

    // Verificar se todas as frutas foram encontradas
    if (updatedFruits.every(f => f.found)) {
      setGameOver(true);
    }

    // Limpar a mensagem após 3 segundos
    setTimeout(() => setSelectedFruit(null), 3000);
  };

  const handleRestart = () => {
    const initialFruits = fruitsData.map((fruit, index) => ({
      id: index,
      ...fruit,
      x: Math.random() * 80 + 5,
      y: Math.random() * 80 + 5,
      found: false,
    }));
    setFruits(initialFruits);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setSelectedFruit(null);
  };

  const foundCount = fruits.filter(f => f.found).length;
  const totalCount = fruits.length;

  return (
    <div className="h-full relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white via-white to-transparent z-10 p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 px-5 py-3 rounded-2xl border-2 border-green-300">
              <span className="text-green-800 font-bold text-lg">
                🏆 {score} pontos
              </span>
            </div>
            <div className="bg-purple-100 px-5 py-3 rounded-2xl border-2 border-purple-300">
              <span className="text-purple-800 font-bold text-lg">
                🍎 {foundCount}/{totalCount}
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 ${
            timeLeft <= 10 ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'
          }`}>
            <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`} />
            <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-800' : 'text-blue-800'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="h-full bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="text-9xl">🌳🌳🌳🌳🌳🌳🌳🌳</div>
        </div>

        {/* Fruits */}
        <div className="relative h-full">
          {fruits.map((fruit) => (
            <motion.button
              key={fruit.id}
              initial={{ scale: 0 }}
              animate={{ 
                scale: fruit.found ? 0 : 1,
                rotate: fruit.found ? 360 : 0,
              }}
              whileHover={{ scale: fruit.found ? 0 : 1.2 }}
              onClick={() => handleFruitClick(fruit)}
              style={{
                position: 'absolute',
                left: `${fruit.x}%`,
                top: `${fruit.y}%`,
              }}
              className={`text-6xl cursor-pointer transition-all ${
                fruit.found ? 'pointer-events-none' : 'hover:drop-shadow-2xl'
              }`}
            >
              {fruit.emoji}
            </motion.button>
          ))}
        </div>

        {/* Fruit Info Popup */}
        <AnimatePresence>
          {selectedFruit && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-6 shadow-2xl border-4 border-green-300 max-w-md z-20"
            >
              <div className="text-center">
                <div className="text-6xl mb-3">{selectedFruit.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedFruit.name}</h3>
                <p className="text-green-700 font-semibold">{selectedFruit.benefit}</p>
                <div className="text-3xl mt-3">+10 pontos! ⭐</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Screen */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-lg"
            >
              <div className="text-8xl mb-6">
                {foundCount === totalCount ? '🏆' : timeLeft === 0 ? '⏰' : '🎉'}
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                {foundCount === totalCount ? 'Parabéns!' : 'Tempo Esgotado!'}
              </h2>
              <p className="text-2xl text-gray-600 mb-2">
                Você encontrou <span className="font-bold text-green-600">{foundCount}</span> de {totalCount} frutas
              </p>
              <p className="text-xl text-gray-500 mb-8">
                Pontuação: <span className="font-bold">{score}</span> pontos
              </p>
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
              >
                Jogar Novamente 🔄
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
