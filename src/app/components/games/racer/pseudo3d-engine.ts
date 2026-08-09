// Motor de corrida pseudo-3D (estilo OutRun), adaptado da técnica do
// javascript-racer de Jake Gordon (MIT, https://github.com/jakesgordon/javascript-racer).
// Adaptado para o Nutritio: mundo de fantasia de frutas — dirija um kart-melancia,
// colete frutas, ultrapasse os karts rivais, desvie de besteiras e cruze a linha de chegada.

export interface RacerCallbacks {
  onScore: (score: number) => void;
  onLives: (lives: number) => void;
  onSpeed: (kmh: number) => void;
  onTime: (seconds: number) => void;
  onProgress: (pct: number) => void; // 0..1 até a linha de chegada
  onGameOver: (result: { score: number; collected: number; stars: 0 | 1 | 2 | 3; won: boolean }) => void;
}

interface Point {
  world: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
  screen: { x: number; y: number; w: number; scale: number };
}

interface Item {
  type: 'good' | 'bad';
  img: HTMLImageElement;
  offset: number; // -1..1 posição lateral na pista
  taken?: boolean;
}

interface TrafficCar {
  z: number;
  offset: number; // -1..1
  speed: number;
  sprite: HTMLCanvasElement;
  passed: boolean;
}

interface Segment {
  index: number;
  p1: Point;
  p2: Point;
  curve: number;
  color: 'light' | 'dark' | 'finish';
  clip: number;
  item?: Item;
}

const SEG_LEN = 200;
const RUMBLE_LEN = 3;
const ROAD_WIDTH = 2000;
const LANES = 3;
const DRAW_DIST = 220;
const CAMERA_HEIGHT = 1000;
const FOV = 100;
const FOG_DENSITY = 5;
const CENTRIFUGAL = 0.2;
const INVULN_TIME = 0.9; // segundos de invencibilidade após uma batida
const MAX_SPEED = SEG_LEN * 60; // px/seg
const ACCEL = MAX_SPEED / 5;
const OFFROAD_DECEL = -MAX_SPEED / 2;
const DECEL = -MAX_SPEED / 5;
const ITEM_SCALE = 0.0029; // frutas (boas)
const BAD_SCALE = 0.0044; // fast food (ruins) — maiores, mais visíveis como obstáculo
const CAR_SCALE = 0.0011; // karts rivais — maiores

const COLORS = {
  // mundo doce/fantasia: grama vibrante, bordas rosa-chiclete, faixas creme
  light: { road: '#7c7c8e', grass: '#79d861', rumble: '#ff5f9e', lane: '#fff4b8' },
  dark: { road: '#747486', grass: '#67cc4f', rumble: '#ffffff', lane: '' },
  finish: { road: '#222222', grass: '#79d861', rumble: '#222222', lane: '' },
};

function easeInOut(a: number, b: number, p: number) { return a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5); }

export class Pseudo3DRacer {
  private ctx: CanvasRenderingContext2D;
  private W: number;
  private H: number;
  private cb: RacerCallbacks;

