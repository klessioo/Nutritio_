import { Target, Heart, Users, BookOpen } from 'lucide-react';

export function AboutSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Bem-vindo ao Nutritio! 🍎
          </h2>
          <p className="text-xl md:text-2xl opacity-90">
            Uma plataforma educacional gamificada para crianças aprenderem sobre alimentação saudável de forma divertida!
          </p>
        </div>
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
          desenvolvida especialmente para crianças de 8 a 12 anos de Caxias-MA. Nossa missão é 
          promover hábitos alimentares saudáveis através de jogos educativos interativos, ajudando 
          a prevenir a obesidade infantil e outros problemas relacionados à má alimentação.
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
            onde as crianças aprendem conceitos de nutrição de forma lúdica e envolvente.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-green-700 mb-2">Fase 1: Avaliação Inicial</h4>
              <p className="text-sm">Coleta de dados sobre hábitos alimentares atuais</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-5 border-2 border-orange-200">
              <div className="text-3xl mb-2">🎮</div>
              <h4 className="font-semibold text-orange-700 mb-2">Fase 2: Intervenção Gamificada</h4>
              <p className="text-sm">8 jogos educativos sobre alimentação saudável</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-semibold text-purple-700 mb-2">Fase 3: Avaliação Final</h4>
              <p className="text-sm">Análise de mudanças nos conhecimentos e hábitos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl p-8 text-white shadow-xl text-center">
        <h3 className="text-3xl font-bold mb-3">Pronto para começar? 🚀</h3>
        <p className="text-lg mb-6 opacity-90">
          Faça login e comece sua jornada por uma alimentação mais saudável!
        </p>
        <div className="flex justify-center gap-3 text-4xl">
          🍎 🥕 🥦 🍊 🍇 🥗
        </div>
      </div>
    </div>
  );
}