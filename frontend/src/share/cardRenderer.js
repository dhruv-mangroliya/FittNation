/*
 * Canvas renderer for the FittNation share card (Instagram-story size).
 * Every animation loops over LOOP_MS so exported videos loop seamlessly.
 */
export const W = 1080;
export const H = 1920;
export const LOOP_MS = 5000;

const RED = '#E3271B';
const RED_DARK = '#7d120b';
const GOLD = '#D4AF5A';
const GOLD_LIGHT = '#F3D98B';
const WHITE = '#F4F4F2';

/* deterministic random so particles are identical every loop */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const STREAKS = Array.from({ length: 46 }, () => ({
  x: rand() * W * 1.6 - W * 0.3,
  y: rand() * H,
  len: 180 + rand() * 520,
  w: 2 + rand() * 7,
  speed: 1 + Math.floor(rand() * 3),
  alpha: 0.15 + rand() * 0.55,
}));
const PARTICLES = Array.from({ length: 70 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 2 + rand() * 7,
  speed: 1 + Math.floor(rand() * 2),
  drift: rand() * 40 - 20,
  phase: rand(),
}));

export const TEMPLATES = [
  { id: 'pulse', name: 'Pulse', swatch: `radial-gradient(circle at 50% 40%, ${RED}, #120404 70%)` },
  { id: 'velocity', name: 'Velocity', swatch: `linear-gradient(135deg, #ff6b4a, ${RED} 45%, #1a0503)` },
  { id: 'gold', name: 'Gold', swatch: `radial-gradient(circle at 50% 30%, #4a3a15, #0b0906 70%)` },
  { id: 'original', name: 'Original', swatch: 'linear-gradient(180deg, #555, #111)' },
];

/* ── backgrounds ─────────────────────────────── */

