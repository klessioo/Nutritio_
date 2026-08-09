import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResultsScreen } from './shared/results-screen';
import { useGameProgress, starsFromRatio } from '../../lib/hooks/use-game-progress';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  emoji: string;
}

const ROUND_SIZE = 20;

// Banco de perguntas (>= 20). Cada rodada embaralha e usa 20.
const QUIZ_DATA: QuizQuestion[] = [
  {
    question: 'Qual desses alimentos é mais saudável para o café da manhã?',
    options: ['Refrigerante', 'Frutas frescas', 'Salgadinho', 'Doces'],
    correct: 1,
    explanation: 'Frutas frescas são ricas em vitaminas e fibras, perfeitas para começar o dia!',
    emoji: '🍎',
  },
  {
    question: 'Quantas porções de frutas e vegetais devemos comer por dia?',
    options: ['Nenhuma', '1 porção', '3 a 5 porções', '10 porções'],
    correct: 2,
    explanation: 'O ideal é consumir de 3 a 5 porções de frutas e vegetais por dia!',
    emoji: '🥗',
  },
  {
    question: 'Qual vegetal é rico em vitamina A e ajuda na visão?',
    options: ['Cenoura', 'Batata frita', 'Pipoca', 'Pão branco'],
    correct: 0,
    explanation: 'A cenoura é rica em vitamina A, ótima para a saúde dos olhos!',
    emoji: '🥕',
  },
  {
    question: 'Qual fruta é famosa por ter muita vitamina C?',
    options: ['Batata', 'Laranja', 'Arroz', 'Queijo'],
    correct: 1,
    explanation: 'A laranja é uma ótima fonte de vitamina C, que reforça as defesas do corpo!',
    emoji: '🍊',
  },
  {
    question: 'Por que devemos comer vegetais verde-escuros, como o brócolis?',
    options: ['Só para enfeitar o prato', 'Eles têm ferro e cálcio', 'Não fazem diferença', 'Só têm água'],
    correct: 1,
    explanation: 'Vegetais verde-escuros têm ferro, cálcio e outras vitaminas essenciais!',
    emoji: '🥦',
  },
  {
    question: 'Qual alimento é rico em proteínas?',
    options: ['Feijão', 'Refrigerante', 'Bala', 'Batata frita'],
    correct: 0,
    explanation: 'O feijão é rico em proteínas e ferro, muito importante para crescer forte!',
    emoji: '🫘',
  },
  {
    question: 'Para que servem as proteínas no nosso corpo?',
    options: ['Só para ter gosto bom', 'Construir músculos e ajudar a crescer', 'Deixar a comida colorida', 'Não servem para nada'],
    correct: 1,
    explanation: 'As proteínas ajudam a construir músculos e são essenciais para o crescimento!',
    emoji: '💪',
  },
  {
    question: 'Qual desses é uma boa fonte de proteína?',
    options: ['Pirulito', 'Ovo', 'Refrigerante', 'Chiclete'],
    correct: 1,
    explanation: 'O ovo é uma excelente fonte de proteína e outros nutrientes!',
    emoji: '🥚',
  },
  {
    question: 'Qual bebida é a melhor para se hidratar?',
    options: ['Refrigerante', 'Suco de caixinha', 'Água', 'Energético'],
    correct: 2,
    explanation: 'A água é a melhor opção para manter o corpo hidratado e saudável!',
    emoji: '💧',
  },
  {
    question: 'Quantos copos de água é recomendado beber por dia, mais ou menos?',
    options: ['1 copo', '2 copos', '6 a 8 copos', '20 copos'],
    correct: 2,
    explanation: 'O recomendado é beber cerca de 6 a 8 copos de água por dia!',
    emoji: '🥤',
  },
  {
    question: 'Quando é mais importante caprichar na hidratação?',
    options: ['Só quando está frio', 'Durante e após atividades físicas', 'Nunca é importante', 'Só de noite'],
    correct: 1,
    explanation: 'Durante e após exercícios perdemos água pelo suor e precisamos repor!',
    emoji: '🏃',
  },
  {
    question: 'O que devemos fazer antes de comer frutas e vegetais crus?',
    options: ['Nada, pode comer direto', 'Lavar bem com água', 'Deixar no sol', 'Guardar sem lavar'],
    correct: 1,
    explanation: 'Lavar bem os alimentos remove sujeira e germes, deixando tudo mais seguro!',
    emoji: '🧼',
  },
  {
    question: 'Por que é importante lavar as mãos antes de comer?',
    options: ['Para as mãos ficarem molhadas', 'Para remover germes que deixam a gente doente', 'Não é importante', 'Só para brincar com água'],
    correct: 1,
    explanation: 'Lavar as mãos remove germes e evita que fiquemos doentes!',
    emoji: '🙌',
  },
  {
    question: 'Onde devemos guardar alimentos como carnes e laticínios?',
    options: ['Na geladeira', 'Debaixo da cama', 'No armário quente', 'Do lado de fora de casa'],
    correct: 0,
    explanation: 'Alimentos perecíveis devem ficar refrigerados para não estragarem!',
    emoji: '🧊',
  },
  {
    question: 'Qual é um bom hábito na hora das refeições?',
    options: ['Comer correndo vendo tela', 'Comer devagar e com calma', 'Pular refeições', 'Comer só doces'],
    correct: 1,
    explanation: 'Comer devagar ajuda a digestão e a perceber quando já estamos satisfeitos!',
    emoji: '🍽️',
  },
  {
    question: 'Com que frequência é legal comer doces e frituras?',
    options: ['Todo dia, várias vezes', 'De vez em quando, com moderação', 'A cada refeição', 'O tempo todo'],
    correct: 1,
    explanation: 'Doces e frituras podem entrar de vez em quando, sem exagero!',
    emoji: '🍩',
  },
  {
    question: 'Qual a melhor escolha para o lanche da escola?',
    options: ['O que os amigos comem', 'Fruta, água e lanche natural', 'Só o que tem mais açúcar', 'O que for mais colorido'],
    correct: 1,
    explanation: 'Um lanche com fruta e água dá mais energia para estudar e brincar!',
    emoji: '🎒',
  },
  {
    question: 'O que as fibras dos alimentos ajudam a fazer?',
    options: ['Deixar o cabelo liso', 'Ajudar o intestino a funcionar bem', 'Aumentar o açúcar', 'Nada de útil'],
    correct: 1,
    explanation: 'As fibras (de frutas, verduras e grãos) ajudam o intestino a funcionar direitinho!',
    emoji: '🌾',
  },
  {
    question: 'Qual desses é um alimento ultraprocessado?',
    options: ['Maçã', 'Salgadinho de pacote', 'Feijão', 'Alface'],
    correct: 1,
    explanation: 'Salgadinhos de pacote são ultraprocessados: têm muito sal, gordura e aditivos.',
    emoji: '🍟',
  },
  {
    question: 'Qual alimento é rico em cálcio e ajuda os ossos a ficarem fortes?',
    options: ['Bala', 'Leite e iogurte', 'Refrigerante', 'Batata frita'],
    correct: 1,
    explanation: 'Leite e iogurte têm cálcio, que deixa os ossos e dentes fortes!',
    emoji: '🥛',
  },
  {
    question: 'O que o café da manhã faz por nós?',
    options: ['Tira a energia', 'Dá energia para começar bem o dia', 'Faz dormir', 'Não muda nada'],
    correct: 1,
    explanation: 'O café da manhã dá energia para pensar, estudar e brincar pela manhã!',
    emoji: '🌅',
  },
  {
    question: 'Qual dessas é a melhor sobremesa no dia a dia?',
    options: ['Uma fruta', 'Um bolo inteiro', 'Vários chocolates', 'Refrigerante'],
    correct: 0,
    explanation: 'Uma fruta é doce, gostosa e cheia de vitaminas — a melhor sobremesa do dia!',
    emoji: '🍓',
  },
];

