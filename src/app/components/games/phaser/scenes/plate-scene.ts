import Phaser from 'phaser';
import { sfx } from '../audio';

export const GAME_W = 900;
export const GAME_H = 620;

export type Category = 'protein' | 'carb' | 'vegetable' | 'fruit';

export interface PlateFood {
  key: string;
  name: string;
  category: Category;
  healthy: boolean;
  file: string;
}

// Comida com opções saudáveis E não saudáveis em cada grupo — a criança
// precisa observar antes de arrastar, não só "preencher a categoria".
// Fontes CC0: Free Pixel foods (ghostpixxells), FREE Pixel Art Vegetables Pack
// (quipinny), Pixel Fruit Pack (Violator Studio), Pixel Platformer Food
// Expansion (Kenney) — ver public/assets/games/ATTRIBUTIONS.md
export const PLATE_FOODS: PlateFood[] = [
  { key: 'p_chicken', name: 'Frango Grelhado', category: 'protein', healthy: true, file: '/assets/games/plate/protein/chicken.png' },
  { key: 'p_fish', name: 'Peixe Assado', category: 'protein', healthy: true, file: '/assets/games/plate/protein/fish.png' },
  { key: 'p_egg', name: 'Ovo Cozido', category: 'protein', healthy: true, file: '/assets/games/plate/protein/egg.png' },
  { key: 'p_steak', name: 'Carne Grelhada', category: 'protein', healthy: true, file: '/assets/games/plate/protein/steak.png' },
  { key: 'p_bacon', name: 'Bacon Frito', category: 'protein', healthy: false, file: '/assets/games/plate/protein/bacon.png' },
  { key: 'p_hotdog', name: 'Salsicha', category: 'protein', healthy: false, file: '/assets/games/plate/protein/hotdog.png' },

  { key: 'c_bread', name: 'Pão', category: 'carb', healthy: true, file: '/assets/games/plate/carb/bread.png' },
  { key: 'c_potato', name: 'Batata Cozida', category: 'carb', healthy: true, file: '/assets/games/plate/carb/potato.png' },
  { key: 'c_fries', name: 'Batata Frita', category: 'carb', healthy: false, file: '/assets/games/plate/carb/fries.png' },
  { key: 'c_donut', name: 'Rosquinha', category: 'carb', healthy: false, file: '/assets/games/junk/donut.png' },

  { key: 'v_broccoli', name: 'Brócolis', category: 'vegetable', healthy: true, file: '/assets/games/plate/vegetable/broccoli.png' },
  { key: 'v_carrot', name: 'Cenoura', category: 'vegetable', healthy: true, file: '/assets/games/plate/vegetable/carrot.png' },
  { key: 'v_tomato', name: 'Tomate', category: 'vegetable', healthy: true, file: '/assets/games/plate/vegetable/tomato.png' },
  { key: 'v_cabbage', name: 'Alface', category: 'vegetable', healthy: true, file: '/assets/games/plate/vegetable/cabbage.png' },
  { key: 'v_cucumber', name: 'Picles em Conserva', category: 'vegetable', healthy: false, file: '/assets/games/plate/vegetable/cucumber.png' },

  { key: 'f_apple', name: 'Maçã', category: 'fruit', healthy: true, file: '/assets/games/fruits/apple.png' },
  { key: 'f_banana', name: 'Banana', category: 'fruit', healthy: true, file: '/assets/games/fruits/banana.png' },
  { key: 'f_grape', name: 'Uva', category: 'fruit', healthy: true, file: '/assets/games/fruits/grape.png' },
  { key: 'f_strawberry', name: 'Morango', category: 'fruit', healthy: true, file: '/assets/games/fruits/strawberry.png' },
  { key: 'f_cherry', name: 'Cereja', category: 'fruit', healthy: true, file: '/assets/games/fruits/cherry.png' },
  { key: 'f_pineapple', name: 'Abacaxi', category: 'fruit', healthy: true, file: '/assets/games/fruits/pineapple.png' },
  { key: 'f_jam', name: 'Geleia Açucarada', category: 'fruit', healthy: false, file: '/assets/games/plate/fruit/jam.png' },
  { key: 'f_candy', name: 'Bala de Fruta', category: 'fruit', healthy: false, file: '/assets/games/junk/candy.png' },
];

