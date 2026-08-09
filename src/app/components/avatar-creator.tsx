import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';
import {
  type AvatarConfig,
  GRID,
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  HAIR_STYLES,
  OUTFIT_STYLES,
  EYE_TYPES,
  MOUTH_TYPES,
  ACCESSORIES,
  paintAvatar,
} from '../lib/pixel-avatar';

export type { AvatarConfig };

interface AvatarCreatorProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
  size?: number;
}

type Category = 'skin' | 'hair' | 'face' | 'outfit' | 'accessory';

const CATEGORY_TABS: { id: Category; label: string }[] = [
  { id: 'skin', label: '🎨 Pele' },
  { id: 'hair', label: '💇 Cabelo' },
  { id: 'face', label: '😊 Rosto' },
  { id: 'outfit', label: '👕 Roupa' },
  { id: 'accessory', label: '🎩 Acessório' },
];

export function AvatarCreator({ config, onChange, size = 200 }: AvatarCreatorProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('skin');

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    onChange({ ...config, ...updates });
  };

  const cycle = (key: keyof AvatarConfig, max: number, dir: 1 | -1) => {
    const current = config[key] as number;
    updateConfig({ [key]: (current + dir + max) % max } as Partial<AvatarConfig>);
  };

  const randomize = () => {
    onChange({
      skinTone: Math.floor(Math.random() * SKIN_TONES.length),
      hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
      hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
      eyeType: Math.floor(Math.random() * EYE_TYPES.length),
      mouthType: Math.floor(Math.random() * MOUTH_TYPES.length),
      outfitStyle: Math.floor(Math.random() * OUTFIT_STYLES.length),
      outfitColor: Math.floor(Math.random() * OUTFIT_COLORS.length),
      accessory: Math.floor(Math.random() * ACCESSORIES.length),
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Avatar Preview */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
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
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
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
              {SKIN_TONES.map((color, i) => (
                <button
                  key={color}
                  onClick={() => updateConfig({ skinTone: i })}
                  className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${
                    config.skinTone === i ? 'border-purple-500 scale-110 shadow-lg' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'hair' && (
          <div className="space-y-4">
            <CyclePicker
              label="Estilo do cabelo"
              value={HAIR_STYLES[config.hairStyle]}
              onPrev={() => cycle('hairStyle', HAIR_STYLES.length, -1)}
              onNext={() => cycle('hairStyle', HAIR_STYLES.length, 1)}
            />
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-center">Cor do cabelo</h3>
              <div className="grid grid-cols-4 gap-2">
                {HAIR_COLORS.map((color, i) => (
                  <button
                    key={color}
                    onClick={() => updateConfig({ hairColor: i })}
                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                      config.hairColor === i ? 'border-purple-500 scale-110 shadow-lg' : 'border-gray-200'
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
            <CyclePicker
              label="Olhos"
              value={EYE_TYPES[config.eyeType]}
              onPrev={() => cycle('eyeType', EYE_TYPES.length, -1)}
              onNext={() => cycle('eyeType', EYE_TYPES.length, 1)}
            />
            <CyclePicker
              label="Boca"
              value={MOUTH_TYPES[config.mouthType]}
              onPrev={() => cycle('mouthType', MOUTH_TYPES.length, -1)}
              onNext={() => cycle('mouthType', MOUTH_TYPES.length, 1)}
            />
          </div>
        )}

        {activeCategory === 'outfit' && (
          <div className="space-y-4">
            <CyclePicker
              label="Estilo da roupa"
              value={OUTFIT_STYLES[config.outfitStyle]}
              onPrev={() => cycle('outfitStyle', OUTFIT_STYLES.length, -1)}
              onNext={() => cycle('outfitStyle', OUTFIT_STYLES.length, 1)}
            />
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-center">Cor da roupa</h3>
              <div className="grid grid-cols-4 gap-2">
                {OUTFIT_COLORS.map((color, i) => (
                  <button
                    key={color}
                    onClick={() => updateConfig({ outfitColor: i })}
                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                      config.outfitColor === i ? 'border-purple-500 scale-110 shadow-lg' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'accessory' && (
          <div>
            <h3 className="font-bold text-gray-700 mb-4 text-center">Acessórios</h3>
            <div className="grid grid-cols-2 gap-3">
              {ACCESSORIES.map((name, i) => (
                <button
                  key={name}
                  onClick={() => updateConfig({ accessory: i })}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    config.accessory === i ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-600">{name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function CyclePicker({
  label,
  value,
  onPrev,
  onNext,
}: {
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="font-bold text-gray-700 mb-3 text-center">{label}</h3>
      <div className="flex items-center justify-center gap-4">
        <button onClick={onPrev} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-lg font-bold text-purple-600 min-w-[9rem] text-center">{value}</div>
        <button onClick={onNext} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Renderiza o avatar em pixel art via <canvas>, sem depender de nenhum asset
// externo — desenhado inteiramente por código em src/app/lib/pixel-avatar.ts.
export function AvatarDisplay({
  config,
  size = 200,
  animated = true,
}: {
  config: AvatarConfig;
  size?: number;
  animated?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!animated) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let blinkTimeoutId: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const delay = 2800 + Math.random() * 3200;
      timeoutId = setTimeout(() => {
        setBlinking(true);
        blinkTimeoutId = setTimeout(() => setBlinking(false), 140);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(blinkTimeoutId);
    };
  }, [animated]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    paintAvatar(ctx, config, blinking);
  }, [config, blinking]);

  return (
    <motion.div
      className="select-none"
      style={{ width: size, height: size }}
      animate={animated ? { y: [0, -3, 0] } : undefined}
      transition={animated ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <canvas
        ref={canvasRef}
        width={GRID}
        height={GRID}
        style={{ width: size, height: size, imageRendering: 'pixelated' }}
      />
    </motion.div>
  );
}
