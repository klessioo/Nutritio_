import { Target, Heart, Users, BookOpen, Baby, MapPin, Gamepad2, Layers, ClipboardList, LineChart } from 'lucide-react';

const PIXEL = {
  apple: '/assets/games/fruits/apple.png',
  carrot: '/assets/games/plate/vegetable/carrot.png',
  broccoli: '/assets/games/plate/vegetable/broccoli.png',
  grape: '/assets/games/fruits/grape.png',
  strawberry: '/assets/games/fruits/strawberry.png',
  tomato: '/assets/games/plate/vegetable/tomato.png',
};

function PixelIcon({ src, size = 32, className = '' }: { src: string; size?: number; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
      className={className}
    />
  );
}

const STATS = [
  { icon: Baby, label: 'Público-alvo', value: '8 a 12 anos' },
  { icon: MapPin, label: 'Território de aplicação', value: 'Caxias-MA' },
  { icon: Gamepad2, label: 'Intervenção gamificada', value: '10 jogos' },
  { icon: Layers, label: 'Desenho metodológico', value: '3 fases' },
];

export function AboutSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="max-w-3xl flex items-start gap-4">
          <PixelIcon src={PIXEL.apple} size={48} className="mt-1 hidden sm:block drop-shadow-lg" />
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Nutritio</h2>
            <p className="text-xl md:text-2xl opacity-90">
              Plataforma de Educação Alimentar e Nutricional (EAN) para crianças, estruturada como
              intervenção gamificada.
            </p>
          </div>
        </div>
      </div>

      {/* Ficha rápida do projeto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-gray-100">
            <Icon className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-lg font-bold text-gray-800 leading-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Resumo do Projeto */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Sobre o Projeto</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          O <strong>Nutritio</strong> é uma iniciativa de Educação Alimentar e Nutricional (EAN)
          desenvolvida especialmente para crianças de 8 a 12 anos de Caxias-MA. A obesidade infantil
          e outros agravos ligados à má alimentação são preocupações crescentes de saúde pública, e a
          escola é um dos ambientes mais efetivos para a construção de hábitos alimentares saudáveis
          na infância. Nossa missão é promover essas escolhas através de jogos educativos interativos,
          traduzindo conceitos de nutrição em experiências lúdicas e acessíveis.
        </p>
      </div>

      {/* Objetivos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-lg border-4 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Objetivo Geral</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Promover a Educação Alimentar e Nutricional entre crianças de Caxias-MA,
            incentivando escolhas alimentares conscientes e saudáveis através de uma
            metodologia gamificada e interativa.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border-4 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Objetivos Específicos</h3>
          </div>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>Prevenir a obesidade infantil na região</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>Ensinar sobre grupos alimentares e nutrição</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>Desenvolver autonomia nas escolhas alimentares</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>Promover o consumo de frutas e vegetais</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Metodologia */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Metodologia</h3>
        </div>
        <div className="space-y-4 text-gray-700">
          <p className="leading-relaxed">
            A plataforma utiliza uma abordagem de <strong>aprendizagem baseada em jogos</strong>,
            estruturada em três fases, onde as crianças aprendem conceitos de nutrição de forma
            lúdica e envolvente.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="relative bg-green-50 rounded-2xl p-5 border-2 border-green-200">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                1
              </span>
              <ClipboardList className="w-7 h-7 text-green-600 mb-2" />
              <h4 className="font-semibold text-green-700 mb-2">Avaliação Inicial</h4>
              <p className="text-sm">Coleta de dados sobre hábitos alimentares atuais</p>
            </div>
            <div className="relative bg-orange-50 rounded-2xl p-5 border-2 border-orange-200">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shadow-md">
                2
              </span>
              <Gamepad2 className="w-7 h-7 text-orange-600 mb-2" />
              <h4 className="font-semibold text-orange-700 mb-2">Intervenção Gamificada</h4>
              <p className="text-sm">10 jogos educativos sobre alimentação saudável</p>
            </div>
            <div className="relative bg-purple-50 rounded-2xl p-5 border-2 border-purple-200">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                3
              </span>
              <LineChart className="w-7 h-7 text-purple-600 mb-2" />
              <h4 className="font-semibold text-purple-700 mb-2">Avaliação Final</h4>
              <p className="text-sm">Análise de mudanças nos conhecimentos e hábitos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl p-8 text-white shadow-xl text-center">
        <h3 className="text-3xl font-bold mb-3">Pronto para começar?</h3>
        <p className="text-lg mb-6 opacity-90">
          Faça login e comece sua jornada por uma alimentação mais saudável!
        </p>
        <div className="flex justify-center gap-4">
          {[PIXEL.apple, PIXEL.carrot, PIXEL.broccoli, PIXEL.grape, PIXEL.strawberry, PIXEL.tomato].map((src, i) => (
            <PixelIcon key={i} src={src} size={40} className="drop-shadow-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