  private segments: Segment[] = [];
  private cars: TrafficCar[] = [];
  private trackLength = 0;
  private finishIndex = 0;
  private finishZ = 0;
  private cameraDepth = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);
  private playerZ = CAMERA_HEIGHT * (1 / Math.tan(((FOV / 2) * Math.PI) / 180));

  private position = 0;
  private speed = 0;
  private playerX = 0; // -1..1
  private steer = 0; // -1,0,1
  private accelerating = true;
  private bgOffset = 0; // deslocamento suave da paisagem (parallax)
  private invuln = 0; // tempo restante de invencibilidade

  private score = 0;
  private collected = 0;
  private lives = 3;
  private timeLeft = 100;
  private lastSegmentIndex = 0;

  private skyline: HTMLCanvasElement;
  private carImg: HTMLCanvasElement;
  private rivalSprites: HTMLCanvasElement[];
  private goodImgs: HTMLImageElement[];
  private badImgs: HTMLImageElement[];

  private raf = 0;
  private lastT = 0;
  private timeAccum = 0;
  private running = false;
  private ended = false;

  constructor(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    assets: { good: HTMLImageElement[]; bad: HTMLImageElement[] },
    cb: RacerCallbacks
  ) {
    this.ctx = ctx;
    this.W = W;
    this.H = H;
    this.cb = cb;
    this.goodImgs = assets.good;
    this.badImgs = assets.bad;
    this.skyline = this.buildSkyline();
    this.carImg = this.buildKart({ body: '#3cb043', stripe: '#2f8a34', flesh: '#ff5b6e', seeds: true });
    this.rivalSprites = [
      this.buildKart({ body: '#ff9f1c', stripe: '#e07b00', flesh: '#ffd27f' }), // laranja
      this.buildKart({ body: '#5b7cf0', stripe: '#3f56c0', flesh: '#bcd0ff' }), // mirtilo
      this.buildKart({ body: '#9b59b6', stripe: '#7d3f99', flesh: '#e2c2ff' }), // uva
      this.buildKart({ body: '#ff5a5a', stripe: '#c62f2f', flesh: '#ffd0d0' }), // maçã
    ];
    this.buildTrack();
  }

  // ---- construção da pista ----
  private lastY() { return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].p2.world.y; }

  private addSegment(curve: number, y: number) {
    const n = this.segments.length;
    const prevY = this.lastY();
    this.segments.push({
      index: n,
      p1: { world: { x: 0, y: prevY, z: n * SEG_LEN }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } },
      p2: { world: { x: 0, y, z: (n + 1) * SEG_LEN }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } },
      curve,
      color: Math.floor(n / RUMBLE_LEN) % 2 ? 'dark' : 'light',
      clip: 0,
    });
  }

  private addRoad(enter: number, hold: number, leave: number, curve: number, height: number) {
    const startY = this.lastY();
    const endY = startY + height * SEG_LEN;
    const total = enter + hold + leave;
    for (let n = 0; n < enter; n++) this.addSegment(easeInOut(0, curve, n / enter), easeInOut(startY, endY, n / total));
    for (let n = 0; n < hold; n++) this.addSegment(curve, easeInOut(startY, endY, (enter + n) / total));
    for (let n = 0; n < leave; n++) this.addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total));
  }

  private buildTrack() {
    this.segments = [];
    const S = 25, M = 50, L = 100;
    const straight = (len: number) => this.addRoad(len, len, len, 0, 0);
    // curva: entrada/saída longas e suaves (S), miolo curto → sensação de fluidez
    const curveSeg = (len: number, curve: number, h = 0) =>
      this.addRoad(Math.floor(len * 1.4), Math.floor(len * 0.5), Math.floor(len * 1.4), curve, h);

    // pista longa (mas terminável no tempo): seções com curvas alternadas e ladeiras
    straight(M);
    const sections = 5;
    for (let k = 0; k < sections; k++) {
      const dir = k % 2 === 0 ? 1 : -1;
      curveSeg(M, dir * (2 + Math.random() * 2.5), Math.random() * 40 - 20);
      straight(S);
      curveSeg(L, -dir * (3 + Math.random() * 2.5), Math.random() * 30 - 10);
      straight(M);
    }
    straight(S);

    // linha de chegada (bandeira quadriculada)
    this.finishIndex = this.segments.length;
    for (let i = 0; i < 5; i++) this.addSegment(0, this.lastY());
    for (let i = this.finishIndex; i < this.finishIndex + 5; i++) this.segments[i].color = 'finish';

    // pista extra após a chegada só para o render preencher o horizonte
    for (let i = 0; i < DRAW_DIST + 20; i++) this.addSegment(0, this.lastY());

    this.finishZ = this.finishIndex * SEG_LEN;
    this.trackLength = this.segments.length * SEG_LEN;

    // frutas (boas) e besteiras (ruins) espalhadas
    for (let i = 30; i < this.finishIndex - 10; i += 7) {
      if (Math.random() < 0.7) {
        const bad = Math.random() < 0.38;
        const img = bad
          ? this.badImgs[Math.floor(Math.random() * this.badImgs.length)]
          : this.goodImgs[Math.floor(Math.random() * this.goodImgs.length)];
        const lane = [-0.6, 0, 0.6][Math.floor(Math.random() * 3)];
        this.segments[i].item = { type: bad ? 'bad' : 'good', img, offset: lane };
      }
    }

    // karts rivais para ultrapassar (espalhados ao longo da pista)
    this.cars = [];
    const carCount = 30;
    for (let k = 0; k < carCount; k++) {
      const seg = 60 + Math.floor(((this.finishIndex - 120) * (k + 0.5)) / carCount) + Math.floor(Math.random() * 10 - 5);
      const lane = [-0.55, 0, 0.55][Math.floor(Math.random() * 3)];
      const sprite = this.rivalSprites[Math.floor(Math.random() * this.rivalSprites.length)];
      const speed = MAX_SPEED * (0.26 + Math.random() * 0.16);
      this.cars.push({ z: seg * SEG_LEN, offset: lane, speed, sprite, passed: false });
    }
  }

  // ---- assets desenhados ----
  private buildSkyline(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 1600; c.height = 170;
    const g = c.getContext('2d')!;

    // arco-íris ao fundo
    const bands = ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc'];
    bands.forEach((col, i) => {
      g.strokeStyle = col;
      g.lineWidth = 7;
      g.beginPath();
      g.arc(c.width * 0.72, c.height + 20, 150 - i * 7, Math.PI, Math.PI * 2);
      g.stroke();
    });

    // colinas doces (verde pastel) na base
    const hill = (cx: number, r: number, col: string) => {
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(cx, c.height, r, r * 0.55, 0, Math.PI, Math.PI * 2);
      g.fill();
    };
    for (let x = 0; x < c.width; x += 190) hill(x + 90, 130, '#8fe36b');
    for (let x = 90; x < c.width; x += 210) hill(x, 100, '#69cc4f');

    // frutas gigantes no horizonte
    const giantFruit = (cx: number, r: number, body: string, leaf = true) => {
      g.fillStyle = body;
      g.beginPath();
      g.arc(cx, c.height - r * 0.7, r, 0, Math.PI * 2);
      g.fill();
      // brilho
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.beginPath();
      g.arc(cx - r * 0.35, c.height - r * 0.7 - r * 0.35, r * 0.28, 0, Math.PI * 2);
      g.fill();
      if (leaf) {
        g.fillStyle = '#3cb043';
        g.beginPath();
        g.ellipse(cx + r * 0.2, c.height - r * 1.55, r * 0.35, r * 0.16, -0.5, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#7a4a24';
        g.fillRect(cx - 2, c.height - r * 1.6, 4, r * 0.5);
      }
    };
    giantFruit(230, 60, '#ff5a5a');   // maçã
    giantFruit(560, 48, '#ff9f1c');   // laranja
    giantFruit(980, 66, '#c0392b');   // outra maçã
    giantFruit(1330, 52, '#9b59b6');  // uva

    // nuvens fofas
    g.fillStyle = 'rgba(255,255,255,0.9)';
    const cloud = (cx: number, cy: number, s: number) => {
      g.beginPath();
      g.arc(cx, cy, s, 0, Math.PI * 2);
      g.arc(cx + s, cy + 3, s * 0.8, 0, Math.PI * 2);
      g.arc(cx - s, cy + 3, s * 0.8, 0, Math.PI * 2);
      g.fill();
    };
    cloud(400, 34, 14); cloud(870, 26, 12); cloud(1180, 40, 16);

    return c;
  }

  private buildKart(opts: { body: string; stripe: string; flesh: string; seeds?: boolean }): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 82;
    const g = c.getContext('2d')!;
    const P = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

    // sombra
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(64, 76, 58, 8, 0, 0, Math.PI * 2); g.fill();
    // corpo (visão de trás)
    P(12, 30, 104, 34, opts.body);
    P(28, 14, 72, 18, opts.body);          // teto/cabine
    P(34, 18, 60, 11, '#20242e');           // vidro traseiro
    P(38, 20, 22, 6, '#3a4152');            // reflexo
    // listras de casca (verticais)
    for (let sx = 22; sx < 110; sx += 16) P(sx, 30, 5, 34, opts.stripe);
    // faixa de polpa
    P(12, 48, 104, 6, opts.flesh);
    // sementes (melancia)
    if (opts.seeds) { for (let sx = 20; sx < 108; sx += 14) P(sx, 50, 3, 4, '#20242e'); }
    // para-choque
    P(12, 56, 104, 8, opts.stripe);
    // lanternas
    P(18, 36, 15, 9, '#ffec6e'); P(95, 36, 15, 9, '#ffec6e');
    P(20, 38, 6, 4, '#fff7c2'); P(97, 38, 6, 4, '#fff7c2');
    // placa
    P(54, 45, 20, 8, '#f0f0f0');
    // rodas
    P(6, 48, 12, 18, '#1a1a1f'); P(110, 48, 12, 18, '#1a1a1f');
    // folha no topo (tema fruta)
    g.fillStyle = '#2ecc71'; g.beginPath(); g.ellipse(64, 12, 9, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7a4a24'; P(62, 6, 4, 8, '#7a4a24');
    return c;
  }

  // ---- projeção ----
  private project(p: Point, camX: number, camY: number, camZ: number) {
    p.camera.x = p.world.x - camX;
    p.camera.y = p.world.y - camY;
    p.camera.z = p.world.z - camZ;
    p.screen.scale = this.cameraDepth / p.camera.z;
    p.screen.x = Math.round(this.W / 2 + (p.screen.scale * p.camera.x * this.W) / 2);
    p.screen.y = Math.round(this.H / 2 - (p.screen.scale * p.camera.y * this.H) / 2);
    p.screen.w = Math.round((p.screen.scale * ROAD_WIDTH * this.W) / 2);
  }

  private findSegment(z: number) {
    const i = Math.floor(z / SEG_LEN);
    return this.segments[Math.max(0, Math.min(i, this.segments.length - 1))];
  }

  // ---- controles ----
  setSteer(dir: number) { this.steer = dir; }
  setAccelerating(v: boolean) { this.accelerating = v; }

  // ---- loop ----
  start() {
    this.running = true;
    this.ended = false;
    this.lastT = 0;
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame(t: number) {
    if (!this.running) return;
    const dt = this.lastT ? Math.min((t - this.lastT) / 1000, 0.05) : 1 / 60;
    this.lastT = t;
    this.update(dt);
    this.render();
    if (this.ended) { this.running = false; return; }
    this.raf = requestAnimationFrame((tt) => this.frame(tt));
  }

  private update(dt: number) {
    const playerSeg = this.findSegment(this.position + this.playerZ);
    const speedPct = this.speed / MAX_SPEED;
    const dx = dt * 2 * speedPct;

    const startPos = this.position;
    this.position += dt * this.speed;
    if (this.position >= this.trackLength) this.position = this.trackLength - 1;

    // parallax da paisagem: acumula suave conforme a pista curva (sem serrilhado)
    const delta = this.position - startPos;
    this.bgOffset -= (delta / SEG_LEN) * playerSeg.curve * 1.5;

    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);

    // direção
    if (this.steer < 0) this.playerX -= dx;
    else if (this.steer > 0) this.playerX += dx;
    // força centrífuga nas curvas
    this.playerX -= dx * speedPct * playerSeg.curve * CENTRIFUGAL;

    // aceleração
    if (this.accelerating) this.speed += ACCEL * dt;
    else this.speed += DECEL * dt;
    // fora da pista desacelera
    if ((this.playerX < -1 || this.playerX > 1) && this.speed > MAX_SPEED / 3) this.speed += OFFROAD_DECEL * dt;

    this.playerX = Math.max(-2, Math.min(2, this.playerX));
    this.speed = Math.max(0, Math.min(this.speed, MAX_SPEED));

    const playerFront = this.position + this.playerZ;

    // colisão com frutas/besteiras (segmentos percorridos neste frame)
    const curIndex = Math.min(Math.floor(playerFront / SEG_LEN), this.segments.length - 1);
    for (let idx = this.lastSegmentIndex; idx <= curIndex; idx++) {
      const seg = this.segments[idx];
      // colisão só quando realmente encosta: fast food mais estreito (não perde vida só passando perto),
      // fruta boa um pouco mais generoso pra facilitar a coleta
      const hit = seg.item && seg.item.type === 'bad' ? 0.26 : 0.5;
      if (seg.item && !seg.item.taken && Math.abs(this.playerX - seg.item.offset) < hit) {
        seg.item.taken = true;
        if (seg.item.type === 'good') {
          this.score += 10; this.collected += 1; this.cb.onScore(this.score);
        } else if (this.invuln <= 0) {
          this.lives -= 1; this.cb.onLives(this.lives);
          this.speed *= 0.5; this.invuln = INVULN_TIME;
          if (this.lives <= 0) { this.endGame(false); return; }
        }
      }
    }
    this.lastSegmentIndex = curIndex;

    // karts rivais: avançam e podem ser ultrapassados (bônus) ou batidos (dano)
    for (const car of this.cars) {
      car.z += car.speed * dt;
      if (!car.passed && playerFront > car.z) {
        car.passed = true;
        if (Math.abs(this.playerX - car.offset) < 0.62) {
          // batida traseira
          if (this.invuln <= 0) {
            this.lives -= 1; this.cb.onLives(this.lives);
            this.speed *= 0.5; this.invuln = INVULN_TIME;
            if (this.lives <= 0) { this.endGame(false); return; }
          }
        } else {
          // ultrapassagem limpa
          this.score += 5; this.cb.onScore(this.score);
        }
      }
    }

    this.cb.onSpeed(Math.round((this.speed / MAX_SPEED) * 220));
    this.cb.onProgress(Math.max(0, Math.min(1, playerFront / this.finishZ)));

    // chegou na linha de chegada?
    if (playerFront >= this.finishZ) { this.endGame(true); return; }

    // tempo
    this.timeAccum += dt;
    if (this.timeAccum >= 1) {
      this.timeAccum -= 1;
      this.timeLeft -= 1;
      this.cb.onTime(this.timeLeft);
      if (this.timeLeft <= 0) { this.endGame(false); return; }
    }
  }

  private endGame(won: boolean) {
    if (this.ended) return;
    this.ended = true;
    if (won) { this.score += 100; this.cb.onScore(this.score); }
    const target = 250;
    const ratio = this.score / target;
    let stars: 0 | 1 | 2 | 3 = ratio >= 1 ? 3 : ratio >= 0.55 ? 2 : this.score > 0 ? 1 : 0;
    if (won && stars < 1) stars = 1;
    this.cb.onGameOver({ score: this.score, collected: this.collected, stars, won });
  }

  // ---- render ----
  private render() {
    const ctx = this.ctx;
    const baseSegment = this.findSegment(this.position);
    const basePercent = (this.position % SEG_LEN) / SEG_LEN;
    const playerSegment = this.findSegment(this.position + this.playerZ);
    const playerPercent = ((this.position + this.playerZ) % SEG_LEN) / SEG_LEN;
    const playerY = easeInOut(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);

    // céu de fantasia (candy)
    const sky = ctx.createLinearGradient(0, 0, 0, this.H);
    sky.addColorStop(0, '#7ec8ff');
    sky.addColorStop(0.6, '#bfe3ff');
    sky.addColorStop(1, '#ffe9f4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.W, this.H);

    // cenário no horizonte (parallax suave acumulado — sem serrilhado)
    const horizon = this.H / 2;
    const skyOffset = this.bgOffset;
    ctx.save();
    ctx.globalAlpha = 0.97;
    const sx = ((skyOffset % this.skyline.width) + this.skyline.width) % this.skyline.width;
    for (let dxx = -sx; dxx < this.W; dxx += this.skyline.width) {
      ctx.drawImage(this.skyline, dxx, horizon - this.skyline.height);
    }
    ctx.restore();

    let maxy = this.H;
    let x = 0;
    let dx = -(baseSegment.curve * basePercent);
    const camY = CAMERA_HEIGHT + playerY;

    // desenha a pista (de perto para longe), sem loop
    for (let n = 0; n < DRAW_DIST; n++) {
      const segIndex = baseSegment.index + n;
      if (segIndex >= this.segments.length) break;
      const seg = this.segments[segIndex];
      seg.clip = maxy;

      this.project(seg.p1, this.playerX * ROAD_WIDTH - x, camY, this.position);
      this.project(seg.p2, this.playerX * ROAD_WIDTH - x - dx, camY, this.position);
      x += dx;
      dx += seg.curve;

      if (!isFinite(seg.p1.screen.y) || !isFinite(seg.p2.screen.y) || !isFinite(seg.p1.screen.w)) continue;
      if (seg.p1.camera.z <= this.cameraDepth || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxy) continue;

      // névoa: ~1 perto (sem overlay), ~0 longe (overlay cheio)
      const fog = Math.pow(Math.E, (-(n / DRAW_DIST) * (n / DRAW_DIST)) * FOG_DENSITY);
      this.renderSegment(seg, fog);
      maxy = seg.p1.screen.y;
    }

    // objetos (frutas/besteiras + karts) de longe para perto
    for (let n = DRAW_DIST - 1; n > 0; n--) {
      const segIndex = baseSegment.index + n;
      if (segIndex >= this.segments.length) continue;
      const seg = this.segments[segIndex];
      if (seg.item && !seg.item.taken && seg.p1.screen.scale > 0) {
        this.renderSprite(seg, seg.item.img, seg.item.offset, seg.item.type === 'bad' ? BAD_SCALE : ITEM_SCALE);
      }
    }

    // karts rivais (ordenados de trás para frente)
    const visibleCars = this.cars
      .filter((car) => {
        const i = Math.floor(car.z / SEG_LEN);
        return i >= baseSegment.index && i < baseSegment.index + DRAW_DIST && i < this.segments.length;
      })
      .sort((a, b) => b.z - a.z);
    for (const car of visibleCars) {
      const seg = this.segments[Math.floor(car.z / SEG_LEN)];
      if (seg.p1.screen.scale > 0) this.renderSprite(seg, car.sprite, car.offset, CAR_SCALE);
    }

    // carro do jogador (pisca durante a invencibilidade após uma batida)
    const blink = this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0;
    if (!blink) {
      const bounce = Math.sin(this.position / 30) * (this.speed / MAX_SPEED) * 2;
      const carW = 140 * (1 + (this.speed / MAX_SPEED) * 0.05);
      const carH = carW * (this.carImg.height / this.carImg.width);
      ctx.drawImage(this.carImg, this.W / 2 - carW / 2 + this.steer * 6, this.H - carH - 10 + bounce, carW, carH);
    }
  }

  private polygon(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  private renderSegment(seg: Segment, fog: number) {
    const c = COLORS[seg.color];
    const p1 = seg.p1.screen, p2 = seg.p2.screen;
    const r1 = this.rumbleWidth(p1.w), r2 = this.rumbleWidth(p2.w);
    const l1 = this.laneWidth(p1.w), l2 = this.laneWidth(p2.w);

    // grama
    this.ctx.fillStyle = c.grass;
    this.ctx.fillRect(0, p2.y, this.W, p1.y - p2.y);
    // rumble (bordas)
    this.polygon(p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y, c.rumble);
    this.polygon(p1.x + p1.w + r1, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + r2, p2.y, c.rumble);
    // pista
    this.polygon(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, c.road);

    if (seg.color === 'finish') {
      // bandeira quadriculada preto/branco
      const cols = 8;
      const rowDark = Math.floor(seg.index) % 2 === 0;
      for (let i = 0; i < cols; i++) {
        const t1a = i / cols, t1b = (i + 1) / cols;
        const xa1 = p1.x - p1.w + t1a * p1.w * 2, xa2 = p1.x - p1.w + t1b * p1.w * 2;
        const xb1 = p2.x - p2.w + t1a * p2.w * 2, xb2 = p2.x - p2.w + t1b * p2.w * 2;
        const white = (i % 2 === 0) === rowDark;
        this.polygon(xa1, p1.y, xa2, p1.y, xb2, p2.y, xb1, p2.y, white ? '#ffffff' : '#111111');
      }
    } else if (c.lane) {
      const lanew1 = (p1.w * 2) / LANES, lanew2 = (p2.w * 2) / LANES;
      let lx1 = p1.x - p1.w + lanew1, lx2 = p2.x - p2.w + lanew2;
      for (let lane = 1; lane < LANES; lane++, lx1 += lanew1, lx2 += lanew2) {
        this.polygon(lx1 - l1 / 2, p1.y, lx1 + l1 / 2, p1.y, lx2 + l2 / 2, p2.y, lx2 - l2 / 2, p2.y, c.lane);
      }
    }

    // névoa ao fundo
    if (fog < 1) {
      this.ctx.globalAlpha = 1 - fog;
      this.ctx.fillStyle = '#e7f0ff';
      this.ctx.fillRect(0, p2.y, this.W, p1.y - p2.y);
      this.ctx.globalAlpha = 1;
    }
  }

  private renderSprite(seg: Segment, img: CanvasImageSource, offset: number, scaleK: number) {
    const p = seg.p1.screen;
    // segmento atrás da câmera / fora de vista → escala inválida; nunca desenhar (evita drawImage com NaN)
    if (!isFinite(p.scale) || !isFinite(p.x) || p.scale <= 0) return;
    const iw = (img as HTMLImageElement | HTMLCanvasElement).width;
    const ih = (img as HTMLImageElement | HTMLCanvasElement).height;
    const destW = (iw * p.scale * this.W) / 2 * (scaleK * ROAD_WIDTH);
    const destH = destW * (ih / iw);
    const destX = p.x + p.scale * offset * ROAD_WIDTH * (this.W / 2) - destW / 2;
    const destY = p.y - destH;
    if (!isFinite(destW) || !isFinite(destX) || !isFinite(destY) || destW < 4 || destW > this.W * 3) return;
    if (destY + destH > seg.clip + 6) return; // ocluído por ladeira
    this.ctx.drawImage(img, destX, destY, destW, destH);
  }

  private rumbleWidth(projectedRoadWidth: number) { return projectedRoadWidth / Math.max(6, 2 * LANES); }
  private laneWidth(projectedRoadWidth: number) { return projectedRoadWidth / Math.max(32, 8 * LANES); }
}
