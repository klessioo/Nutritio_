// Avatar 100% pixel art, desenhado por código em um grid de baixa resolução
// (sem depender de nenhum asset externo/baixado) — inspirado nos retratos
// "bust" estilo Stardew Valley: cabeça grande, poucos pixels no rosto, roupa
// visível até os ombros.

export interface AvatarConfig {
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  eyeType: number;
  mouthType: number;
  outfitStyle: number;
  outfitColor: number;
  accessory: number;
}

export const GRID = 32;
const CX = 16;

export const SKIN_TONES = ['#ffe0bd', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'];
export const HAIR_COLORS = ['#161512', '#3b2417', '#6b4423', '#a0522d', '#d2a679', '#c0392b', '#8a8a8a', '#ff6fa5'];
export const OUTFIT_COLORS = ['#7d8891', '#2c3e50', '#c0392b', '#27ae60', '#e67e22', '#8e44ad', '#16a085', '#2c2c2c'];

export const HAIR_STYLES = ['Curto', 'Moicano Texturizado', 'Longo Liso', 'Black Power', 'Rabo de Cavalo', 'Moicano'];
export const OUTFIT_STYLES = ['Camiseta', 'Jaqueta', 'Moletom', 'Xadrez'];
export const EYE_TYPES = ['Normal', 'Sonolento', 'Arregalado'];
export const MOUTH_TYPES = ['Neutro', 'Sorriso', 'Sorrisão'];
export const ACCESSORIES = ['Nenhum', 'Óculos', 'Boné', 'Laço'];

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: 1,
  hairStyle: 0,
  hairColor: 0,
  eyeType: 0,
  mouthType: 1,
  outfitStyle: 1,
  outfitColor: 0,
  accessory: 0,
};

