import Phaser from 'phaser';
import { TEX, setupTextures } from '../assets';
import { sfx } from '../audio';

export const GAME_W = 800;
export const GAME_H = 560;

// Faixas (prateleiras) onde o carrinho e os itens ficam.
const LANES = [190, 320, 450];
const CART_X = 130;

// Nomes em português das frutas boas (chaves de TEX.good).
const GOOD_NAMES: Record<string, string> = {
  good_apple: 'Maçã',
  good_banana: 'Banana',
  good_grape: 'Uva',
  good_strawberry: 'Morango',
  good_cherry: 'Cereja',
  good_pineapple: 'Abacaxi',
};

export interface MercadoDifficulty {
  duration: number; // segundos
  spawnEvery: number; // ms entre itens
  startSpeed: number; // px/s da esteira no início
  maxSpeed: number; // px/s no fim
  junkChance: number; // 0..1
  perItem: number; // quantos de cada fruta a lista pede
}

export interface MercadoResult {
  score: number;
  collected: number; // itens da lista concluídos
  total: number; // tamanho da lista
  stars: 0 | 1 | 2 | 3;
}

interface RollingSprite extends Phaser.Physics.Arcade.Image {
  isBad?: boolean;
  foodKey?: string;
}

export class MercadoScene extends Phaser.Scene {
  private cart!: Phaser.Physics.Arcade.Image;
  private items!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private diff!: MercadoDifficulty;
  private lane = 1; // índice em LANES
  private score = 0;
  private lives = 3;
  private mistakes = 0;
  private timeLeft = 0;
  private speed = 0;

  // Lista de compras: cada fruta precisa de `perItem` unidades.
  private list: string[] = [];
  private counts: Record<string, number> = {};

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private listRows: Record<string, Phaser.GameObjects.Container> = {};

