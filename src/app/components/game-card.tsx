import { Play } from 'lucide-react';
import { useState } from 'react';

interface GameCardProps {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  image: string;
  starsEarned?: 0 | 1 | 2 | 3;
  onPlay: (game: { id: number; title: string; description: string; icon: string; color: string }) => void;
}

export function GameCard({
  id,
  title,
  description,
  icon,
  color,
  image,
  starsEarned = 0,
  onPlay,
}: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = () => {
    onPlay({ id, title, description, icon, color });
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height: '380px' }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />

      {/* Overlay with glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/60 to-white/90 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top Section: Icon */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-4xl shadow-xl transition-transform duration-300 ${
              isHovered ? 'scale-110 rotate-12' : ''
            }`}
          >
            {icon}
          </div>
        </div>

        {/* Bottom Section: Title, Description, Button */}
        <div className="space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 text-center drop-shadow-sm">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-700 text-center font-medium drop-shadow-sm">
            {description}
          </p>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            className={`w-full bg-gradient-to-r ${color} text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}
          >
            <Play className="w-5 h-5" />
            Jogar
          </button>

          {/* Stars Status */}
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-sm shadow-md"
              >
                {star <= starsEarned ? '⭐' : '☆'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}