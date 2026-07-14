import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizGame {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  emoji: string;
}

const quizData: QuizGame[] = [
  {
    question: 'Qual desses alimentos é mais saudável para o café da manhã?',
    options: ['Refrigerante', 'Frutas frescas', 'Salgadinho', 'Doces'],
    correct: 1,
    explanation: 'Frutas frescas são ricas em vitaminas e fibras, perfeitas para começar o dia!',
    emoji: '🍎',
  },
  {
    question: 'Quantas porções de frutas devemos comer por dia?',
    options: ['Nenhuma', '1 porção', '3 a 5 porções', '10 porções'],
    correct: 2,
    explanation: 'O ideal é consumir de 3 a 5 porções de frutas e vegetais por dia!',
    emoji: '🥗',
  },
  {
    question: 'Qual bebida é melhor para se hidratar?',
    options: ['Refrigerante', 'Suco de caixinha', 'Água', 'Energético'],
    correct: 2,
    explanation: 'A água é a melhor opção para manter o corpo hidratado e saudável!',
    emoji: '💧',
  },
  {
    question: 'Qual alimento é rico em proteínas?',
    options: ['Feijão', 'Refrigerante', 'Bala', 'Batata frita'],
    correct: 0,
    explanation: 'O feijão é rico em proteínas vegetais e ferro, muito importante para crescer forte!',
    emoji: '🫘',
  },
  {
    question: 'Por que devemos comer vegetais?',
    options: ['Para crescer forte', 'Só porque adultos mandam', 'Não precisamos', 'Para ficar doente'],
    correct: 0,
    explanation: 'Vegetais têm vitaminas e minerais que ajudam nosso corpo a crescer e ficar forte!',
    emoji: '🥦',
  },
];

export function QuizNutricao() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const quiz = quizData[currentQuestion];

  const handleAnswer = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);
    
    if (index === quiz.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
  };

  if (showResult) {
    const percentage = (score / quizData.length) * 100;
    return (
      <div className="flex items-center justify-center h-full p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl"
        >
          <div className="text-8xl mb-6">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {percentage >= 80 ? 'Parabéns!' : percentage >= 60 ? 'Muito bem!' : 'Continue tentando!'}
          </h2>
          <p className="text-2xl text-gray-600 mb-2">
            Você acertou <span className="font-bold text-green-600">{score}</span> de {quizData.length} perguntas
          </p>
          <p className="text-xl text-gray-500 mb-8">
            {percentage}% de acertos
          </p>
          <button
            onClick={handleRestart}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Jogar Novamente 🔄
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-3xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pergunta {currentQuestion + 1} de {quizData.length}</span>
            <span>Pontuação: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full"
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{quiz.emoji}</div>
            <h3 className="text-2xl font-bold text-gray-800">{quiz.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-6">
            {quiz.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === quiz.correct;
              const showCorrect = answered && isCorrect;
              const showWrong = answered && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  whileHover={!answered ? { scale: 1.02 } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                  className={`w-full p-5 rounded-2xl font-semibold text-left transition-all flex items-center gap-3 ${
                    showCorrect
                      ? 'bg-green-100 border-4 border-green-500 text-green-800'
                      : showWrong
                      ? 'bg-red-100 border-4 border-red-500 text-red-800'
                      : isSelected
                      ? 'bg-purple-100 border-4 border-purple-500 text-purple-800'
                      : 'bg-gray-50 border-4 border-gray-200 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    showCorrect ? 'bg-green-500 text-white' :
                    showWrong ? 'bg-red-500 text-white' :
                    isSelected ? 'bg-purple-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {showWrong && <XCircle className="w-6 h-6 text-red-600" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl mb-6 ${
                selectedAnswer === quiz.correct
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-blue-50 border-2 border-blue-200'
              }`}
            >
              <p className={`font-semibold ${
                selectedAnswer === quiz.correct ? 'text-green-800' : 'text-blue-800'
              }`}>
                {selectedAnswer === quiz.correct ? '✅ Correto!' : '💡 Aprendizado:'}
              </p>
              <p className="text-gray-700 mt-2">{quiz.explanation}</p>
            </motion.div>
          )}

          {/* Next Button */}
          {answered && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
            >
              {currentQuestion < quizData.length - 1 ? 'Próxima Pergunta →' : 'Ver Resultado 🎉'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
