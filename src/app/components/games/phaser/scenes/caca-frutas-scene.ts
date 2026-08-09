import Phaser from 'phaser';
import { TEX, setupTextures } from '../assets';
import { sfx } from '../audio';

export const GAME_W = 800;
export const GAME_H = 560;

export interface CacaFrutasDifficulty {
  fallSpeedMin: number;
  fallSpeedMax: number;
  spawnEvery: number; // ms
  junkChance: number; // 0..1
  duration: number; // segundos
  targetScore: number;
}

export interface CacaFrutasResult {
  score: number;
  collected: number;
  stars: 0 | 1 | 2 | 3;
}

interface FallingSprite extends Phaser.Physics.Arcade.Image {
  isBad?: boolean;
}

export class CacaFrutasScene extends Phaser.Scene {
  private basket!: Phaser.Physics.Arcade.Image;
  private items!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private score = 0;
  private collected = 0;
  private lives = 3;
  private timeLeft = 60;

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  private diff!: CacaFrutasDifficulty;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdown?: Phaser.Time.TimerEvent;
  private ended = false;

  constructor() {
    super('CacaFrutas');
  }

  preload() {
    setupTextures(this);
  }

  create() {
    this.diff = this.registry.get('difficulty') as CacaFrutasDifficulty;
    this.timeLeft = this.diff.duration;
    this.score = 0;
    this.collected = 0;
    this.lives = 3;
    this.ended = false;

    // Fundo em faixas (céu -> grama)
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xbfe9ff);

    // Cenário ambientado (sol, nuvens, árvores, arbustos, flores)
    this.buildScenery();