  private scrollLayers: { obj: Phaser.GameObjects.Container; speed: number }[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdown?: Phaser.Time.TimerEvent;
  private ended = false;

  constructor() {
    super('Mercado');
  }

  preload() {
    setupTextures(this);
  }

  create() {
    this.diff = this.registry.get('difficulty') as MercadoDifficulty;
    this.score = 0;
    this.lives = 3;
    this.mistakes = 0;
    this.timeLeft = this.diff.duration;
    this.speed = this.diff.startSpeed;
    this.lane = 1;
    this.scrollLayers = [];
    this.listRows = {};
    this.ended = false;

    makeCartTexture(this);

    // Lista = todas as frutas boas; cada uma precisa de `perItem` unidades.
    this.list = [...TEX.good];
    this.counts = {};
    for (const k of this.list) this.counts[k] = 0;

    this.buildScenery();

    // Carrinho do jogador
    this.cart = this.physics.add.image(CART_X, LANES[this.lane], TEX_CART);
    this.cart.setDepth(6);
    (this.cart.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.cart.setDisplaySize(96, 72);
    const cbody = this.cart.body as Phaser.Physics.Arcade.Body;
    cbody.setSize(this.cart.width * 0.7, this.cart.height * 0.6);

    this.items = this.physics.add.group();

    this.emitter = this.add.particles(0, 0, TEX.particle, {
      lifespan: 400,
      speed: { min: 60, max: 150 },
      scale: { start: 1.2, end: 0 },
      gravityY: 240,
      emitting: false,
    });
    this.emitter.setDepth(8);

    this.physics.add.overlap(this.cart, this.items, (_c, item) => {
      this.catchItem(item as RollingSprite);
    });

    // Controles: setas cima/baixo + arrastar/tocar para escolher a faixa
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on('keydown-UP', () => this.moveLane(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.moveLane(1));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.pointToLane(p.y));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.pointToLane(p.y);
    });

    this.buildHud();

    this.spawnTimer = this.time.addEvent({
      delay: this.diff.spawnEvery,
      loop: true,
      callback: () => this.spawnItem(),
    });

    this.countdown = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft -= 1;
        // Acelera a esteira linearmente do início ao fim.
        const t = 1 - this.timeLeft / this.diff.duration;
        this.speed = this.diff.startSpeed + (this.diff.maxSpeed - this.diff.startSpeed) * t;
        this.updateHud();
        if (this.timeLeft <= 0) this.endGame();
      },
    });

    this.spawnItem();
  }

  // ---------------- Cenário ----------------

  private buildScenery() {
    // Parede/fundo do mercado
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xf3e9d8).setDepth(0);

    // Teto com luminárias
    this.add.rectangle(GAME_W / 2, 24, GAME_W, 48, 0xe4d5bd).setDepth(0);
    for (let i = 0; i < 6; i++) {
      const lx = 80 + i * 130;
      this.add.rectangle(lx, 20, 60, 10, 0xfff4c2).setDepth(0);
      this.add.rectangle(lx, 20, 60, 10).setStrokeStyle(2, 0xd9c48f).setDepth(0);
    }

    // Prateleiras de fundo que rolam (parallax lento)
    const shelves = this.add.container(0, 0).setDepth(1);
    for (let i = 0; i < 10; i++) {
      const sx = i * 180;
      const unit = this.add.container(sx, 0);
      for (const y of [130, 260, 390]) {
        unit.add(this.add.rectangle(90, y, 170, 54, 0xdfc9a6));
        unit.add(this.add.rectangle(90, y - 24, 170, 8, 0xb99a6b));
        for (let k = 0; k < 5; k++) {
          const bx = 18 + k * 34;
          const col = [0xef9a9a, 0xa5d6a7, 0xfff59d, 0x90caf9, 0xce93d8][(i + k) % 5];
          unit.add(this.add.rectangle(bx, y - 6, 22, 30, col));
        }
      }
      shelves.add(unit);
    }
    this.scrollLayers.push({ obj: shelves, speed: 0.35 });

    // Chão
    this.add.rectangle(GAME_W / 2, 520, GAME_W, 80, 0xcdb892).setDepth(2);
    this.add.rectangle(GAME_W / 2, 482, GAME_W, 6, 0xb59b70).setDepth(2);
    const floor = this.add.container(0, 0).setDepth(2);
    for (let i = 0; i < 14; i++) {
      floor.add(this.add.rectangle(i * 64, 520, 4, 70, 0xb59b70, 0.5));
    }
    this.scrollLayers.push({ obj: floor, speed: 1 });
  }

  // ---------------- HUD ----------------

  private buildHud() {
    const hudStyle = { fontFamily: 'monospace', fontSize: '20px', color: '#3b2f1e', fontStyle: 'bold' };
    this.scoreText = this.add.text(12, 10, '', hudStyle).setDepth(20);
    this.timeText = this.add.text(GAME_W - 12, 10, '', hudStyle).setOrigin(1, 0).setDepth(20);
    this.livesText = this.add.text(12, 36, '', hudStyle).setDepth(20);

    // Painel da lista de compras (canto direito)
    const panelX = GAME_W - 150;
    const panelY = 46;
    const rows = this.list.length;
    this.add
      .rectangle(panelX, panelY + rows * 13, 150, rows * 30 + 34, 0xffffff, 0.9)
      .setStrokeStyle(3, 0x8bc34a)
      .setDepth(19);
    this.add
      .text(panelX, panelY - 4, '📋 Lista', { fontFamily: 'monospace', fontSize: '16px', color: '#33691e', fontStyle: 'bold' })
      .setOrigin(0.5, 0)
      .setDepth(20);

    this.list.forEach((key, i) => {
      const ry = panelY + 26 + i * 30;
      const c = this.add.container(panelX, ry).setDepth(20);
      const icon = this.add.image(-58, 0, key).setDisplaySize(24, 24);
      const label = this.add
        .text(-42, 0, GOOD_NAMES[key] ?? key, { fontFamily: 'monospace', fontSize: '13px', color: '#3b2f1e' })
        .setOrigin(0, 0.5);
      const count = this.add
        .text(64, 0, `0/${this.diff.perItem}`, { fontFamily: 'monospace', fontSize: '13px', color: '#6b7280', fontStyle: 'bold' })
        .setOrigin(1, 0.5);
      count.setName('count');
      c.add([icon, label, count]);
      this.listRows[key] = c;
    });

    this.updateHud();
  }

  private updateHud() {
    this.scoreText.setText(`🏆 ${this.score}`);
    this.timeText.setText(`⏱ ${Math.max(this.timeLeft, 0)}s`);
    this.livesText.setText('❤️'.repeat(Math.max(this.lives, 0)) || '💀');
    for (const key of this.list) {
      const c = this.listRows[key];
      const count = c.getByName('count') as Phaser.GameObjects.Text;
      const n = this.counts[key];
      if (n >= this.diff.perItem) {
        count.setText('✅');
        count.setColor('#16a34a');
        c.setAlpha(0.6);
      } else {
        count.setText(`${n}/${this.diff.perItem}`);
      }
    }
  }

  // ---------------- Movimento ----------------

  private moveLane(dir: number) {
    if (this.ended) return;
    const next = Phaser.Math.Clamp(this.lane + dir, 0, LANES.length - 1);
    if (next !== this.lane) {
      this.lane = next;
      this.tweens.add({ targets: this.cart, y: LANES[this.lane], duration: 110, ease: 'Quad.out' });
    }
  }

  private pointToLane(y: number) {
    if (this.ended) return;
    let best = 0;
    let bestD = Infinity;
    LANES.forEach((ly, i) => {
      const d = Math.abs(ly - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best !== this.lane) {
      this.lane = best;
      this.tweens.add({ targets: this.cart, y: LANES[this.lane], duration: 110, ease: 'Quad.out' });
    }
  }

  // ---------------- Itens ----------------

  /** Frutas ainda não concluídas na lista (para enviesar o spawn e a partida ser sempre terminável). */
  private incompleteGood(): string[] {
    return this.list.filter((k) => this.counts[k] < this.diff.perItem);
  }

  private spawnItem() {
    if (this.ended) return;
    const isBad = Math.random() < this.diff.junkChance;
    let key: string;
    if (isBad) {
      key = TEX.bad[Math.floor(Math.random() * TEX.bad.length)];
    } else {
      // 75% do tempo prioriza frutas que ainda faltam; senão qualquer boa (bônus).
      const pending = this.incompleteGood();
      const pool = pending.length > 0 && Math.random() < 0.75 ? pending : (TEX.good as readonly string[]);
      key = pool[Math.floor(Math.random() * pool.length)];
    }
    const lane = Phaser.Math.Between(0, LANES.length - 1);
    const item = this.items.create(GAME_W + 30, LANES[lane], key) as RollingSprite;
    item.isBad = isBad;
    item.foodKey = key;
    item.setDisplaySize(isBad ? 48 : 52, isBad ? 48 : 52);
    item.setDepth(5);
    const body = item.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(item.width * 0.4, item.width * 0.1, item.height * 0.1);
    body.setVelocityX(-this.speed);
    item.setAngularVelocity(Phaser.Math.Between(-30, 30));
  }

  private catchItem(item: RollingSprite) {
    if (this.ended) return;
    const { x, y, isBad, foodKey } = item;
    item.destroy();

    if (isBad) {
      this.lives -= 1;
      this.mistakes += 1;
      sfx.hit();
      this.cameras.main.shake(120, 0.008);
      this.cameras.main.flash(120, 255, 90, 90);
      this.floatText(x, y, '-1 ❤️', '#ef4444');
      if (this.lives <= 0) {
        this.updateHud();
        this.endGame();
        return;
      }
    } else {
      const key = foodKey!;
      const wasDone = this.counts[key] >= this.diff.perItem;
      if (!wasDone) {
        this.counts[key] += 1;
        this.score += 20;
        const nowDone = this.counts[key] >= this.diff.perItem;
        this.floatText(x, y, nowDone ? `✅ ${GOOD_NAMES[key] ?? ''}` : '+20', '#16a34a');
        this.pulseListRow(key);
      } else {
        this.score += 5; // fruta que já estava completa = bônus menor
        this.floatText(x, y, '+5', '#16a34a');
      }
      sfx.collect();
      this.emitter.explode(10, x, y);
      // Toda a lista concluída → vitória antecipada
      if (this.incompleteGood().length === 0) {
        this.updateHud();
        this.time.delayedCall(300, () => this.endGame());
        return;
      }
    }
    this.updateHud();
  }

  private pulseListRow(key: string) {
    const c = this.listRows[key];
    if (!c) return;
    this.tweens.add({ targets: c, scale: { from: 1.3, to: 1 }, duration: 280, ease: 'Back.out' });
  }

  private floatText(x: number, y: number, msg: string, color: string) {
    const t = this.add
      .text(x, y, msg, { fontFamily: 'monospace', fontSize: '20px', color, fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(30);
    this.tweens.add({ targets: t, y: y - 42, alpha: 0, duration: 750, onComplete: () => t.destroy() });
  }

  update(_t: number, dms: number) {
    if (this.ended) return;
    const dt = dms / 1000;

    for (const layer of this.scrollLayers) {
      layer.obj.x -= this.speed * layer.speed * dt;
      const step = layer.speed >= 1 ? 64 : 180;
      if (layer.obj.x <= -step) layer.obj.x += step;
    }

    this.items.getChildren().forEach((obj) => {
      const item = obj as RollingSprite;
      if (item.x < -40) item.destroy();
    });
  }

  private endGame() {
    if (this.ended) return;
    this.ended = true;
    this.spawnTimer?.remove();
    this.countdown?.remove();

    const total = this.list.length;
    const collected = this.list.filter((k) => this.counts[k] >= this.diff.perItem).length;
    const allDone = collected >= total;
    let stars: 0 | 1 | 2 | 3;
    if (allDone && this.mistakes === 0) stars = 3;
    else if (allDone || collected >= Math.ceil(total * 0.6)) stars = 2;
    else if (collected > 0) stars = 1;
    else stars = 0;

    if (stars >= 2) sfx.win();
    else sfx.gameOver();

    const onGameOver = this.registry.get('onGameOver') as ((r: MercadoResult) => void) | undefined;
    this.time.delayedCall(450, () => {
      onGameOver?.({ score: this.score, collected, total, stars });
    });
  }
}

// -------- Textura do carrinho de compras (pixel art gerada por código) --------

const TEX_CART = 'cart';

function makeCartTexture(scene: Phaser.Scene) {
  if (scene.textures.exists(TEX_CART)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const S = 4;
  const px = (x: number, y: number, w: number, h: number, color: number, a = 1) => {
    g.fillStyle(color, a);
    g.fillRect(x * S, y * S, w * S, h * S);
  };
  const metal = 0x9aa4ad;
  const metalDark = 0x6b7680;
  const wheel = 0x2f353b;
  const wheelHub = 0xc0c8ce;
  const basket = 0xc8ccd0;

  px(4, 3, 16, 9, basket);
  for (let i = 0; i < 6; i++) px(5 + i * 2.5, 3, 1, 9, metalDark, 0.5);
  px(4, 6, 16, 1, metalDark, 0.6);
  px(4, 9, 16, 1, metalDark, 0.6);
  px(3, 2, 18, 2, metal);
  px(20, 0, 3, 2, metal);
  px(21, 1, 2, 6, metal);
  px(5, 12, 14, 2, metalDark);
  px(6, 14, 2, 2, metalDark);
  px(16, 14, 2, 2, metalDark);
  px(5, 15, 4, 3, wheel);
  px(15, 15, 4, 3, wheel);
  px(6, 16, 2, 1, wheelHub);
  px(16, 16, 2, 1, wheelHub);

  g.generateTexture(TEX_CART, 24 * S, 18 * S);
  g.destroy();
}
