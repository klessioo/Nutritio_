import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';

export interface AvatarConfig {
  gender: 'male' | 'female';
  skinColor: string;
  hairType: number;
  hairColor: string;
  eyeType: number;
  mouthType: number;
  outfit: number;
  accessory: number;
  makeupType?: number; // Para personagens femininas
}

interface AvatarCreatorProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
  size?: number;
}

const SKIN_COLORS = ['#FFDAB3', '#E8B891', '#D4976F', '#B87950', '#8B5A3C', '#654321'];
const HAIR_COLORS = ['#2C1608', '#6B4423', '#A0522D', '#D2691E', '#FFD700', '#FF6347', '#FF1493', '#9B59B6'];
const HAIR_TYPES_MALE = 6;
const HAIR_TYPES_FEMALE = 8;
const EYE_TYPES = 5;
const MOUTH_TYPES = 5;
const OUTFITS = 8; // Roupas temáticas de comida
const ACCESSORIES_MALE = 6;
const ACCESSORIES_FEMALE = 8;
const MAKEUP_TYPES = 4;

export function AvatarCreator({ config, onChange, size = 200 }: AvatarCreatorProps) {
  const [activeCategory, setActiveCategory] = useState<'skin' | 'hair' | 'face' | 'outfit' | 'accessory' | 'makeup'>('skin');

  const maxHairTypes = config.gender === 'female' ? HAIR_TYPES_FEMALE : HAIR_TYPES_MALE;
  const maxAccessories = config.gender === 'female' ? ACCESSORIES_FEMALE : ACCESSORIES_MALE;

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    onChange({ ...config, ...updates });
  };

  const randomize = () => {
    const newConfig: AvatarConfig = {
      gender: config.gender,
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      hairType: Math.floor(Math.random() * maxHairTypes),
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      eyeType: Math.floor(Math.random() * EYE_TYPES),
      mouthType: Math.floor(Math.random() * MOUTH_TYPES),
      outfit: Math.floor(Math.random() * OUTFITS),
      accessory: Math.floor(Math.random() * maxAccessories),
    };
    
    if (config.gender === 'female') {
      newConfig.makeupType = Math.floor(Math.random() * MAKEUP_TYPES);
    }
    
    onChange(newConfig);
  };

  const categoryTabs = [
    { id: 'skin', label: '🎨 Pele' },
    { id: 'hair', label: '💇 Cabelo' },
    { id: 'face', label: '😊 Rosto' },
    { id: 'outfit', label: '👕 Roupa' },
    { id: 'accessory', label: '🎩 Acessórios' },
  ];

  if (config.gender === 'female') {
    categoryTabs.push({ id: 'makeup', label: '💄 Maquiagem' });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Avatar Preview */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-xl">
          <AvatarDisplay config={config} size={size} />
        </div>
        <button
          onClick={randomize}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          title="Gerar aleatório"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {categoryTabs.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Customization Options */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md"
        key={activeCategory}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeCategory === 'skin' && (
          <div>
            <h3 className="font-bold text-gray-700 mb-4 text-center">Escolha a cor da pele</h3>
            <div className="grid grid-cols-6 gap-3">
              {SKIN_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => updateConfig({ skinColor: color })}
                  className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${
                    config.skinColor === color ? 'border-purple-500 scale-110 shadow-lg' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'hair' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-center">Estilo do cabelo</h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateConfig({ hairType: (config.hairType - 1 + maxHairTypes) % maxHairTypes })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-2xl font-bold text-purple-600">Estilo {config.hairType + 1}</div>
                <button
                  onClick={() => updateConfig({ hairType: (config.hairType + 1) % maxHairTypes })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-center">Cor do cabelo</h3>
              <div className="grid grid-cols-6 gap-2">
                {HAIR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateConfig({ hairColor: color })}
                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                      config.hairColor === color ? 'border-purple-500 scale-110 shadow-lg' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'face' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-center">Olhos</h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateConfig({ eyeType: (config.eyeType - 1 + EYE_TYPES) % EYE_TYPES })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-2xl font-bold text-purple-600">Tipo {config.eyeType + 1}</div>
                <button
                  onClick={() => updateConfig({ eyeType: (config.eyeType + 1) % EYE_TYPES })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-center">Boca</h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateConfig({ mouthType: (config.mouthType - 1 + MOUTH_TYPES) % MOUTH_TYPES })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-2xl font-bold text-purple-600">Tipo {config.mouthType + 1}</div>
                <button
                  onClick={() => updateConfig({ mouthType: (config.mouthType + 1) % MOUTH_TYPES })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'outfit' && (
          <div>
            <h3 className="font-bold text-gray-700 mb-4 text-center">
              {config.gender === 'female' ? 'Roupas e Vestidos' : 'Roupas Temáticas'}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 0, emoji: '🍎', name: 'Maçã' },
                { id: 1, emoji: '🥕', name: 'Cenoura' },
                { id: 2, emoji: '🍇', name: 'Uva' },
                { id: 3, emoji: '🍌', name: 'Banana' },
                { id: 4, emoji: '🥦', name: 'Brócolis' },
                { id: 5, emoji: '🍓', name: 'Morango' },
                { id: 6, emoji: '🍊', name: 'Laranja' },
                { id: 7, emoji: '🍉', name: 'Melancia' },
              ].map((outfit) => (
                <button
                  key={outfit.id}
                  onClick={() => updateConfig({ outfit: outfit.id })}
                  className={`p-3 rounded-xl border-3 transition-all hover:scale-110 ${
                    config.outfit === outfit.id 
                      ? 'border-purple-500 bg-purple-50 scale-110 shadow-lg' 
                      : 'border-gray-200 bg-white'
                  }`}
                  title={outfit.name}
                >
                  <div className="text-3xl">{outfit.emoji}</div>
                  <div className="text-xs mt-1 font-semibold text-gray-600">{outfit.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'accessory' && (
          <div>
            <h3 className="font-bold text-gray-700 mb-4 text-center">Acessórios</h3>
            <div className="grid grid-cols-3 gap-3">
              {config.gender === 'male' ? (
                <>
                  {[
                    { id: 0, emoji: '👨‍🍳', name: 'Chapéu Chef' },
                    { id: 1, emoji: '🥽', name: 'Óculos' },
                    { id: 2, emoji: '🧢', name: 'Boné' },
                    { id: 3, emoji: '👓', name: 'Óculos Round' },
                    { id: 4, emoji: '🎩', name: 'Cartola' },
                    { id: 5, emoji: '✨', name: 'Sem acessório' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => updateConfig({ accessory: acc.id })}
                      className={`p-4 rounded-xl border-3 transition-all hover:scale-110 ${
                        config.accessory === acc.id 
                          ? 'border-purple-500 bg-purple-50 scale-110 shadow-lg' 
                          : 'border-gray-200 bg-white'
                      }`}
                      title={acc.name}
                    >
                      <div className="text-4xl mb-1">{acc.emoji}</div>
                      <div className="text-xs font-semibold text-gray-600">{acc.name}</div>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: 0, emoji: '👑', name: 'Coroa' },
                    { id: 1, emoji: '🎀', name: 'Laço Grande' },
                    { id: 2, emoji: '🌸', name: 'Flor' },
                    { id: 3, emoji: '👨‍🍳', name: 'Chapéu Chef' },
                    { id: 4, emoji: '👓', name: 'Óculos' },
                    { id: 5, emoji: '🦋', name: 'Tiara Borboleta' },
                    { id: 6, emoji: '⭐', name: 'Tiara Estrela' },
                    { id: 7, emoji: '✨', name: 'Sem acessório' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => updateConfig({ accessory: acc.id })}
                      className={`p-4 rounded-xl border-3 transition-all hover:scale-110 ${
                        config.accessory === acc.id 
                          ? 'border-purple-500 bg-purple-50 scale-110 shadow-lg' 
                          : 'border-gray-200 bg-white'
                      }`}
                      title={acc.name}
                    >
                      <div className="text-4xl mb-1">{acc.emoji}</div>
                      <div className="text-xs font-semibold text-gray-600">{acc.name}</div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {activeCategory === 'makeup' && config.gender === 'female' && (
          <div>
            <h3 className="font-bold text-gray-700 mb-4 text-center">Maquiagem</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 0, label: '✨ Sem maquiagem', desc: 'Natural' },
                { id: 1, label: '💋 Batom Rosa', desc: 'Suave' },
                { id: 2, label: '💕 Batom + Blush', desc: 'Completo' },
                { id: 3, label: '✨ Batom + Cílios', desc: 'Glamuroso' },
              ].map((makeup) => (
                <button
                  key={makeup.id}
                  onClick={() => updateConfig({ makeupType: makeup.id })}
                  className={`p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                    config.makeupType === makeup.id 
                      ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{makeup.label}</div>
                  <div className="text-xs font-semibold text-gray-600">{makeup.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Componente para exibir o avatar
export function AvatarDisplay({ config, size = 200 }: { config: AvatarConfig; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="select-none">
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#f3f4f6" />
      
      {/* Head */}
      <circle cx="100" cy="90" r="50" fill={config.skinColor} />
      
      {/* Hair background (behind head) */}
      {renderHairBack(config.hairType, config.hairColor, config.gender)}
      
      {/* Ears */}
      <ellipse cx="55" cy="90" rx="8" ry="12" fill={config.skinColor} />
      <ellipse cx="145" cy="90" rx="8" ry="12" fill={config.skinColor} />
      
      {/* Eyes */}
      {renderEyes(config.eyeType, config.gender, config.makeupType)}
      
      {/* Nose */}
      <ellipse cx="100" cy="95" rx="4" ry="6" fill="#d4976f" opacity="0.3" />
      
      {/* Makeup (blush) */}
      {config.gender === 'female' && (config.makeupType === 2 || config.makeupType === 3) && (
        <>
          <ellipse cx="75" cy="95" rx="8" ry="6" fill="#FF69B4" opacity="0.3" />
          <ellipse cx="125" cy="95" rx="8" ry="6" fill="#FF69B4" opacity="0.3" />
        </>
      )}
      
      {/* Mouth */}
      {renderMouth(config.mouthType, config.gender, config.makeupType)}
      
      {/* Hair front */}
      {renderHairFront(config.hairType, config.hairColor, config.gender)}
      
      {/* Body/Neck */}
      <rect x="85" y="135" width="30" height="20" fill={config.skinColor} rx="5" />
      
      {/* Outfit */}
      {renderOutfit(config.outfit, config.gender)}
      
      {/* Accessory */}
      {renderAccessory(config.accessory, config.gender)}
    </svg>
  );
}

function renderHairBack(type: number, color: string, gender: 'male' | 'female') {
  if (gender === 'female') {
    switch (type) {
      case 0: // Cabelo curto feminino
        return <path d="M 60 70 Q 50 50, 70 45 Q 100 35, 130 45 Q 150 50, 140 70 Z" fill={color} />;
      case 1: // Cabelo médio ondulado
        return (
          <path 
            d="M 55 65 Q 45 45, 70 40 Q 100 30, 130 40 Q 155 45, 145 65 L 148 90 Q 145 100, 138 95 L 140 70 Q 100 35, 60 70 L 62 95 Q 55 100, 52 90 Z" 
            fill={color} 
          />
        );
      case 2: // Cabelo longo liso
        return (
          <path 
            d="M 55 60 Q 40 40, 70 35 Q 100 25, 130 35 Q 160 40, 145 60 L 145 120 Q 140 125, 135 120 L 135 65 Q 100 30, 65 65 L 65 120 Q 60 125, 55 120 Z" 
            fill={color} 
          />
        );
      case 3: // Rabo de cavalo
        return (
          <>
            <path d="M 60 70 Q 50 50, 70 45 Q 100 35, 130 45 Q 150 50, 140 70 Z" fill={color} />
            <ellipse cx="100" cy="70" rx="12" ry="8" fill={color} />
            <path d="M 100 78 Q 105 95, 100 110 Q 95 95, 100 78 Z" fill={color} />
          </>
        );
      case 4: // Cabelo cacheado/crespo longo
        return (
          <>
            <circle cx="70" cy="60" r="22" fill={color} />
            <circle cx="100" cy="55" r="25" fill={color} />
            <circle cx="130" cy="60" r="22" fill={color} />
            <circle cx="80" cy="50" r="20" fill={color} />
            <circle cx="120" cy="50" r="20" fill={color} />
            <circle cx="65" cy="80" r="18" fill={color} />
            <circle cx="135" cy="80" r="18" fill={color} />
          </>
        );
      case 5: // Maria chiquinha (dois coques)
        return (
          <>
            <path d="M 60 70 Q 50 50, 70 45 Q 100 35, 130 45 Q 150 50, 140 70 Z" fill={color} />
            <circle cx="70" cy="55" r="15" fill={color} />
            <circle cx="130" cy="55" r="15" fill={color} />
          </>
        );
      case 6: // Trança lateral
        return (
          <>
            <path d="M 60 70 Q 50 50, 70 45 Q 100 35, 130 45 Q 150 50, 140 70 Z" fill={color} />
            <ellipse cx="145" cy="80" rx="8" ry="15" fill={color} />
            <ellipse cx="148" cy="100" rx="7" ry="12" fill={color} />
            <ellipse cx="150" cy="115" rx="6" ry="10" fill={color} />
          </>
        );
      case 7: // Coque alto
        return (
          <>
            <path d="M 60 70 Q 50 50, 70 45 Q 100 35, 130 45 Q 150 50, 140 70 Z" fill={color} />
            <circle cx="100" cy="45" r="18" fill={color} />
            <ellipse cx="100" cy="50" rx="16" ry="12" fill={color} />
          </>
        );
      default:
        return null;
    }
  } else {
    // Estilos masculinos
    switch (type) {
      case 0: // Cabelo curto
        return <path d="M 60 70 Q 50 50, 70 45 Q 100 35, 130 45 Q 150 50, 140 70 Z" fill={color} />;
      case 1: // Cabelo médio
        return <path d="M 55 65 Q 45 45, 70 40 Q 100 30, 130 40 Q 155 45, 145 65 L 145 85 Q 140 90, 135 85 L 135 70 Q 100 35, 65 70 L 65 85 Q 60 90, 55 85 Z" fill={color} />;
      case 2: // Cabelo espetado
        return (
          <>
            <path d="M 70 50 L 65 35 L 75 45 Z" fill={color} />
            <path d="M 85 45 L 83 28 L 90 42 Z" fill={color} />
            <path d="M 100 42 L 100 25 L 105 40 Z" fill={color} />
            <path d="M 115 45 L 117 28 L 110 42 Z" fill={color} />
            <path d="M 130 50 L 135 35 L 125 45 Z" fill={color} />
            <path d="M 60 70 Q 50 50, 70 45 Q 100 35, 130 45 Q 150 50, 140 70 Z" fill={color} />
          </>
        );
      case 3: // Cabelo crespo/afro
        return (
          <>
            <circle cx="75" cy="60" r="20" fill={color} />
            <circle cx="100" cy="55" r="22" fill={color} />
            <circle cx="125" cy="60" r="20" fill={color} />
            <circle cx="85" cy="50" r="18" fill={color} />
            <circle cx="115" cy="50" r="18" fill={color} />
          </>
        );
      case 4: // Cabelo com franja
        return <path d="M 60 70 Q 50 45, 70 40 Q 100 30, 130 40 Q 150 45, 140 70 Z" fill={color} />;
      case 5: // Moicano
        return (
          <>
            <rect x="95" y="35" width="10" height="35" fill={color} rx="2" />
            <path d="M 95 35 Q 100 25, 105 35 Z" fill={color} />
          </>
        );
      default:
        return null;
    }
  }
}

function renderHairFront(type: number, color: string, gender: 'male' | 'female') {
  if (gender === 'male' && type === 4) {
    // Franja masculina
    return (
      <>
        <path d="M 65 65 Q 70 55, 75 65 Z" fill={color} />
        <path d="M 75 65 Q 80 50, 85 65 Z" fill={color} />
        <path d="M 85 65 Q 90 48, 95 65 Z" fill={color} />
        <path d="M 95 65 Q 100 50, 105 65 Z" fill={color} />
        <path d="M 105 65 Q 110 48, 115 65 Z" fill={color} />
        <path d="M 115 65 Q 120 50, 125 65 Z" fill={color} />
        <path d="M 125 65 Q 130 55, 135 65 Z" fill={color} />
      </>
    );
  }
  
  if (gender === 'female') {
    if (type === 0 || type === 3 || type === 4 || type === 5 || type === 6 || type === 7) {
      // Franja feminina
      return (
        <>
          <path d="M 65 65 Q 68 58, 72 65 Z" fill={color} />
          <path d="M 72 65 Q 76 55, 80 65 Z" fill={color} />
          <path d="M 80 65 Q 84 52, 88 65 Z" fill={color} />
          <path d="M 88 65 Q 92 50, 96 65 Z" fill={color} />
          <path d="M 96 65 Q 100 52, 104 65 Z" fill={color} />
          <path d="M 104 65 Q 108 50, 112 65 Z" fill={color} />
          <path d="M 112 65 Q 116 52, 120 65 Z" fill={color} />
          <path d="M 120 65 Q 124 55, 128 65 Z" fill={color} />
          <path d="M 128 65 Q 132 58, 135 65 Z" fill={color} />
        </>
      );
    }
  }
  
  return null;
}

function renderEyes(type: number, gender: 'male' | 'female', makeupType?: number) {
  const baseY = 85;
  const hasEyelashes = gender === 'female' && (makeupType === 3);
  
  let eyesContent;
  
  switch (type) {
    case 0: // Olhos redondos
      eyesContent = (
        <>
          <circle cx="85" cy={baseY} r="8" fill="white" />
          <circle cx="85" cy={baseY} r="5" fill="#2C1608" />
          <circle cx="115" cy={baseY} r="8" fill="white" />
          <circle cx="115" cy={baseY} r="5" fill="#2C1608" />
        </>
      );
      break;
    case 1: // Olhos grandes
      eyesContent = (
        <>
          <ellipse cx="85" cy={baseY} rx="10" ry="12" fill="white" />
          <circle cx="85" cy={baseY + 1} r="6" fill="#2C1608" />
          <circle cx="83" cy={baseY - 1} r="2" fill="white" opacity="0.8" />
          <ellipse cx="115" cy={baseY} rx="10" ry="12" fill="white" />
          <circle cx="115" cy={baseY + 1} r="6" fill="#2C1608" />
          <circle cx="113" cy={baseY - 1} r="2" fill="white" opacity="0.8" />
        </>
      );
      break;
    case 2: // Olhos fechados/felizes
      eyesContent = (
        <>
          <path d="M 77 85 Q 85 80, 93 85" stroke="#2C1608" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 107 85 Q 115 80, 123 85" stroke="#2C1608" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case 3: // Olhos semicerrados
      eyesContent = (
        <>
          <ellipse cx="85" cy={baseY} rx="8" ry="6" fill="white" />
          <circle cx="85" cy={baseY + 1} r="4" fill="#2C1608" />
          <ellipse cx="115" cy={baseY} rx="8" ry="6" fill="white" />
          <circle cx="115" cy={baseY + 1} r="4" fill="#2C1608" />
        </>
      );
      break;
    case 4: // Olhos amendoados
      eyesContent = (
        <>
          <path d="M 77 85 Q 85 80, 93 85 Q 85 90, 77 85 Z" fill="white" />
          <circle cx="85" cy={baseY} r="4" fill="#2C1608" />
          <path d="M 107 85 Q 115 80, 123 85 Q 115 90, 107 85 Z" fill="white" />
          <circle cx="115" cy={baseY} r="4" fill="#2C1608" />
        </>
      );
      break;
    default:
      eyesContent = null;
  }
  
  return (
    <>
      {eyesContent}
      {hasEyelashes && (
        <>
          <line x1="82" y1="77" x2="80" y2="73" stroke="#2C1608" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="85" y1="76" x2="85" y2="72" stroke="#2C1608" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="88" y1="77" x2="90" y2="73" stroke="#2C1608" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="112" y1="77" x2="110" y2="73" stroke="#2C1608" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="115" y1="76" x2="115" y2="72" stroke="#2C1608" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="118" y1="77" x2="120" y2="73" stroke="#2C1608" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </>
  );
}

function renderMouth(type: number, gender: 'male' | 'female', makeupType?: number) {
  const baseY = 105;
  const hasLipstick = gender === 'female' && makeupType && makeupType > 0;
  const lipColor = hasLipstick ? '#FF69B4' : '#8B4513';
  const lipWidth = hasLipstick ? '2.5' : '2';
  
  switch (type) {
    case 0: // Sorriso
      return <path d="M 85 105 Q 100 115, 115 105" stroke={lipColor} strokeWidth={lipWidth} fill="none" strokeLinecap="round" />;
    case 1: // Sorriso grande
      return (
        <>
          <path d="M 85 105 Q 100 118, 115 105" stroke={lipColor} strokeWidth={lipWidth} fill="none" strokeLinecap="round" />
          {!hasLipstick && <path d="M 88 108 Q 100 115, 112 108" fill="#ff9999" />}
        </>
      );
    case 2: // Sorriso discreto
      return <path d="M 90 107 Q 100 110, 110 107" stroke={lipColor} strokeWidth={lipWidth} fill="none" strokeLinecap="round" />;
    case 3: // Boca aberta/surpreso
      return <ellipse cx="100" cy={baseY + 3} rx="8" ry="10" fill={hasLipstick ? lipColor : '#8B4513'} opacity="0.8" />;
    case 4: // Língua de fora
      return (
        <>
          <path d="M 85 105 Q 100 112, 115 105" stroke={lipColor} strokeWidth={lipWidth} fill="none" strokeLinecap="round" />
          <ellipse cx="100" cy="113" rx="5" ry="7" fill="#ff6b9d" />
        </>
      );
    default:
      return null;
  }
}

function renderOutfit(type: number, gender: 'male' | 'female') {
  const outfitColors = [
    '#FF6B6B', // Vermelho maçã
    '#FFA500', // Laranja cenoura
    '#9B59B6', // Roxo uva
    '#FFD700', // Amarelo banana
    '#2ECC71', // Verde brócolis
    '#E74C3C', // Vermelho morango
    '#FF8C00', // Laranja
    '#FF1493', // Rosa melancia
  ];
  
  const color = outfitColors[type] || outfitColors[0];
  
  if (gender === 'female') {
    // Vestido
    return (
      <>
        {/* Corpo do vestido */}
        <path 
          d="M 85 150 L 85 155 L 70 200 L 130 200 L 115 155 L 115 150 Z" 
          fill={color}
        />
        
        {/* Mangas curtas */}
        <ellipse cx="70" cy="155" rx="8" ry="10" fill={color} />
        <ellipse cx="130" cy="155" rx="8" ry="10" fill={color} />
        
        {/* Estampa/Ícone da comida */}
        <g transform="translate(100, 175)">
          {type === 0 && <text fontSize="24" textAnchor="middle">🍎</text>}
          {type === 1 && <text fontSize="24" textAnchor="middle">🥕</text>}
          {type === 2 && <text fontSize="24" textAnchor="middle">🍇</text>}
          {type === 3 && <text fontSize="24" textAnchor="middle">🍌</text>}
          {type === 4 && <text fontSize="24" textAnchor="middle">🥦</text>}
          {type === 5 && <text fontSize="24" textAnchor="middle">🍓</text>}
          {type === 6 && <text fontSize="24" textAnchor="middle">🍊</text>}
          {type === 7 && <text fontSize="24" textAnchor="middle">🍉</text>}
        </g>
        
        {/* Gola */}
        <ellipse cx="100" cy="150" rx="15" ry="5" fill={color} opacity="0.7" />
        
        {/* Detalhes decorativos */}
        <circle cx="100" cy="162" r="3" fill="white" opacity="0.6" />
        <circle cx="90" cy="168" r="2.5" fill="white" opacity="0.5" />
        <circle cx="110" cy="168" r="2.5" fill="white" opacity="0.5" />
      </>
    );
  } else {
    // Camiseta masculina
    return (
      <>
        {/* Corpo da camiseta */}
        <path 
          d="M 85 155 L 70 155 L 70 200 L 130 200 L 130 155 L 115 155 L 115 150 L 85 150 Z" 
          fill={color}
        />
        
        {/* Estampa/Ícone da comida */}
        <g transform="translate(100, 175)">
          {type === 0 && <text fontSize="24" textAnchor="middle">🍎</text>}
          {type === 1 && <text fontSize="24" textAnchor="middle">🥕</text>}
          {type === 2 && <text fontSize="24" textAnchor="middle">🍇</text>}
          {type === 3 && <text fontSize="24" textAnchor="middle">🍌</text>}
          {type === 4 && <text fontSize="24" textAnchor="middle">🥦</text>}
          {type === 5 && <text fontSize="24" textAnchor="middle">🍓</text>}
          {type === 6 && <text fontSize="24" textAnchor="middle">🍊</text>}
          {type === 7 && <text fontSize="24" textAnchor="middle">🍉</text>}
        </g>
        
        {/* Gola */}
        <ellipse cx="100" cy="150" rx="15" ry="5" fill={color} opacity="0.7" />
      </>
    );
  }
}

function renderAccessory(type: number, gender: 'male' | 'female') {
  if (gender === 'female') {
    switch (type) {
      case 0: // Coroa
        return (
          <>
            <path d="M 70 55 L 75 45 L 80 55 L 85 42 L 90 55 L 95 40 L 100 55 L 105 40 L 110 55 L 115 42 L 120 55 L 125 45 L 130 55 Z" fill="#FFD700" />
            <rect x="70" y="55" width="60" height="5" fill="#FFD700" />
            <circle cx="80" cy="48" r="2" fill="#FF1493" />
            <circle cx="100" cy="45" r="2" fill="#FF1493" />
            <circle cx="120" cy="48" r="2" fill="#FF1493" />
          </>
        );
      case 1: // Laço grande
        return (
          <>
            <path d="M 85 50 Q 75 45, 80 40 Q 70 42, 65 38 Q 70 35, 80 40 Z" fill="#FF69B4" />
            <path d="M 115 50 Q 125 45, 120 40 Q 130 42, 135 38 Q 130 35, 120 40 Z" fill="#FF69B4" />
            <circle cx="100" cy="48" r="5" fill="#FF1493" />
            <ellipse cx="85" cy="45" rx="8" ry="6" fill="#FFB6D9" opacity="0.6" />
            <ellipse cx="115" cy="45" rx="8" ry="6" fill="#FFB6D9" opacity="0.6" />
          </>
        );
      case 2: // Flor
        return (
          <>
            <circle cx="125" cy="65" r="5" fill="#FF69B4" />
            <circle cx="120" cy="60" r="5" fill="#FF69B4" />
            <circle cx="130" cy="60" r="5" fill="#FF69B4" />
            <circle cx="120" cy="70" r="5" fill="#FF69B4" />
            <circle cx="130" cy="70" r="5" fill="#FF69B4" />
            <circle cx="125" cy="65" r="3" fill="#FFD700" />
          </>
        );
      case 3: // Chapéu de chef
        return (
          <>
            <rect x="70" y="35" width="60" height="8" fill="white" rx="2" />
            <path d="M 75 35 Q 75 15, 85 20 Q 95 10, 100 20 Q 105 10, 115 20 Q 125 15, 125 35 Z" fill="white" />
            <path d="M 75 35 Q 75 15, 85 20 Q 95 10, 100 20 Q 105 10, 115 20 Q 125 15, 125 35 Z" fill="none" stroke="#e0e0e0" strokeWidth="1" />
          </>
        );
      case 4: // Óculos
        return (
          <>
            <circle cx="85" cy="85" r="12" fill="none" stroke="#333" strokeWidth="2" />
            <circle cx="115" cy="85" r="12" fill="none" stroke="#333" strokeWidth="2" />
            <line x1="97" y1="85" x2="103" y2="85" stroke="#333" strokeWidth="2" />
          </>
        );
      case 5: // Tiara com borboleta
        return (
          <>
            <ellipse cx="100" cy="52" rx="35" ry="3" fill="#FF69B4" />
            <path d="M 95 45 Q 90 40, 95 35 Q 90 37, 88 35 Q 90 32, 95 35 Z" fill="#9B59B6" />
            <path d="M 105 45 Q 110 40, 105 35 Q 110 37, 112 35 Q 110 32, 105 35 Z" fill="#9B59B6" />
            <rect x="98" y="35" width="4" height="12" fill="#2C1608" rx="1" />
          </>
        );
      case 6: // Tiara com estrela
        return (
          <>
            <ellipse cx="100" cy="52" rx="35" ry="3" fill="#FFD700" />
            <path d="M 100 32 L 103 40 L 112 40 L 105 45 L 108 53 L 100 48 L 92 53 L 95 45 L 88 40 L 97 40 Z" fill="#FFD700" />
          </>
        );
      case 7: // Sem acessório
      default:
        return null;
    }
  } else {
    // Acessórios masculinos
    switch (type) {
      case 0: // Chapéu de chef
        return (
          <>
            <rect x="70" y="35" width="60" height="8" fill="white" rx="2" />
            <path d="M 75 35 Q 75 15, 85 20 Q 95 10, 100 20 Q 105 10, 115 20 Q 125 15, 125 35 Z" fill="white" />
            <path d="M 75 35 Q 75 15, 85 20 Q 95 10, 100 20 Q 105 10, 115 20 Q 125 15, 125 35 Z" fill="none" stroke="#e0e0e0" strokeWidth="1" />
          </>
        );
      case 1: // Óculos redondo
        return (
          <>
            <circle cx="85" cy="85" r="12" fill="none" stroke="#333" strokeWidth="2" />
            <circle cx="115" cy="85" r="12" fill="none" stroke="#333" strokeWidth="2" />
            <line x1="97" y1="85" x2="103" y2="85" stroke="#333" strokeWidth="2" />
          </>
        );
      case 2: // Boné
        return (
          <>
            <ellipse cx="100" cy="60" rx="35" ry="8" fill="#FF6B6B" />
            <path d="M 65 60 L 75 50 L 125 50 L 135 60 Z" fill="#FF6B6B" />
            <rect x="75" y="50" width="50" height="15" fill="#E74C3C" rx="3" />
          </>
        );
      case 3: // Óculos quadrado
        return (
          <>
            <rect x="75" y="80" width="18" height="12" fill="none" stroke="#333" strokeWidth="2" rx="2" />
            <rect x="107" y="80" width="18" height="12" fill="none" stroke="#333" strokeWidth="2" rx="2" />
            <line x1="93" y1="86" x2="107" y2="86" stroke="#333" strokeWidth="2" />
          </>
        );
      case 4: // Cartola
        return (
          <>
            <rect x="80" y="35" width="40" height="20" fill="#2C1608" rx="2" />
            <ellipse cx="100" cy="55" rx="30" ry="5" fill="#2C1608" />
            <rect x="85" y="38" width="30" height="3" fill="#8B4513" />
          </>
        );
      case 5: // Sem acessório
      default:
        return null;
    }
  }
}