    // Cesta do jogador (menor)
    this.basket = this.physics.add.image(GAME_W / 2, GAME_H - 60, TEX.basket);
    this.basket.setScale(0.85);
    this.basket.setDepth(5);
    this.basket.setCollideWorldBounds(true);
    (this.basket.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Grupo de itens caindo
    this.items = this.physics.add.group();

    // Partículas de coleta
    this.emitter = this.add.particles(0, 0, TEX.particle, {
      lifespan: 400,
      speed: { min: 60, max: 140 },
      scale: { start: 1.2, end: 0 },
      gravityY: 200,
      emitting: false,
    });

    // Colisão cesta x itens
    this.physics.add.overlap(this.basket, this.items, (_basket, item) => {
      this.catchItem(item as FallingSprite);
    });

    // Controles: teclado + ponteiro/toque
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.basket.x = Phaser.Math.Clamp(pointer.x, 30, GAME_W - 30);
    });

    // HUD
    const hudStyle = { fontFamily: 'monospace', fontSize: '20px', color: '#1f2937', fontStyle: 'bold' };
    this.scoreText = this.add.text(12, 10, '', hudStyle).setDepth(10);
    this.timeText = this.add.text(GAME_W - 12, 10, '', hudStyle).setOrigin(1, 0).setDepth(10);
    this.livesText = this.add.text(12, 36, '', hudStyle).setDepth(10);
    this.updateHud();

    // Spawner
    this.spawnTimer = this.time.addEvent({
      delay: this.diff.spawnEvery,
      loop: true,
      callback: () => this.spawnItem(),
    });

    // Cronômetro
    this.countdown = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft -= 1;
        this.updateHud();
        if (this.timeLeft <= 0) this.endGame();
      },
    });
  }

  private buildScenery() {
    const groundY = GAME_H - 70;

    // Sol no canto superior direito
    this.add.circle(GAME_W - 55, 60, 34, 0xfff3b0).setDepth(0);
    this.add.circle(GAME_W - 55, 60, 26, 0xffe066).setDepth(0);

    // Nuvens que atravessam o céu lentamente (da esquerda para a direita, em loop limpo)
    const makeCloud = (y: number, s: number, delay: number) => {
      const c = this.add.container(-80, y).setDepth(1);
      const col = 0xffffff;
      c.add(this.add.ellipse(0, 0, 46 * s, 26 * s, col));
      c.add(this.add.ellipse(-20 * s, 6 * s, 30 * s, 20 * s, col));
      c.add(this.add.ellipse(22 * s, 6 * s, 30 * s, 20 * s, col));
      this.tweens.add({
        targets: c,
        x: { from: -80, to: GAME_W + 80 },
        duration: 14000 / s,
        repeat: -1,
        delay,
      });
    };
    makeCloud(90, 1, 0);
    makeCloud(150, 0.75, 5000);
    makeCloud(60, 0.55, 9000);

    // Faixa de grama
    this.add.rectangle(GAME_W / 2, GAME_H - 35, GAME_W, 70, 0x7ec850).setDepth(1);
    this.add.rectangle(GAME_W / 2, groundY, GAME_W, 6, 0x5fa838).setDepth(1);

    // Árvores nos cantos (tronco + copa)
    const makeTree = (x: number) => {
      this.add.rectangle(x, groundY - 6, 12, 30, 0x8a5a2b).setDepth(2);
      this.add.circle(x, groundY - 34, 26, 0x3fa34d).setDepth(2);
      this.add.circle(x - 14, groundY - 24, 18, 0x4cb85c).setDepth(2);
      this.add.circle(x + 14, groundY - 24, 18, 0x4cb85c).setDepth(2);
    };
    makeTree(34);
    makeTree(GAME_W - 34);
    makeTree(GAME_W / 2);

    // Arbustos espalhados por toda a largura da grama
    const bushCount = Math.round(GAME_W / 90);
    for (let i = 0; i < bushCount; i++) {
      const bx = 40 + i * (GAME_W - 80) / (bushCount - 1);
      this.add.ellipse(bx, groundY + 14, 40, 20, 0x5fa838).setDepth(2);
    }
    const flowerColors = [0xff6b81, 0xffd166, 0xff9f1c, 0xe36bff];
    const flowerCount = Math.round(GAME_W / 45);
    for (let i = 0; i < flowerCount; i++) {
      const fx = 30 + Math.random() * (GAME_W - 60);
      const fy = groundY + 20 + Math.random() * 22;
      this.add.circle(fx, fy, 4, flowerColors[i % flowerColors.length]).setDepth(3);
      this.add.circle(fx, fy, 1.8, 0xffffff).setDepth(3);
    }
  }

  private spawnItem() {
    if (this.ended) return;
    const isBad = Math.random() < this.diff.junkChance;
    const key = isBad
      ? TEX.bad[Math.floor(Math.random() * TEX.bad.length)]
      : TEX.good[Math.floor(Math.random() * TEX.good.length)];
    const x = Phaser.Math.Between(30, GAME_W - 30);
    const item = this.items.create(x, -20, key) as FallingSprite;
    item.isBad = isBad;
    // Normaliza o tamanho na tela (frutas vêm em 64px, comidas em 18px)
    item.setDisplaySize(isBad ? 42 : 46, isBad ? 42 : 46);
    item.setDepth(4);
    // Ajusta a área de colisão ao tamanho visível
    const body = item.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(item.width * 0.42, item.width * 0.08, item.height * 0.08);
    body.setVelocityY(Phaser.Math.Between(this.diff.fallSpeedMin, this.diff.fallSpeedMax));
    item.setAngularVelocity(Phaser.Math.Between(-40, 40));
  }

  private catchItem(item: FallingSprite) {
    if (this.ended) return;
    const x = item.x;
    const y = item.y;
    const isBad = item.isBad;
    item.destroy();

    if (isBad) {
      this.lives -= 1;
      sfx.hit();
      this.cameras.main.shake(120, 0.008);
      this.cameras.main.flash(120, 255, 80, 80);
      this.floatText(x, y, '-1 ❤️', '#ef4444');
      if (this.lives <= 0) this.endGame();
    } else {
      this.score += 10;
      this.collected += 1;
      sfx.collect();
      this.emitter.explode(10, x, y);
      this.floatText(x, y, '+10', '#16a34a');
    }
    this.updateHud();
  }

  private floatText(x: number, y: number, msg: string, color: string) {
    const t = this.add
      .text(x, y, msg, { fontFamily: 'monospace', fontSize: '20px', color, fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: 0,
      duration: 700,
      onComplete: () => t.destroy(),
    });
  }

  private updateHud() {
    this.scoreText.setText(`🏆 ${this.score}`);
    this.timeText.setText(`⏱ ${Math.max(this.timeLeft, 0)}s`);
    this.livesText.setText('❤️'.repeat(Math.max(this.lives, 0)) || '💀');
  }

  update() {
    if (this.ended) return;

    // Teclado
    const speed = 420;
    const body = this.basket.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) body.setVelocityX(speed);
    else body.setVelocityX(0);

    // Limpa itens que passaram do fundo
    this.items.getChildren().forEach((obj) => {
      const item = obj as FallingSprite;
      if (item.y > GAME_H + 30) item.destroy();
    });
  }

  private endGame() {
    if (this.ended) return;
    this.ended = true;
    this.spawnTimer?.remove();
    this.countdown?.remove();

    const ratio = this.diff.targetScore > 0 ? this.score / this.diff.targetScore : 0;
    const stars: 0 | 1 | 2 | 3 = ratio >= 1 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;

    if (stars >= 2) sfx.win();
    else sfx.gameOver();

    const onGameOver = this.registry.get('onGameOver') as ((r: CacaFrutasResult) => void) | undefined;
    this.time.delayedCall(400, () => {
      onGameOver?.({ score: this.score, collected: this.collected, stars });
    });
  }
}
