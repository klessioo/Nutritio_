import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface PhaserGameProps {
  /** Configuração do Phaser sem o parent (o wrapper injeta o container). */
  config: Omit<Phaser.Types.Core.GameConfig, 'parent'>;
  /** Dados/callbacks disponibilizados às cenas via game.registry.get(...). */
  registryData?: Record<string, unknown>;
  className?: string;
}

/**
 * Ponte reutilizável entre React e Phaser: monta um Phaser.Game dentro de uma div
 * e o destrói na desmontagem. As cenas se comunicam de volta com o React lendo
 * callbacks do registry (ex.: registry.get('onGameOver')).
 */
export function PhaserGame({ config, registryData, className }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      ...config,
      parent: containerRef.current,
    });

    if (registryData) {
      for (const [key, value] of Object.entries(registryData)) {
        game.registry.set(key, value);
      }
    }

    gameRef.current = game;

    // Hook de debug apenas em desenvolvimento, para inspeção manual no console.
    if (import.meta.env.DEV) {
      (window as unknown as { __PHASER_GAME__?: Phaser.Game }).__PHASER_GAME__ = game;
    }

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={className} />;
}
