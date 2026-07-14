import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  category: 'protein' | 'carb' | 'vegetable' | 'fruit';
}

const availableFoods: FoodItem[] = [
  { id: '1', name: 'Frango', emoji: '🍗', category: 'protein' },
  { id: '2', name: 'Arroz', emoji: '🍚', category: 'carb' },
  { id: '3', name: 'Feijão', emoji: '🫘', category: 'protein' },
  { id: '4', name: 'Brócolis', emoji: '🥦', category: 'vegetable' },
  { id: '5', name: 'Cenoura', emoji: '🥕', category: 'vegetable' },
  { id: '6', name: 'Maçã', emoji: '🍎', category: 'fruit' },
  { id: '7', name: 'Banana', emoji: '🍌', category: 'fruit' },
  { id: '8', name: 'Peixe', emoji: '🐟', category: 'protein' },
  { id: '9', name: 'Batata', emoji: '🥔', category: 'carb' },
  { id: '10', name: 'Tomate', emoji: '🍅', category: 'vegetable' },
  { id: '11', name: 'Laranja', emoji: '🍊', category: 'fruit' },
  { id: '12', name: 'Pão', emoji: '🍞', category: 'carb' },
];

const plateRequirements = {
  protein: { min: 1, max: 2, name: 'Proteína' },
  carb: { min: 1, max: 2, name: 'Carboidrato' },
  vegetable: { min: 2, max: 3, name: 'Vegetais' },
  fruit: { min: 1, max: 2, name: 'Frutas' },
};

export function PratoEquilibrado() {
  const [plate, setPlate] = useState<FoodItem[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isBalanced, setIsBalanced] = useState(false);

  const addToPlate = (food: FoodItem) => {
    if (plate.length < 6) {
      setPlate([...plate, food]);
      setShowFeedback(false);
    }
  };

  const removeFromPlate = (index: number) => {
    setPlate(plate.filter((_, i) => i !== index));
    setShowFeedback(false);
  };

  const checkBalance = () => {
    const counts = {
      protein: plate.filter(f => f.category === 'protein').length,
      carb: plate.filter(f => f.category === 'carb').length,
      vegetable: plate.filter(f => f.category === 'vegetable').length,
      fruit: plate.filter(f => f.category === 'fruit').length,
    };

    const balanced = 
      counts.protein >= plateRequirements.protein.min &&
      counts.carb >= plateRequirements.carb.min &&
      counts.vegetable >= plateRequirements.vegetable.min &&
      counts.fruit >= plateRequirements.fruit.min;

    setIsBalanced(balanced);
    setShowFeedback(true);
  };

  const resetPlate = () => {
    setPlate([]);
    setShowFeedback(false);
    setIsBalanced(false);
  };

  const getCategoryCount = (category: keyof typeof plateRequirements) => {
    return plate.filter(f => f.category === category).length;
  };

  return (
    <div className="h-full p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Monte um Prato Equilibrado!</h2>
          <p className="text-gray-600">Escolha alimentos de todos os grupos para criar uma refeição saudável</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plate Area */}
          <div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Seu Prato</h3>
              
              {/* Plate */}
              <div className="relative w-full aspect-square max-w-md mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                  {plate.length === 0 ? (
                    <p className="text-gray-400 text-center px-8">
                      Clique nos alimentos para adicionar ao prato
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 p-8">
                      {plate.map((food, index) => (
                        <motion.button
                          key={`${food.id}-${index}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => removeFromPlate(index)}
                          className="text-5xl hover:opacity-80 transition-opacity"
                          title={`Remover ${food.name}`}
                        >
                          {food.emoji}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3 mb-6">
                {Object.entries(plateRequirements).map(([key, req]) => {
                  const count = getCategoryCount(key as keyof typeof plateRequirements);
                  const isComplete = count >= req.min;
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="font-semibold text-gray-700">{req.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                          {count}/{req.min}
                        </span>
                        {isComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={checkBalance}
                  disabled={plate.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar Prato ✓
                </button>
                <button
                  onClick={resetPlate}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-2xl font-bold transition-all"
                >
                  Limpar 🔄
                </button>
              </div>

              {/* Feedback */}
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-5 rounded-2xl ${
                    isBalanced
                      ? 'bg-green-100 border-2 border-green-300'
                      : 'bg-orange-100 border-2 border-orange-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{isBalanced ? '🎉' : '💡'}</div>
                    <div>
                      <p className={`font-bold ${isBalanced ? 'text-green-800' : 'text-orange-800'}`}>
                        {isBalanced ? 'Parabéns! Prato equilibrado!' : 'Quase lá!'}
                      </p>
                      <p className={`text-sm mt-1 ${isBalanced ? 'text-green-700' : 'text-orange-700'}`}>
                        {isBalanced
                          ? 'Você criou uma refeição saudável com todos os grupos alimentares!'
                          : 'Adicione mais alimentos para equilibrar seu prato.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Food Selection */}
          <div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Alimentos Disponíveis
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Você pode adicionar até 6 alimentos no prato
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {availableFoods.map((food) => (
                  <motion.button
                    key={food.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToPlate(food)}
                    disabled={plate.length >= 6}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-5xl mb-2">{food.emoji}</div>
                    <div className="text-xs font-semibold text-gray-700">{food.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