const REQUIREMENTS: Record<Category, { min: number; label: string; emoji: string }> = {
  protein: { min: 1, label: 'Proteína', emoji: '🍗' },
  carb: { min: 1, label: 'Carboidrato', emoji: '🍞' },
  vegetable: { min: 2, label: 'Vegetais', emoji: '🥦' },
  fruit: { min: 1, label: 'Frutas', emoji: '🍎' },
};

const TABS: { key: Category; label: string; emoji: string }[] = [
  { key: 'protein', label: 'Proteínas', emoji: '🍗' },
  { key: 'carb', label: 'Carboidratos', emoji: '🍞' },
  { key: 'vegetable', label: 'Vegetais', emoji: '🥦' },
  { key: 'fruit', label: 'Frutas', emoji: '🍎' },
];

const PLATE_CX = 235;
const PLATE_CY = 448;
const PLATE_R = 100;
const MAX_PLATE_ITEMS = 8;

export interface PlateResult {
  score: number;
  stars: 0 | 1 | 2 | 3;
  junkCount: number;
  plateCount: number;
}

interface PlacedItem {
  instanceId: string;
  food: PlateFood;
  icon: Phaser.GameObjects.Image;
  backing: Phaser.GameObjects.Arc;
  warnText?: Phaser.GameObjects.Text;
}