// Doces e frutas que flutuam no fundo (visual "Corrida Doce").
const FLOATERS = [
  { e: '🍭', x: 6, y: 12, s: 44, d: 0 },
  { e: '🍬', x: 88, y: 8, s: 38, d: 1.2 },
  { e: '🍩', x: 14, y: 74, s: 46, d: 0.6 },
  { e: '🍓', x: 80, y: 68, s: 40, d: 1.8 },
  { e: '🍇', x: 92, y: 40, s: 36, d: 0.3 },
  { e: '🧁', x: 4, y: 44, s: 40, d: 2.1 },
  { e: '🍒', x: 70, y: 18, s: 34, d: 1.0 },
  { e: '🍊', x: 22, y: 30, s: 32, d: 1.5 },
  { e: '🍫', x: 60, y: 82, s: 36, d: 0.9 },
  { e: '🍉', x: 40, y: 6, s: 34, d: 1.7 },
];

// Estilo Kahoot: 4 cores chapadas, cada uma com uma forma própria.
const KAHOOT = [
  { bg: '#e21b3c', shape: 'triangle' }, // vermelho
  { bg: '#1368ce', shape: 'diamond' }, // azul
  { bg: '#d89e00', shape: 'circle' }, // amarelo/ouro
  { bg: '#26890c', shape: 'square' }, // verde
] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizNutricao() {
  const { finishGame } = useGameProgress(5);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [colorOrder, setColorOrder] = useState<number[]>(() => shuffle([0, 1, 2, 3]));

  const startQuiz = () => {
    setQuestions(shuffle(QUIZ_DATA).slice(0, ROUND_SIZE));
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setStreak(0);
    setShowResult(false);
    setColorOrder(shuffle([0, 1, 2, 3]));
    setStarted(true);
  };

  const quiz = questions[current];

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === quiz.correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
      setColorOrder(shuffle([0, 1, 2, 3]));
    } else {
      finishGame({ score, stars: starsFromRatio(score / questions.length), completed: true });
      setShowResult(true);
    }
  };

  // ---------------- Tela inicial (doce) ----------------
  if (!started) {
    return (
      <CandyStage>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 max-w-lg w-full text-center bg-white/85 backdrop-blur rounded-[2.5rem] p-10 shadow-2xl border-4 border-white"
        >
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [-8, 8, -8], y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🍭
          </motion.div>
          <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent drop-shadow">
            Quiz Doce da Nutrição
          </h2>
          <p className="text-gray-600 mb-1 font-semibold">
            {ROUND_SIZE} perguntas cheias de sabor! 🍓🍊🍇
          </p>
          <p className="text-gray-400 text-sm mb-8">Acerte para colecionar doces e faça o maior combo!</p>
          <FlatButton onClick={startQuiz} color="#e2216b">
            Começar! 🍬
          </FlatButton>
        </motion.div>
      </CandyStage>
    );
  }

  // ---------------- Resultado ----------------
  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <ResultsScreen
        emoji={pct >= 80 ? '🏆' : pct >= 60 ? '🌟' : '💪'}
        title={pct >= 80 ? 'Doce Vitória!' : pct >= 60 ? 'Muito bem!' : 'Continue tentando!'}
        scoreLabel={`Você acertou ${score} de ${questions.length} perguntas`}
        detailLabel={`${pct}% de acertos 🍬`}
        stars={starsFromRatio(score / questions.length)}
        accentGradient="from-pink-500 to-purple-500"
        onRestart={() => setStarted(false)}
        restartLabel="Jogar de Novo 🍭"
      />
    );
  }

  // ---------------- Jogo ----------------
  const progress = ((current + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <CandyStage>
      <div className="relative z-10 w-full max-w-2xl">
        {/* Barra superior: progresso doce + placar */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-purple-700/80 mb-1">
              <span>🍬 {current + 1}/{questions.length}</span>
              {streak >= 2 && (
                <motion.span
                  key={streak}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="text-pink-600"
                >
                  🔥 Combo {streak}!
                </motion.span>
              )}
            </div>
            <div className="h-4 rounded-full bg-white/70 border-2 border-white overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #ff6fa5 0 12px, #ff9ec4 12px 24px)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
          <div className="shrink-0 bg-white/85 rounded-2xl px-4 py-2 border-2 border-white shadow-lg text-center">
            <div className="text-[10px] font-bold text-gray-400 leading-none">DOCES</div>
            <div className="text-xl font-extrabold text-pink-600 leading-tight">{score}</div>
          </div>
        </div>

        {/* Card da pergunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 60, opacity: 0, rotate: 2 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="bg-white/90 backdrop-blur rounded-[2rem] p-6 md:p-8 shadow-2xl border-4 border-white"
          >
            <div className="text-center mb-6">
              <motion.div
                className="text-6xl mb-3 inline-block"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {quiz.emoji}
              </motion.div>
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-snug">{quiz.question}</h3>
            </div>

            {/* Opções estilo Kahoot: blocos chapados com forma */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz.options.map((option, index) => {
                const k = KAHOOT[colorOrder[index] ?? index % KAHOOT.length];
                const isSelected = selected === index;
                const isCorrect = index === quiz.correct;
                const showWrong = answered && isSelected && !isCorrect;

                // Kahoot: ao responder, a certa fica em destaque e o resto desbota.
                let opacity = 1;
                if (answered) opacity = isCorrect ? 1 : isSelected ? 0.6 : 0.3;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    whileHover={!answered ? { scale: 1.03 } : {}}
                    whileTap={!answered ? { scale: 0.97 } : {}}
                    animate={showWrong ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="relative flex items-center gap-3 rounded-2xl px-4 py-5 text-white font-extrabold text-left shadow-md select-none"
                    style={{ background: k.bg, opacity }}
                  >
                    <Shape type={k.shape} />
                    <span className="flex-1 text-base md:text-lg drop-shadow-sm">{option}</span>
                    {answered && isCorrect && <span className="text-2xl">✅</span>}
                    {showWrong && <span className="text-2xl">❌</span>}
                    {answered && isCorrect && (
                      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-white" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Explicação */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  className={`mt-5 p-4 rounded-2xl border-2 ${
                    selected === quiz.correct
                      ? 'bg-green-50 border-green-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <p className={`font-extrabold ${selected === quiz.correct ? 'text-green-700' : 'text-amber-700'}`}>
                    {selected === quiz.correct ? '🎉 Acertou, que doçura!' : '💡 Fica a dica:'}
                  </p>
                  <p className="text-gray-700 mt-1 text-sm md:text-base">{quiz.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Próxima */}
            <AnimatePresence>
              {answered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                  <FlatButton onClick={handleNext} color="#7c3aed">
                    {current < questions.length - 1 ? 'Próxima 🍬' : 'Ver Resultado 🏆'}
                  </FlatButton>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </CandyStage>
  );
}

// ---------------- Componentes de cenário ----------------

/** Fundo doce com gradiente e frutas/doces flutuando. */
function CandyStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden flex items-center justify-center p-6 bg-gradient-to-b from-sky-200 via-pink-100 to-fuchsia-200">
      {/* Doces flutuando */}
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none opacity-70"
          style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: f.s }}
          animate={{ y: [0, -18, 0], rotate: [-12, 12, -12] }}
          transition={{ duration: 5 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: f.d }}
        >
          {f.e}
        </motion.div>
      ))}
      {children}
    </div>
  );
}

/** Forma branca estilo Kahoot (triângulo, losango, círculo, quadrado). */
function Shape({ type }: { type: string }) {
  return (
    <span className="shrink-0 w-8 h-8 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-7 h-7" aria-hidden="true">
        {type === 'triangle' && <polygon points="50,12 90,86 10,86" fill="#fff" />}
        {type === 'diamond' && <polygon points="50,8 92,50 50,92 8,50" fill="#fff" />}
        {type === 'circle' && <circle cx="50" cy="50" r="40" fill="#fff" />}
        {type === 'square' && <rect x="14" y="14" width="72" height="72" rx="10" fill="#fff" />}
      </svg>
    </span>
  );
}

/** Botão chapado (flat), sem brilho metálico. */
function FlatButton({
  children,
  onClick,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-full rounded-2xl px-6 py-4 font-extrabold text-white text-lg shadow-md select-none"
      style={{ background: color }}
    >
      {children}
    </motion.button>
  );
}