function drawPulse(ctx, t) {
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.42, H * 0.8);
  g.addColorStop(0, '#5a0d08');
  g.addColorStop(0.45, '#220605');
  g.addColorStop(1, '#070707');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 40; y < H; y += 60) for (let x = 30; x < W; x += 60) ctx.fillRect(x, y, 3, 3);

  // expanding rings (heartbeat)
  for (let i = 0; i < 4; i++) {
    const p = (t + i / 4) % 1;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.42, 120 + p * 1100, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(227,39,27,${0.55 * (1 - p)})`;
    ctx.lineWidth = 6 - p * 4;
    ctx.stroke();
  }

  // ECG sweep
  const y0 = H * 0.3;
  const pts = [[0, 0], [300, 0], [340, 0], [380, -160], [430, 170], [470, -70], [510, 0], [W, 0]];
  ctx.save();
  ctx.lineWidth = 8;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = RED;
  ctx.shadowColor = RED;
  ctx.shadowBlur = 30;
  ctx.setLineDash([2400]);
  ctx.lineDashOffset = 2400 - ((t * 2) % 1) * 2400 * 1.4;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  pts.forEach(([x, dy], i) => (i ? ctx.lineTo(x, y0 + dy) : ctx.moveTo(x, y0 + dy)));
  ctx.stroke();
  ctx.restore();
}

function drawVelocity(ctx, t, headline) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#ff5a3a');
  g.addColorStop(0.4, RED);
  g.addColorStop(1, '#160403');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // giant outlined headline sliding behind the athlete
  ctx.save();
  ctx.font = '520px "Bebas Neue", Impact, sans-serif';
  ctx.textBaseline = 'middle';
  const word = (headline || 'FITTNATION').toUpperCase();
  const tw = ctx.measureText(word + '  ').width;
  const off = -(t * tw);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  for (let k = -1; k < 3; k++) ctx.strokeText(word, off + k * tw, H * 0.36);
  ctx.restore();

  // diagonal speed streaks
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.38);
  ctx.translate(-W / 2, -H / 2);
  STREAKS.forEach((s) => {
    const x = ((s.x + t * s.speed * W * 1.6) % (W * 1.6)) - W * 0.3;
    const lg = ctx.createLinearGradient(x, 0, x + s.len, 0);
    lg.addColorStop(0, 'rgba(255,255,255,0)');
    lg.addColorStop(1, `rgba(255,255,255,${s.alpha})`);
    ctx.fillStyle = lg;
    ctx.fillRect(x, s.y, s.len, s.w);
  });
  ctx.restore();
}

function drawGold(ctx, t) {
  const g = ctx.createRadialGradient(W / 2, H * 0.35, 40, W / 2, H * 0.4, H * 0.85);
  g.addColorStop(0, '#4a3a15');
  g.addColorStop(0.5, '#15110a');
  g.addColorStop(1, '#060504');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // rotating light rays
  ctx.save();
  ctx.translate(W / 2, H * 0.38);
  ctx.rotate(t * Math.PI * 2 / 6);
  for (let i = 0; i < 12; i++) {
    ctx.rotate((Math.PI * 2) / 12);
    const rg = ctx.createLinearGradient(0, 0, 0, -1400);
    rg.addColorStop(0, 'rgba(243,217,139,0.16)');
    rg.addColorStop(1, 'rgba(243,217,139,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-70, -1400);
    ctx.lineTo(70, -1400);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  drawParticles(ctx, t, GOLD_LIGHT);
}

function drawParticles(ctx, t, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  PARTICLES.forEach((p) => {
    const y = (((p.y - t * p.speed * H) % H) + H) % H;
    const x = p.x + Math.sin((t + p.phase) * Math.PI * 2) * p.drift;
    ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin((t * p.speed + p.phase) * Math.PI));
    ctx.beginPath();
    ctx.arc(x, y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/* ── photo helpers ───────────────────────────── */

function coverRect(iw, ih) {
  const s = Math.max(W / iw, H / ih);
  const w = iw * s;
  const h = ih * s;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

function drawPhoto(ctx, img, t, glow) {
  const r = coverRect(img.width, img.height);
  // gentle breathing zoom, symmetric so the loop is seamless
  const z = 1 + 0.02 * (1 - Math.cos(t * Math.PI * 2)) / 2;
  const w = r.w * z;
  const h = r.h * z;
  ctx.save();
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 60;
  }
  ctx.drawImage(img, r.x - (w - r.w) / 2, r.y - (h - r.h) / 2, w, h);
  ctx.restore();
}

/* ── overlay (stats + branding) ──────────────── */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* animate the leading number of a value like "100 KG" or "1,250" */
function animatedValue(raw, prog) {
  const str = String(raw ?? '').trim();
  const m = str.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return str;
  const num = parseFloat(m[1].replace(/,/g, ''));
  if (!isFinite(num)) return str;
  const decimals = (m[1].split('.')[1] || '').length;
  const v = num * (1 - Math.pow(1 - prog, 3));
  const shown = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-IN');
  return shown + m[2];
}

function fitFont(ctx, text, maxW, start, min, family) {
  let size = start;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 6;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

const DISPLAY = '"Bebas Neue", Impact, sans-serif';

function drawOverlay(ctx, t, { logo, headline, name, dateLabel, stats = [], pr, accent }) {
  const cols = stats.filter((s) => String(s.label || s.value || '').trim()).slice(0, 4);
  const hasPr = pr && String(pr.exercise || pr.value || '').trim();
  const prog = Math.min(1, t / 0.3);

  // layout (bottom-up)
  const panelH = 300;
  const panelTop = cols.length ? H - 520 : H - 220;
  const base = panelTop - 70; // headline baseline
  const topOfText = base - 200 - (hasPr ? 120 : 0);

  // legibility gradients
  let g = ctx.createLinearGradient(0, 0, 0, 360);
  g.addColorStop(0, 'rgba(0,0,0,0.65)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 360);
  const gTop = Math.max(0, topOfText - 260);
  g = ctx.createLinearGradient(0, gTop, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.35, 'rgba(0,0,0,0.72)');
  g.addColorStop(1, 'rgba(0,0,0,0.95)');
  ctx.fillStyle = g;
  ctx.fillRect(0, gTop, W, H - gTop);

  // header: logo + wordmark + date
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 140, 64, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logo, 66, 76, 128, 128);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(130, 140, 66, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.textBaseline = 'alphabetic';
  ctx.font = `84px ${DISPLAY}`;
  ctx.fillStyle = WHITE;
  ctx.fillText('FITT', 222, 160);
  const fw = ctx.measureText('FITT').width;
  ctx.fillStyle = accent;
  ctx.fillText('NATION', 222 + fw, 160);

  if (dateLabel) {
    ctx.font = '600 30px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'right';
    ctx.fillText(dateLabel.toUpperCase(), W - 70, 152);
    ctx.textAlign = 'left';
  }

  // PR badge
  if (hasPr) {
    const y = base - 320;
    const label = 'NEW PR';
    const detail = [pr.exercise, animatedValue(pr.value, prog)].filter((x) => String(x || '').trim()).join('  ·  ').toUpperCase();
    ctx.font = '800 30px Inter, Arial, sans-serif';
    const lw = ctx.measureText(label).width;
    fitFont(ctx, detail, W - 140 - lw - 120, 64, 34, DISPLAY);
    const dw = ctx.measureText(detail).width;
    const bw = lw + 70 + dw + 50;
    // pop-in scale
    const pop = Math.min(1, t / 0.12);
    const sc = 0.85 + 0.15 * (1 - Math.pow(1 - pop, 3));
    ctx.save();
    ctx.translate(70, y);
    ctx.scale(sc, sc);
    roundRect(ctx, 0, -62, bw, 86, 43);
    const bg = ctx.createLinearGradient(0, 0, bw, 0);
    bg.addColorStop(0, GOLD);
    bg.addColorStop(1, GOLD_LIGHT);
    ctx.fillStyle = bg;
    ctx.shadowColor = 'rgba(243,217,139,0.6)';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0A0A0B';
    ctx.font = '800 30px Inter, Arial, sans-serif';
    ctx.fillText(label, 34, -8);
    ctx.fillRect(34 + lw + 22, -44, 3, 50);
    fitFont(ctx, detail, W - 140 - lw - 120, 64, 34, DISPLAY);
    ctx.fillText(detail, 34 + lw + 48, 2);
    ctx.restore();
  }

  // name line
  const who = String(name || '').trim();
  ctx.font = '700 32px Inter, Arial, sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(who ? `${who.toUpperCase()} · WORKOUT COMPLETE` : 'WORKOUT COMPLETE', 74, base - 200);

  // headline with sweeping shine
  const hl = (headline || 'BEAST MODE').toUpperCase();
  fitFont(ctx, hl, W - 140, 210, 90, DISPLAY);
  const sheen = ctx.createLinearGradient(0, 0, W, 0);
  const sp = ((t * 1.4) % 1.4) - 0.2;
  sheen.addColorStop(0, WHITE);
  sheen.addColorStop(Math.max(0, Math.min(1, sp)), WHITE);
  sheen.addColorStop(Math.max(0, Math.min(1, sp + 0.08)), accent);
  sheen.addColorStop(Math.max(0, Math.min(1, sp + 0.16)), WHITE);
  sheen.addColorStop(1, WHITE);
  ctx.fillStyle = sheen;
  ctx.fillText(hl, 70, base);

  // stats glass panel
  if (cols.length) {
    const px = 60;
    const pw = W - 120;
    ctx.save();
    roundRect(ctx, px, panelTop, pw, panelH, 44);
    ctx.fillStyle = 'rgba(20,20,24,0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    const cw = pw / cols.length;
    cols.forEach((s, i) => {
      const cx = px + cw * i + cw / 2;
      if (i) {
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fillRect(px + cw * i, panelTop + 60, 2, panelH - 120);
      }
      const val = animatedValue(String(s.value || '—').toUpperCase(), prog);
      ctx.textAlign = 'center';
      // size against the final value so the font doesn't jump while counting
      fitFont(ctx, String(s.value || '—').toUpperCase(), cw - 40, 128, 54, DISPLAY);
      ctx.fillStyle = WHITE;
      ctx.fillText(val, cx, panelTop + 165);
      ctx.font = '700 26px Inter, Arial, sans-serif';
      const lbl = String(s.label || '').toUpperCase();
      let ls = 26;
      while (ctx.measureText(lbl).width > cw - 30 && ls > 16) {
        ls -= 2;
        ctx.font = `700 ${ls}px Inter, Arial, sans-serif`;
      }
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(lbl, cx, panelTop + 225);
    });
    ctx.textAlign = 'left';
  }

  // footer
  ctx.font = '600 30px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('@fittnation.gym  ·  FITNESS · SPORTS · STRENGTH', W / 2, H - 110);
  ctx.textAlign = 'left';
  ctx.fillStyle = accent;
  ctx.fillRect(W / 2 - 60, H - 70, 120, 6);
}

/**
 * Draw one frame.
 * opts: { template, photo, cutout, headline, name, dateLabel, stats: [{label, value}], pr: {exercise, value} | null, logo }
 */
export function drawFrame(ctx, tMs, opts) {
  const t = (tMs % LOOP_MS) / LOOP_MS;
  const { template, photo, cutout } = opts;
  const accent = template === 'gold' ? GOLD : RED;

  ctx.clearRect(0, 0, W, H);

  if (template === 'original' || !cutout) {
    if (photo) drawPhoto(ctx, photo, t);
    else {
      ctx.fillStyle = '#0a0a0b';
      ctx.fillRect(0, 0, W, H);
    }
    if (template === 'original') drawParticles(ctx, t, '#ff7a55');
    else {
      // tint the full photo toward the template when no cutout is available
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = template === 'gold' ? GOLD : template === 'velocity' ? '#ff4a2a' : RED_DARK;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  } else {
    if (template === 'pulse') drawPulse(ctx, t);
    else if (template === 'velocity') drawVelocity(ctx, t, opts.headline);
    else if (template === 'gold') drawGold(ctx, t);
    drawPhoto(ctx, cutout, t, template === 'gold' ? 'rgba(243,217,139,0.55)' : 'rgba(255,90,60,0.6)');
    if (template === 'pulse') drawParticles(ctx, t, 'rgba(255,120,90,0.9)');
  }

  drawOverlay(ctx, t, { ...opts, accent });
}