export class PlateScene extends Phaser.Scene {
  private activeCategory: Category = 'protein';
  private trayIcons: Phaser.GameObjects.GameObject[] = [];
  private plateItems: PlacedItem[] = [];
  private dragGhost: Phaser.GameObjects.Image | null = null;
  private dragFood: PlateFood | null = null;
  private checklistTexts: Partial<Record<Category, Phaser.GameObjects.Text>> = {};
  private feedbackBg!: Phaser.GameObjects.Rectangle;
  private feedbackText!: Phaser.GameObjects.Text;
  private tabButtons: Partial<Record<Category, { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>> = {};
  private ended = false;

  constructor() {
    super('PlateScene');
  }

  preload() {
    for (const food of PLATE_FOODS) {
      if (!this.textures.exists(food.key)) this.load.image(food.key, food.file);
    }
  }

  create() {
    this.ended = false;
    this.plateItems = [];
    this.activeCategory = 'protein';

    this.buildBackground();
    this.buildTitle();
    this.buildTabs();
    this.buildTray();
    this.buildPlate();
    this.buildChecklist();
    this.buildButtons();
    this.buildFeedbackBox();

    this.renderTray();
    this.refreshChecklist();

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.dragGhost) {
        this.dragGhost.x = p.x;
        this.dragGhost.y = p.y;
      }
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onDrop(p));
  }

  private buildBackground() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xc68a45);
    for (let y = 0; y < GAME_H; y += 26) {
      this.add.rectangle(GAME_W / 2, y, GAME_W, 2, 0xb57938, 0.5);
    }
  }

  private buildTitle() {
    this.add
      .text(GAME_W / 2, 18, 'Monte um Prato Equilibrado!', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, '#00000055', 3);
    this.add
      .text(GAME_W / 2, 50, 'Arraste os alimentos da mesa até o prato — cuidado, nem tudo é saudável!', {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#fff3e0',
      })
      .setOrigin(0.5, 0);
  }

  private tabRect(index: number) {
    const startX = 30;
    const totalW = GAME_W - 60;
    const gap = 10;
    const w = (totalW - gap * 3) / 4;
    const x = startX + index * (w + gap);
    return { x, y: 62, w, h: 34 };
  }

  private buildTabs() {
    TABS.forEach((tab, i) => {
      const r = this.tabRect(i);
      const bg = this.add
        .rectangle(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h, 0xffffff, 0.9)
        .setStrokeStyle(2, 0x5fa838)
        .setInteractive({ useHandCursor: true });
      const text = this.add
        .text(r.x + r.w / 2, r.y + r.h / 2, `${tab.emoji} ${tab.label}`, {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#3a3a3a',
        })
        .setOrigin(0.5);
      bg.on('pointerdown', () => {
        this.activeCategory = tab.key;
        this.renderTray();
        this.updateTabStyles();
      });
      this.tabButtons[tab.key] = { bg, text };
    });
    this.updateTabStyles();
  }

  private updateTabStyles() {
    TABS.forEach((tab) => {
      const el = this.tabButtons[tab.key];
      if (!el) return;
      const active = tab.key === this.activeCategory;
      el.bg.setFillStyle(active ? 0x22a559 : 0xffffff, active ? 1 : 0.9);
      el.text.setColor(active ? '#ffffff' : '#3a3a3a');
    });
  }

  private buildTray() {
    // Começa em 106 (abas terminam em 96) para não sobrepor as abas acima.
    this.add.rectangle(GAME_W / 2, 191, GAME_W - 60, 170, 0xead9b7, 1).setStrokeStyle(4, 0xffffff);
  }

  private trayCellPos(col: number, row: number) {
    const cellW = (GAME_W - 60) / 4;
    const cellH = 85;
    const startX = 30 + cellW / 2;
    const startY = 106 + cellH / 2;
    return { x: startX + col * cellW, y: startY + row * cellH };
  }

  private renderTray() {
    this.trayIcons.forEach((go) => go.destroy());
    this.trayIcons = [];

    const foods = PLATE_FOODS.filter((f) => f.category === this.activeCategory);
    foods.forEach((food, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const { x, y } = this.trayCellPos(col, row);

      // Cartão com folga vertical entre as duas fileiras para não parecer uma barra só
      const card = this.add
        .rectangle(x, y, 188, 72, 0xffffff, 0.95)
        .setStrokeStyle(2, 0xe0c9a0)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.image(x, y - 9, food.key).setDisplaySize(40, 40);
      const label = this.add
        .text(x, y + 16, food.name, {
          fontFamily: 'sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#3a3a3a',
          align: 'center',
          wordWrap: { width: 170 },
        })
        .setOrigin(0.5, 0);

      card.on('pointerdown', () => this.startDrag(food, x, y));

      this.trayIcons.push(card, icon, label);
    });
  }

  private startDrag(food: PlateFood, x: number, y: number) {
    if (this.dragGhost || this.plateItems.length >= MAX_PLATE_ITEMS) return;
    this.dragFood = food;
    this.dragGhost = this.add.image(x, y, food.key).setDisplaySize(56, 56).setDepth(200).setAlpha(0.9);
  }

  private onDrop(pointer: Phaser.Input.Pointer) {
    if (!this.dragGhost || !this.dragFood) return;
    const circle = new Phaser.Geom.Circle(PLATE_CX, PLATE_CY, PLATE_R);
    const dropped = Phaser.Geom.Circle.Contains(circle, pointer.x, pointer.y);

    if (dropped && this.plateItems.length < MAX_PLATE_ITEMS) {
      this.addToPlate(this.dragFood);
      sfx.collect();
    }

    this.dragGhost.destroy();
    this.dragGhost = null;
    this.dragFood = null;
  }

  private plateSlotPos(index: number) {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const cellW = 42;
    const cellH = 42;
    const startX = PLATE_CX - cellW * 1.5;
    const startY = PLATE_CY - cellH / 2 - 8;
    return { x: startX + col * cellW, y: startY + row * cellH };
  }

  private buildPlate() {
    const skin = 0xe8c39e;
    // Braços/mãos segurando o prato
    this.add.ellipse(PLATE_CX - 91, PLATE_CY + 91, 54, 115, skin).setAngle(-25);
    this.add.ellipse(PLATE_CX + 91, PLATE_CY + 91, 54, 115, skin).setAngle(25);
    this.add.circle(PLATE_CX - 58, PLATE_CY + 77, 29, skin).setStrokeStyle(3, 0xffffff, 0.5);
    this.add.circle(PLATE_CX + 58, PLATE_CY + 77, 29, skin).setStrokeStyle(3, 0xffffff, 0.5);

    // Prato
    this.add.circle(PLATE_CX, PLATE_CY, PLATE_R + 10, 0xffffff);
    this.add.circle(PLATE_CX, PLATE_CY, PLATE_R + 10).setStrokeStyle(6, 0xdedede);
    this.add.circle(PLATE_CX, PLATE_CY, PLATE_R - 12, 0xf4f4f4).setStrokeStyle(2, 0xe2e2e2);

    this.add
      .text(PLATE_CX, PLATE_CY, 'Arraste\naté aqui', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#b8b8b8',
        align: 'center',
      })
      .setOrigin(0.5)
      .setName('platePlaceholder');
  }

  private addToPlate(food: PlateFood) {
    const placeholder = this.children.getByName('platePlaceholder');
    if (placeholder) placeholder.setVisible(false);

    const idx = this.plateItems.length;
    const { x, y } = this.plateSlotPos(idx);
    const instanceId = `${food.key}-${Date.now()}-${Math.random()}`;

    // "Encaixe" branco atrás do ícone, como um mini prato/coaster — deixa o
    // item claramente "servido" em vez de flutuando solto sobre o prato.
    const backing = this.add
      .circle(x, y, 25, 0xffffff, 0.95)
      .setStrokeStyle(2, 0xe4e4e4)
      .setDepth(9);
    const icon = this.add
      .image(x, y, food.key)
      .setDisplaySize(40, 40)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });
    icon.on('pointerdown', () => this.removeFromPlate(instanceId));

    this.tweens.add({ targets: [backing, icon], scale: { from: 0, to: 1 }, duration: 250, ease: 'Back.Out' });

    this.plateItems.push({ instanceId, food, icon, backing });
    this.refreshChecklist();
    this.clearFeedback();
  }

  private removeFromPlate(instanceId: string) {
    const idx = this.plateItems.findIndex((p) => p.instanceId === instanceId);
    if (idx === -1) return;
    const [removed] = this.plateItems.splice(idx, 1);
    removed.icon.destroy();
    removed.backing.destroy();
    removed.warnText?.destroy();

    // Reflui os itens restantes para preencher os slots
    this.plateItems.forEach((p, i) => {
      const { x, y } = this.plateSlotPos(i);
      this.tweens.add({ targets: [p.icon, p.backing], x, y, duration: 200 });
    });

    if (this.plateItems.length === 0) {
      const placeholder = this.children.getByName('platePlaceholder');
      if (placeholder) placeholder.setVisible(true);
    }

    this.refreshChecklist();
    this.clearFeedback();
  }

  private getHealthyCount(category: Category) {
    return this.plateItems.filter((p) => p.food.category === category && p.food.healthy).length;
  }

  private buildChecklist() {
    const panelX = 500;
    const panelY = 290;
    const panelW = GAME_W - 30 - panelX;
    this.add.rectangle(panelX + panelW / 2, panelY + 65, panelW, 130, 0xffffff, 0.95).setStrokeStyle(3, 0xffffff);
    this.add
      .text(panelX + panelW / 2, panelY + 10, '📋 Grupos do Prato', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#2d2d2d',
      })
      .setOrigin(0.5, 0);

    (Object.keys(REQUIREMENTS) as Category[]).forEach((cat, i) => {
      const req = REQUIREMENTS[cat];
      const y = panelY + 42 + i * 26;
      this.add
        .text(panelX + 16, y, `${req.emoji} ${req.label}`, {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#555',
        })
        .setOrigin(0, 0.5);
      const countText = this.add
        .text(panelX + panelW - 16, y, `0/${req.min}`, {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#999',
        })
        .setOrigin(1, 0.5);
      this.checklistTexts[cat] = countText;
    });
  }

  private refreshChecklist() {
    (Object.keys(REQUIREMENTS) as Category[]).forEach((cat) => {
      const req = REQUIREMENTS[cat];
      const count = this.getHealthyCount(cat);
      const t = this.checklistTexts[cat];
      if (!t) return;
      t.setText(`${count}/${req.min}${count >= req.min ? ' ✓' : ''}`);
      t.setColor(count >= req.min ? '#22a559' : '#999999');
    });
  }

  private buildButtons() {
    const panelX = 500;
    const panelW = GAME_W - 30 - panelX;
    const cx = panelX + panelW / 2;

    const verifyBtn = this.add
      .rectangle(cx, 453, panelW, 42, 0x22a559)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(cx, 453, 'Verificar Prato ✓', { fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5);
    verifyBtn.on('pointerdown', () => this.verifyPlate());

    const clearBtn = this.add
      .rectangle(cx, 501, panelW, 34, 0xd9d9d9)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(cx, 501, 'Limpar 🔄', { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#555555' })
      .setOrigin(0.5);
    clearBtn.on('pointerdown', () => this.clearPlate());
  }

  private buildFeedbackBox() {
    const panelX = 500;
    const panelW = GAME_W - 30 - panelX;
    const cx = panelX + panelW / 2;
    this.feedbackBg = this.add
      .rectangle(cx, 561, panelW, 66, 0xffffff, 0)
      .setStrokeStyle(0);
    this.feedbackText = this.add
      .text(cx, 561, '', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#333333',
        align: 'center',
        wordWrap: { width: panelW - 20 },
      })
      .setOrigin(0.5);
  }

  private clearFeedback() {
    this.feedbackBg.setFillStyle(0xffffff, 0);
    this.feedbackText.setText('');
    this.plateItems.forEach((p) => {
      p.icon.clearTint();
      p.warnText?.destroy();
      p.warnText = undefined;
    });
  }

  private clearPlate() {
    this.plateItems.forEach((p) => {
      p.icon.destroy();
      p.warnText?.destroy();
    });
    this.plateItems = [];
    const placeholder = this.children.getByName('platePlaceholder');
    if (placeholder) placeholder.setVisible(true);
    this.refreshChecklist();
    this.clearFeedback();
  }

  private verifyPlate() {
    if (this.plateItems.length === 0 || this.ended) return;

    const balanced = (Object.keys(REQUIREMENTS) as Category[]).every(
      (cat) => this.getHealthyCount(cat) >= REQUIREMENTS[cat].min
    );
    const junkItems = this.plateItems.filter((p) => !p.food.healthy);

    // Marca visualmente os itens não saudáveis no prato
    junkItems.forEach((p) => {
      p.icon.setTint(0xff8888);
      if (!p.warnText) {
        p.warnText = this.add.text(p.icon.x + 16, p.icon.y - 20, '⚠️', { fontSize: '14px' }).setOrigin(0.5);
      }
    });

    if (balanced) {
      const stars: 0 | 1 | 2 | 3 = junkItems.length === 0 ? 3 : junkItems.length <= 2 ? 2 : 1;
      this.feedbackBg.setFillStyle(junkItems.length === 0 ? 0xd7f5df : 0xfff3cd, 1);
      this.feedbackText.setColor(junkItems.length === 0 ? '#1a7a3f' : '#8a6d1a');
      this.feedbackText.setText(
        junkItems.length === 0
          ? '🎉 Parabéns! Prato equilibrado e 100% saudável!'
          : `🤔 Prato equilibrado, mas ${junkItems.map((j) => j.food.name).join(', ')} não é a escolha mais saudável dessa categoria.`
      );
      sfx.win();
      this.ended = true;
      const onGameOver = this.registry.get('onGameOver') as ((r: PlateResult) => void) | undefined;
      this.time.delayedCall(1200, () => {
        onGameOver?.({
          score: Math.max(this.plateItems.length * 15 - junkItems.length * 10, 10),
          stars,
          junkCount: junkItems.length,
          plateCount: this.plateItems.length,
        });
      });
    } else {
      const missing = (Object.keys(REQUIREMENTS) as Category[]).filter(
        (cat) => this.getHealthyCount(cat) < REQUIREMENTS[cat].min
      );
      this.feedbackBg.setFillStyle(0xffe4cc, 1);
      this.feedbackText.setColor('#a15a1a');
      this.feedbackText.setText(
        `💡 Quase lá! Ainda falta: ${missing.map((c) => REQUIREMENTS[c].label).join(', ')}.`
      );
      sfx.hit();
    }
  }
}