function span(ctx: CanvasRenderingContext2D, y: number, halfWidth: number, color: string, cx = CX) {
  if (halfWidth <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(cx - halfWidth, y, halfWidth * 2, 1);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 0xff) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Sombra simples (luz vindo de cima-esquerda) aplicada na fatia direita de
// cada fileira — é o que tira o efeito "chapado/quadrado" das formas.
function shadeRows(ctx: CanvasRenderingContext2D, rows: [number, number][], color: string, amt = -24, coverage = 0.42) {
  const dark = shade(color, amt);
  for (const [y, hw] of rows) {
    const w = Math.max(1, Math.round(hw * 2 * coverage));
    rect(ctx, CX + hw - w, y, w, 1, dark);
  }
}

function highlightRows(ctx: CanvasRenderingContext2D, rows: [number, number][], color: string, amt = 30, coverage = 0.3) {
  const light = shade(color, amt);
  for (const [y, hw] of rows) {
    const w = Math.max(1, Math.round(hw * 2 * coverage));
    rect(ctx, CX - hw, y, w, 1, light);
  }
}

// Contorno automático: qualquer pixel opaco vizinho de um pixel transparente
// "empurra" um pixel escuro pra dentro do espaço vazio — dá o acabamento
// arredondado/definido de pixel art de verdade em vez de blocos soltos.
function addOutline(ctx: CanvasRenderingContext2D, outline: string) {
  const img = ctx.getImageData(0, 0, GRID, GRID);
  const data = img.data;
  const alphaAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= GRID || y >= GRID) return 0;
    return data[(y * GRID + x) * 4 + 3];
  };
  const toMark: number[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const idx = (y * GRID + x) * 4;
      if (data[idx + 3] === 0) {
        if (alphaAt(x - 1, y) > 0 || alphaAt(x + 1, y) > 0 || alphaAt(x, y - 1) > 0 || alphaAt(x, y + 1) > 0) {
          toMark.push(idx);
        }
      }
    }
  }
  const n = parseInt(outline.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  for (const idx of toMark) {
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

const HEAD_ROWS: [number, number][] = [
  [5, 4], [6, 6], [7, 7], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8],
  [13, 8], [14, 8], [15, 8], [16, 7], [17, 6], [18, 4],
];
const NECK_ROWS: [number, number][] = [[19, 3], [20, 3]];
const TORSO_ROWS: [number, number][] = [
  [21, 5], [22, 7], [23, 9], [24, 9], [25, 9], [26, 9],
  [27, 9], [28, 8], [29, 8], [30, 8], [31, 7],
];

function drawHead(ctx: CanvasRenderingContext2D, skin: string) {
  for (const [y, hw] of HEAD_ROWS) span(ctx, y, hw, skin);
  shadeRows(ctx, HEAD_ROWS, skin);
  highlightRows(ctx, HEAD_ROWS.slice(0, 6), skin);
}

function drawNeck(ctx: CanvasRenderingContext2D, skin: string) {
  for (const [y, hw] of NECK_ROWS) span(ctx, y, hw, skin);
}

function drawEyes(ctx: CanvasRenderingContext2D, type: number) {
  const dark = '#2b2018';
  if (type === 1) {
    // Sonolento: linha fina
    rect(ctx, 12, 12, 2, 1, dark);
    rect(ctx, 19, 12, 2, 1, dark);
    return;
  }
  const size = type === 2 ? 3 : 2;
  rect(ctx, 12, 11, size, size, dark);
  rect(ctx, 19 - (size - 2), 11, size, size, dark);
  if (type === 2) {
    rect(ctx, 13, 11, 1, 1, '#ffffff');
    rect(ctx, 20 - (size - 2), 11, 1, 1, '#ffffff');
  }
}

function drawMouth(ctx: CanvasRenderingContext2D, type: number) {
  const color = '#8a4a3a';
  if (type === 0) rect(ctx, 14, 15, 4, 1, color);
  else if (type === 1) {
    rect(ctx, 13, 15, 6, 1, color);
    rect(ctx, 14, 16, 4, 1, color);
  } else {
    rect(ctx, 13, 15, 6, 2, color);
    rect(ctx, 14, 15, 4, 1, '#c96f5c');
  }
}

// Fileiras do "boné" de cabelo por estilo (sobrepõe o topo da cabeça).
const HAIR_CAPS: Record<number, [number, number][]> = {
  0: [[4, 5], [5, 6], [6, 7], [7, 8], [8, 8]], // curto
  1: [[3, 3], [4, 6], [5, 7], [6, 8], [7, 8], [8, 8]], // moicano texturizado
  2: [[4, 5], [5, 6], [6, 7], [7, 8], [8, 8]], // longo liso (cap + laterais)
  3: [[2, 6], [3, 9], [4, 11], [5, 11], [6, 11], [7, 11], [8, 10], [9, 9], [10, 8]], // black power
  4: [[4, 5], [5, 6], [6, 7], [7, 8], [8, 8]], // rabo de cavalo (cap + rabo)
  5: [[7, 8], [8, 8]], // moicano
};

function drawHairBehind(ctx: CanvasRenderingContext2D, style: number, color: string) {
  // Elementos que ficam atrás/ao lado, desenhados antes da roupa aparecer por cima.
  if (style === 2) {
    rect(ctx, 6, 9, 3, 14, color);
    rect(ctx, 23, 9, 3, 14, color);
  }
  if (style === 4) {
    rect(ctx, 24, 7, 4, 4, color);
    rect(ctx, 25, 10, 3, 10, color);
  }
  if (style === 5) {
    rect(ctx, 14, 0, 4, 8, color);
  }
}

function drawHairCap(ctx: CanvasRenderingContext2D, style: number, color: string) {
  const rows = HAIR_CAPS[style] ?? [];
  for (const [y, hw] of rows) span(ctx, y, hw, color);
  shadeRows(ctx, rows, color);
  highlightRows(ctx, rows.slice(0, Math.ceil(rows.length / 2)), color, 35, 0.25);
}

function drawOutfit(ctx: CanvasRenderingContext2D, style: number, color: string) {
  for (const [y, hw] of TORSO_ROWS) span(ctx, y, hw, color);
  shadeRows(ctx, TORSO_ROWS, color);

  const dark = shade(color, -40);
  const light = shade(color, 30);

  if (style === 0) {
    span(ctx, 21, 5, dark); // gola
  } else if (style === 1) {
    span(ctx, 20, 4, color); // colarinho subindo
    rect(ctx, 15, 22, 2, 10, dark); // zíper
  } else if (style === 2) {
    rect(ctx, 11, 20, 2, 3, dark);
    rect(ctx, 19, 20, 2, 3, dark);
    rect(ctx, 13, 27, 6, 3, dark); // bolso
  } else if (style === 3) {
    rect(ctx, 7, 23, 18, 1, light);
    rect(ctx, 7, 26, 18, 1, light);
    rect(ctx, 7, 29, 18, 1, light);
  }
}

function drawAccessory(ctx: CanvasRenderingContext2D, type: number, hairColor: string) {
  if (type === 1) {
    // Óculos
    rect(ctx, 11, 10, 4, 4, '#333333');
    rect(ctx, 12, 11, 2, 2, 'rgba(255,255,255,0.35)');
    rect(ctx, 18, 10, 4, 4, '#333333');
    rect(ctx, 19, 11, 2, 2, 'rgba(255,255,255,0.35)');
    rect(ctx, 15, 11, 2, 1, '#333333');
  } else if (type === 2) {
    // Boné
    const capColor = '#c0392b';
    span(ctx, 4, 6, capColor);
    span(ctx, 5, 7, capColor);
    span(ctx, 6, 8, capColor);
    span(ctx, 7, 8, capColor);
    rect(ctx, 8, 8, 15, 2, capColor);
    rect(ctx, 20, 9, 6, 2, shade(capColor, -30));
  } else if (type === 3) {
    // Laço
    const bow = '#ff4fa3';
    rect(ctx, 21, 5, 3, 3, bow);
    rect(ctx, 25, 6, 2, 2, bow);
    rect(ctx, 23, 6, 2, 2, shade(bow, -30));
  }
  void hairColor;
}

export function paintAvatar(ctx: CanvasRenderingContext2D, config: AvatarConfig, blinking = false) {
  ctx.clearRect(0, 0, GRID, GRID);
  ctx.imageSmoothingEnabled = false;

  const skin = SKIN_TONES[config.skinTone] ?? SKIN_TONES[0];
  const hair = HAIR_COLORS[config.hairColor] ?? HAIR_COLORS[0];
  const outfit = OUTFIT_COLORS[config.outfitColor] ?? OUTFIT_COLORS[0];

  drawHairBehind(ctx, config.hairStyle, hair);
  drawHead(ctx, skin);
  drawHairCap(ctx, config.hairStyle, hair);
  drawEyes(ctx, blinking ? 1 : config.eyeType);
  drawMouth(ctx, config.mouthType);
  drawNeck(ctx, skin);
  drawOutfit(ctx, config.outfitStyle, outfit);
  if (config.hairStyle === 2 || config.hairStyle === 4) drawHairBehind(ctx, config.hairStyle, hair);
  drawAccessory(ctx, config.accessory, hair);
  addOutline(ctx, '#1a1410');
}
