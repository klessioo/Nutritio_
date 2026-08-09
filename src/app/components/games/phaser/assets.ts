import Phaser from 'phaser';

// ============================================================
// Assets de pixel art (CC0):
//  - Frutas boas: "Pixel Fruit Pack" de Violator Studio (OpenGameArt, CC0)
//  - Comidas ruins: "Pixel Platformer Food Expansion" de Kenney (CC0)
// Ver public/assets/games/ATTRIBUTIONS.md
//
// Mude USE_KENNEY para false para voltar aos placeholders gerados por código.
// ============================================================

export const USE_KENNEY = true;

export const TEX = {
  good: ['good_apple', 'good_banana', 'good_grape', 'good_strawberry', 'good_cherry', 'good_pineapple'] as const,
  bad: ['bad_donut', 'bad_burger', 'bad_pizza', 'bad_milkshake', 'bad_lollipop', 'bad_candy'] as const,
  basket: 'basket',
  particle: 'particle',
};

const FRUIT_FILES: Record<string, string> = {
  good_apple: '/assets/games/fruits/apple.png',
  good_banana: '/assets/games/fruits/banana.png',
  good_grape: '/assets/games/fruits/grape.png',
  good_strawberry: '/assets/games/fruits/strawberry.png',
  good_cherry: '/assets/games/fruits/cherry.png',
  good_pineapple: '/assets/games/fruits/pineapple.png',
};

const JUNK_FILES: Record<string, string> = {
  bad_donut: '/assets/games/junk/donut.png',
  bad_burger: '/assets/games/junk/burger.png',
  bad_pizza: '/assets/games/junk/pizza.png',
  bad_milkshake: '/assets/games/junk/milkshake.png',
  bad_lollipop: '/assets/games/junk/lollipop.png',
  bad_candy: '/assets/games/junk/candy.png',
};

// ---- Placeholders (usados só quando USE_KENNEY === false) -------------------

const GOOD_COLORS: Record<string, { body: number; accent: number }> = {
  good_apple: { body: 0xe74c3c, accent: 0x2ecc71 },
  good_banana: { body: 0xf1c40f, accent: 0xd4ac0d },
  good_grape: { body: 0x9b59b6, accent: 0x76448a },
  good_strawberry: { body: 0xe84393, accent: 0x2ecc71 },
  good_cherry: { body: 0xc0392b, accent: 0x2ecc71 },
  good_pineapple: { body: 0xf1c40f, accent: 0x27ae60 },
};

const BAD_COLORS: Record<string, { body: number; accent: number }> = {
  bad_donut: { body: 0xe8a1c0, accent: 0x7b3f00 },
  bad_burger: { body: 0xc0743a, accent: 0xf5d76e },
  bad_pizza: { body: 0xf5d76e, accent: 0xe74c3c },
  bad_milkshake: { body: 0xf7c8d8, accent: 0xe84393 },
  bad_lollipop: { body: 0xe74c3c, accent: 0xffffff },
  bad_candy: { body: 0xffffff, accent: 0xe74c3c },
};

function makeBlockyTexture(scene: Phaser.Scene, key: string, body: number, accent: number, shape: 'round' | 'square') {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const S = 4;
  const grid = 12;
  const inRound = (x: number, y: number) => {
    const dx = x - (grid - 1) / 2;
    const dy = y - (grid - 1) / 2;
    return Math.sqrt(dx * dx + dy * dy) <= grid / 2;
  };
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      if (shape === 'round' && !inRound(x, y)) continue;
      const isEdge =
        shape === 'square'
          ? x === 0 || y === 0 || x === grid - 1 || y === grid - 1
          : !inRound(x - 1, y) || !inRound(x + 1, y) || !inRound(x, y - 1) || !inRound(x, y + 1);
      const isShine = x + y < 6;
      let color = body;
      if (isEdge) color = accent;
      else if (isShine) color = 0xffffff;
      g.fillStyle(color, isShine && !isEdge ? 0.5 : 1);
      g.fillRect(x * S, y * S, S, S);
    }
  }
  g.generateTexture(key, grid * S, grid * S);
  g.destroy();
}

// ---- Texturas sempre geradas por código (cesta + partícula) ----------------

function makeBasketTexture(scene: Phaser.Scene) {
  const key = TEX.basket;
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const S = 5;
  const w = 20;
  const h = 12;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const rim = y < 2;
      const side = x < 2 || x >= w - 2;
      const weave = (x + y) % 3 === 0;
      let color = 0xb5651d;
      if (rim) color = 0xd98b3a;
      else if (side) color = 0x8a4a12;
      else if (weave) color = 0x9c5a1a;
      g.fillStyle(color, 1);
      g.fillRect(x * S, y * S, S, S);
    }
  }
  g.generateTexture(key, w * S, h * S);
  g.destroy();
}

function makeParticleTexture(scene: Phaser.Scene) {
  const key = TEX.particle;
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 6, 6);
  g.generateTexture(key, 6, 6);
  g.destroy();
}

/**
 * Prepara todas as texturas. Chamado no preload() da cena.
 * Cesta e partícula são sempre geradas por código; frutas/comidas vêm dos
 * PNGs de pixel art (USE_KENNEY) ou de placeholders coloridos.
 */
export function setupTextures(scene: Phaser.Scene) {
  makeBasketTexture(scene);
  makeParticleTexture(scene);

  if (USE_KENNEY) {
    for (const [key, url] of Object.entries(FRUIT_FILES)) scene.load.image(key, url);
    for (const [key, url] of Object.entries(JUNK_FILES)) scene.load.image(key, url);
  } else {
    for (const key of TEX.good) {
      const c = GOOD_COLORS[key];
      makeBlockyTexture(scene, key, c.body, c.accent, 'round');
    }
    for (const key of TEX.bad) {
      const c = BAD_COLORS[key];
      makeBlockyTexture(scene, key, c.body, c.accent, 'square');
    }
  }
}
