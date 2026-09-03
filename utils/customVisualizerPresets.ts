export interface CustomJsPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  code: string;
}

/**
 * Intelligent Code Cleaner & Auto-Fixer
 * Strips markdown code fences (```javascript ... ```), rogue backticks, function wrappers,
 * and dangerous opaque background fills so ChatGPT / Gemini code works 100% out of the box!
 */
export function cleanCustomJsCode(rawCode: string): string {
  if (!rawCode) return '';
  let code = rawCode.trim();

  // 1. Remove markdown fences at start or end or embedded in between
  code = code.replace(/```(?:javascript|js|ts|html|css)?/gi, '');
  code = code.replace(/```/g, '');

  // 2. If the user code is wrapped inside a function declaration like `function render(...) { ... }` or `(ctx, canvas) => { ... }`
  const functionWrapperMatch = code.match(/^\s*(?:(?:export\s+default\s+)?(?:async\s+)?function(?:\s+\w+)?\s*\([^)]*\)\s*\{|(?:\(?\s*ctx\s*,\s*canvas[^)]*\)?\s*=>\s*\{))([\s\S]*)\}\s*;?\s*$/);
  if (functionWrapperMatch && functionWrapperMatch[1]) {
    code = functionWrapperMatch[1].trim();
  }

  // 3. Remove accidental full black / dark opaque fillRects that wipe the user's background video / image
  code = code.replace(/ctx\.fillRect\s*\(\s*0\s*,\s*0\s*,\s*(?:w|canvas\.width|width)\s*,\s*(?:h|canvas\.height|height)\s*\)\s*;?/gi, '// [Auto-cleaned full screen fillRect to protect background video]');

  return code.trim();
}

export const AI_VISUALIZER_PROMPT_TEMPLATE = `Bạn là một lập trình viên chuyên nghiệp về HTML5 Canvas và Audio Visualization.
Hãy viết MÃ JAVASCRIPT THUẦN (pure JS) để vẽ một Audio Waveform / Visualizer nghệ thuật độc đáo.

### QUY TẮC BẮT BUỘC (STRICT RULES):
1. CHỈ TRẢ VỀ MÃ JAVASCRIPT BÊN TRONG FUNCTION BODY (TUYỆT ĐỐI không chèn ký tự \`\`\` trong code, không viết function wrapper, không viết thẻ HTML).
2. Mã của bạn sẽ được thực thi mỗi khung hình (frame-by-frame) với các biến đầu vào có sẵn:
   - \`ctx\` (CanvasRenderingContext2D): Context 2D của Canvas để vẽ đồ họa.
   - \`canvas\` (HTMLCanvasElement): Canvas hiện tại với \`canvas.width\` và \`canvas.height\`.
   - \`dataArray\` (Uint8Array): Mảng chứa dữ liệu tần số âm thanh từ 0 đến 255 (độ dài thông thường 64-256 phần tử).
   - \`time\` (number): Dấu thời gian hiện tại tính bằng giây (dùng cho chuyển động xoay, sóng sine, v.v.).
3. NỀN CANVAS TRONG SUỐT: KHÔNG dùng \`ctx.fillRect(0,0,width,height)\` với màu tối (vì sẽ che mất video/ảnh nền).
4. KHÔNG gọi \`requestAnimationFrame\` hay \`setInterval\` (hệ thống tự động render mỗi frame).
5. Sử dụng \`ctx.save()\` và \`ctx.restore()\` nếu bạn dùng \`translate\`, \`rotate\`, \`scale\`, hoặc \`clip\`.
6. Tọa độ phải tự động co giãn theo \`canvas.width\` và \`canvas.height\` (hỗ trợ cả video dọc 9:16 và ngang 16:9).

### YÊU CẦU PHONG CÁCH CỤ THỂ CỦA TÔI:
[MÔ TẢ Ý TƯỞNG CỦA BẠN VÀO ĐÂY, VÍ DỤ: "Vẽ vòng tròn Neon Cyberpunk phát sáng xoay 360 độ, các tia sóng nhảy theo bass, có hiệu ứng hạt phát sáng tỏa ra xung quanh theo màu tím cyan"]`;

export const CUSTOM_JS_PRESETS: CustomJsPreset[] = [
  {
    id: 'lofi_vibes_widescreen',
    name: 'Lofi Vibes Widescreen 360°',
    category: 'Renderforest',
    icon: 'fa-record-vinyl',
    description: 'Visualizer Renderforest Lofi Vibes: Đĩa xoay Vinyl Artwork, hào quang Pastel, hạt bụi phát sáng và dải sóng 360° siêu mượt',
    code: `// LOFI VIBES WIDESCREEN 360° (RENDERFOREST STYLE)
const w = canvas.width;
const h = canvas.height;
const cx = w / 2;
const cy = h / 2;
const len = dataArray.length;

// 1. Calculate Average Bass Energy
let bassSum = 0;
const bassCount = Math.floor(len * 0.15);
for (let i = 0; i < bassCount; i++) bassSum += dataArray[i];
const bassNorm = (bassSum / (bassCount * 255));
const bassPulse = Math.pow(bassNorm, 1.4) * 26;

const baseR = Math.min(w, h) * 0.18;
const currentR = baseR + bassPulse;

// 2. Ambient Floating Lofi Dust & Glow Particles
if (!ctx.__lofiParticles) {
  ctx.__lofiParticles = Array.from({ length: 50 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1.5 + Math.random() * 3,
    speedY: 0.3 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.2 + Math.random() * 0.6,
    hue: Math.random() > 0.5 ? 330 : 270
  }));
}

ctx.save();
ctx.__lofiParticles.forEach(p => {
  p.y -= p.speedY + bassNorm * 1.5;
  p.x += Math.sin(time * 1.2 + p.phase) * 0.5;
  if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
  if (p.x < -20) p.x = w + 20;
  if (p.x > w + 20) p.x = -20;

  ctx.fillStyle = \`hsla(\${p.hue}, 80%, 75%, \${p.alpha * (0.6 + bassNorm * 0.5)})\`;
  ctx.shadowColor = \`hsla(\${p.hue}, 90%, 70%, 0.8)\`;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
});
ctx.shadowBlur = 0;
ctx.restore();

// 3. Radial Frequency Bars 360°
const numBars = 68;
const angleStep = (Math.PI * 2) / numBars;
const spin = time * 0.3;

ctx.save();
for (let i = 0; i < numBars; i++) {
  const ang = i * angleStep + spin;
  const idx = Math.floor((i < numBars / 2 ? i : numBars - i) * (len / (numBars / 2)));
  const val = dataArray[idx] || 0;
  const norm = val / 255;
  const barH = Math.max(4, Math.pow(norm, 1.3) * 130);

  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  const x1 = cx + cos * (currentR + 6);
  const y1 = cy + sin * (currentR + 6);
  const x2 = cx + cos * (currentR + 6 + barH);
  const y2 = cy + sin * (currentR + 6 + barH);

  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, '#f472b6'); // pastel pink
  grad.addColorStop(0.5, '#c084fc'); // lavender
  grad.addColorStop(1, '#38bdf8'); // sky blue

  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(2, angleStep * currentR * 0.55);
  ctx.lineCap = 'round';
  ctx.shadowColor = '#f472b6';
  ctx.shadowBlur = 6;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Peak dots
  if (barH > 20) {
    const dotX = cx + cos * (currentR + 14 + barH);
    const dotY = cy + sin * (currentR + 14 + barH);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
ctx.shadowBlur = 0;
ctx.restore();

// 4. Center Vinyl Record Disk
ctx.save();
// Glowing Aura
const aura = ctx.createRadialGradient(cx, cy, currentR * 0.7, cx, cy, currentR * 1.3);
aura.addColorStop(0, 'rgba(244, 114, 182, 0.3)');
aura.addColorStop(0.6, 'rgba(192, 132, 252, 0.15)');
aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
ctx.fillStyle = aura;
ctx.beginPath();
ctx.arc(cx, cy, currentR * 1.3, 0, Math.PI * 2);
ctx.fill();

// Black Vinyl Base
ctx.fillStyle = '#141416';
ctx.shadowColor = 'rgba(0,0,0,0.6)';
ctx.shadowBlur = 20;
ctx.beginPath();
ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
ctx.fill();
ctx.shadowBlur = 0;

// Vinyl Grooves
ctx.strokeStyle = 'rgba(255,255,255,0.08)';
ctx.lineWidth = 1;
for (let r = currentR * 0.55; r < currentR - 6; r += 7) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

// Center Label (Rotates)
const labelR = currentR * 0.52;
ctx.save();
ctx.translate(cx, cy);
ctx.rotate(time * 0.8);
ctx.beginPath();
ctx.arc(0, 0, labelR, 0, Math.PI * 2);
ctx.clip();

const discImg = (typeof params !== 'undefined' && (params.logoImage || params.bgImage)) || null;
if (discImg && discImg.complete && discImg.naturalWidth > 0) {
  const iw = discImg.naturalWidth || discImg.width;
  const ih = discImg.naturalHeight || discImg.height;
  let sx = 0, sy = 0, sW = iw, sH = ih;
  if (iw > ih) { sW = ih; sx = (iw - ih) / 2; }
  else { sH = iw; sy = (ih - iw) / 2; }
  ctx.drawImage(discImg, sx, sy, sW, sH, -labelR, -labelR, labelR * 2, labelR * 2);
} else {
  const labelGrad = ctx.createLinearGradient(-labelR, -labelR, labelR, labelR);
  labelGrad.addColorStop(0, '#f472b6');
  labelGrad.addColorStop(0.5, '#c084fc');
  labelGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = labelGrad;
  ctx.fillRect(-labelR, -labelR, labelR * 2, labelR * 2);

  // Center Note Symbol
  ctx.fillStyle = '#ffffff';
  ctx.font = \`bold \${Math.round(labelR * 0.6)}px sans-serif\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♫', 0, 0);
}

ctx.restore();

// Outer Ring
ctx.strokeStyle = '#f472b6';
ctx.lineWidth = 2.5;
ctx.shadowColor = '#f472b6';
ctx.shadowBlur = 12;
ctx.beginPath();
ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
ctx.stroke();
ctx.restore();`
  },
  {
    id: 'cosmic_spectra_ring',
    name: 'Cosmic Spectra Ring 360°',
    category: 'Circular',
    icon: 'fa-sun',
    description: 'Vòng tròn quang phổ vũ trụ siêu mượt với dải tia Cyan/Violet, Peak Spark và sóng xung kích Bass',
    code: `// COSMIC SPECTRA RING 360°
const w = canvas.width;
const h = canvas.height;
const cx = w * 0.5;
const cy = h * 0.5;
const minDim = Math.min(w, h);

if (!ctx.__spectra) {
  ctx.__spectra = {
    smooth: new Float32Array(256),
    peaks: new Float32Array(256),
    pulse: 0,
    rot: 0
  };
}

const S = ctx.__spectra;
const N = dataArray.length;
const smooth = S.smooth;
const peaks = S.peaks;

const bassCount = Math.max(2, Math.floor(N * 0.10));
let bass = 0;

for (let i = 0; i < N; i++) {
  const v = (dataArray[i] || 0) / 255;
  const prev = smooth[i] || 0;

  // Ultra-smooth spectral interpolation
  smooth[i] = prev + (v - prev) * (v > prev ? 0.28 : 0.12);

  // Peak hold
  if (smooth[i] > peaks[i]) {
    peaks[i] += (smooth[i] - peaks[i]) * 0.45;
  } else {
    peaks[i] *= 0.965;
  }

  if (i < bassCount) bass += smooth[i];
}

bass /= bassCount;
S.pulse += ((bass * bass - S.pulse) * 0.16);
S.rot += 0.0015 + bass * 0.004;

const pulse = S.pulse;
const baseRadius = minDim * (0.205 + pulse * 0.045);
const maxRadius = minDim * 0.27;

// Deep central aura
ctx.save();
ctx.translate(cx, cy);

const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius * 1.9);
aura.addColorStop(0, "rgba(0,255,255,0.12)");
aura.addColorStop(0.28, "rgba(100,40,255,0.06)");
aura.addColorStop(0.65, "rgba(0,180,255,0.02)");
aura.addColorStop(1, "rgba(0,0,0,0)");

ctx.fillStyle = aura;
ctx.beginPath();
ctx.arc(0, 0, maxRadius * 1.9, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Rotating spectral rings
ctx.save();
ctx.translate(cx, cy);
ctx.rotate(S.rot * 0.35);

ctx.globalCompositeOperation = "lighter";

for (let ring = 0; ring < 3; ring++) {
  const rr = baseRadius + ring * minDim * 0.027;
  ctx.beginPath();
  ctx.arc(0, 0, rr, 0, Math.PI * 2);

  ctx.lineWidth = ring === 0 ? 1.5 : 0.7;
  ctx.strokeStyle =
    ring === 0
      ? "rgba(0,255,255,0.4)"
      : ring === 1
      ? "rgba(120,80,255,0.25)"
      : "rgba(0,180,255,0.15)";

  ctx.shadowBlur = ring === 0 ? 12 : 5;
  ctx.shadowColor = "#00ffff";
  ctx.stroke();
}

ctx.restore();

// Main radial spectrum
ctx.save();
ctx.translate(cx, cy);
ctx.rotate(S.rot);

ctx.globalCompositeOperation = "lighter";

const step = (Math.PI * 2) / N;

for (let i = 0; i < N; i++) {
  const p = i / N;
  const mapped = Math.pow(p, 0.72);
  const idx = Math.min(N - 1, (mapped * N) | 0);

  const v = smooth[idx] || 0;
  const peak = peaks[idx] || 0;

  if (v < 0.012) continue;

  const angle = i * step;
  const bassBoost = idx < bassCount ? 1.18 : 1;
  const barLength = minDim * (0.018 + Math.pow(v, 1.12) * 0.105) * bassBoost;

  const inner = baseRadius;
  const outer = inner + barLength;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const x1 = cos * inner;
  const y1 = sin * inner;
  const x2 = cos * outer;
  const y2 = sin * outer;

  const hue = 180 + Math.sin(p * 8 + time * 0.7) * 45 + v * 55;

  ctx.strokeStyle = "hsla(" + hue + ",100%," + (58 + v * 25) + "%," + (0.48 + v * 0.52) + ")";
  ctx.lineWidth = Math.max(1, minDim * 0.0035 * (0.7 + v * 1.8));
  ctx.shadowBlur = 7 + v * 18;
  ctx.shadowColor = "#00eaff";

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Peak spark
  if (peak > 0.22) {
    const peakRadius = inner + minDim * (0.018 + peak * 0.105) * bassBoost;
    const px = cos * peakRadius;
    const py = sin * peakRadius;

    ctx.fillStyle = "hsla(" + (hue + 25) + ",100%,85%," + Math.min(1, peak * 1.3) + ")";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#8fffff";

    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.2, minDim * 0.0035), 0, Math.PI * 2);
    ctx.fill();
  }
}

ctx.restore();

// Mirrored secondary spectrum
ctx.save();
ctx.translate(cx, cy);
ctx.rotate(-S.rot * 0.62);
ctx.globalCompositeOperation = "lighter";

for (let i = 0; i < N; i += 2) {
  const v = smooth[i] || 0;
  if (v < 0.025) continue;

  const angle = i * step;
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  const inner = baseRadius * 0.88;
  const outer = inner + minDim * (0.012 + Math.pow(v, 1.35) * 0.055);

  ctx.strokeStyle = "rgba(100,80,255," + (0.12 + v * 0.32) + ")";
  ctx.lineWidth = Math.max(0.7, minDim * 0.0017);
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#6d5cff";

  ctx.beginPath();
  ctx.moveTo(c * inner, s * inner);
  ctx.lineTo(c * outer, s * outer);
  ctx.stroke();
}

ctx.restore();

// Bass shockwave rings
ctx.save();
ctx.translate(cx, cy);
ctx.globalCompositeOperation = "lighter";

for (let k = 0; k < 3; k++) {
  const wave = (time * (0.18 + pulse * 0.5) + k * 0.34) % 1;
  const radius = baseRadius * (1.05 + wave * (0.9 + pulse * 0.8));
  const alpha = (1 - wave) * pulse * 0.18;

  if (alpha > 0.005) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(1, minDim * 0.002);
    ctx.strokeStyle = "rgba(0,230,255," + alpha + ")";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#00ffff";
    ctx.stroke();
  }
}

ctx.restore();

// Elegant central core
ctx.save();
ctx.translate(cx, cy);
ctx.globalCompositeOperation = "lighter";

const coreRadius = minDim * (0.018 + pulse * 0.012);
const core = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 3.5);
core.addColorStop(0, "rgba(255,255,255,0.95)");
core.addColorStop(0.12, "rgba(120,255,255,0.9)");
core.addColorStop(0.35, "rgba(0,220,255,0.38)");
core.addColorStop(1, "rgba(0,100,255,0)");

ctx.fillStyle = core;
ctx.shadowBlur = 25 + pulse * 20;
ctx.shadowColor = "#00ffff";

ctx.beginPath();
ctx.arc(0, 0, coreRadius * 3.5, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Rotating laser accents
ctx.save();
ctx.translate(cx, cy);
ctx.rotate(-S.rot * 0.8);
ctx.globalCompositeOperation = "lighter";

const laserR = baseRadius * 1.42;
for (let i = 0; i < 4; i++) {
  const a = time * 0.22 + i * Math.PI * 0.5;
  const c = Math.cos(a);
  const s = Math.sin(a);

  ctx.strokeStyle = "rgba(0,255,255," + (0.08 + pulse * 0.15) + ")";
  ctx.lineWidth = Math.max(0.5, minDim * 0.001);
  ctx.shadowBlur = 7;
  ctx.shadowColor = "#00ffff";

  ctx.beginPath();
  ctx.moveTo(c * laserR * 0.92, s * laserR * 0.92);
  ctx.lineTo(c * laserR * 1.08, s * laserR * 1.08);
  ctx.stroke();
}

ctx.restore();`
  },
  {
    id: 'cyber_equalizer_bars',
    name: 'Cyberpunk Neon Bars',
    category: 'Equalizer',
    icon: 'fa-chart-simple',
    description: 'Dải cột Equalizer đối xứng trung tâm với màu Gradient neon Cyberpunk và đỉnh nổi',
    code: `// CYBERPUNK NEON BARS
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height * 0.75;
const bufferLength = dataArray.length;

const numBars = 48;
const barWidth = Math.max(3, (width * 0.8) / (numBars * 2));
const gap = 3;
const maxHeight = height * 0.28;

for (let i = 0; i < numBars; i++) {
  const normIdx = Math.floor((i / numBars) * (bufferLength * 0.7));
  const rawVal = (dataArray[normIdx] || 0) / 255;
  const barHeight = Math.max(4, Math.pow(rawVal, 1.4) * maxHeight);

  const xOffset = i * (barWidth + gap);
  const leftX = centerX - xOffset - barWidth;
  const rightX = centerX + xOffset;
  const y = centerY - barHeight;

  // Neon Gradient
  const grad = ctx.createLinearGradient(0, centerY, 0, y);
  grad.addColorStop(0, '#06b6d4');
  grad.addColorStop(0.5, '#3b82f6');
  grad.addColorStop(1, '#ec4899');

  ctx.fillStyle = grad;
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#06b6d4';

  // Draw symmetric bars
  ctx.beginPath();
  ctx.roundRect(rightX, y, barWidth, barHeight, 3);
  ctx.roundRect(leftX, y, barWidth, barHeight, 3);
  ctx.fill();

  // Floating Cap Node
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ffffff';
  ctx.fillRect(rightX, y - 6, barWidth, 3);
  ctx.fillRect(leftX, y - 6, barWidth, 3);
}`
  },
  {
    id: 'radial_bass_portal',
    name: 'Radial Bass Portal 360°',
    category: 'Circular',
    icon: 'fa-circle-notch',
    description: 'Vòng tròn xoay ma trận phản hồi nhịp Bass mạnh với các tia sóng laser phát sáng',
    code: `// RADIAL BASS PORTAL 360°
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
const baseRadius = Math.min(width, height) * 0.2;

// Calculate bass energy
let bassSum = 0;
for (let i = 0; i < 8; i++) bassSum += dataArray[i] || 0;
const bass = (bassSum / (8 * 255));

ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate(time * 0.4);

// Center Glowing Core
const coreRad = baseRadius * (0.85 + bass * 0.35);
const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRad);
coreGrad.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
coreGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.4)');
coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
ctx.fillStyle = coreGrad;
ctx.beginPath();
ctx.arc(0, 0, coreRad * 1.4, 0, Math.PI * 2);
ctx.fill();

// 360 Degree Spikes
const numSpikes = 64;
const angleStep = (Math.PI * 2) / numSpikes;

for (let i = 0; i < numSpikes; i++) {
  const angle = i * angleStep;
  const normIdx = i < numSpikes / 2 ? i : (numSpikes - i);
  const dataIdx = Math.floor((normIdx / (numSpikes / 2)) * (dataArray.length * 0.6));
  const val = (dataArray[dataIdx] || 0) / 255;
  const spikeLen = 8 + Math.pow(val, 1.3) * (baseRadius * 0.9);

  const x1 = Math.cos(angle) * (baseRadius + 4);
  const y1 = Math.sin(angle) * (baseRadius + 4);
  const x2 = Math.cos(angle) * (baseRadius + 4 + spikeLen);
  const y2 = Math.sin(angle) * (baseRadius + 4 + spikeLen);

  ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 14;
  ctx.shadowColor = ctx.strokeStyle;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Inner Bezel Ring
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;
ctx.shadowBlur = 10;
ctx.shadowColor = '#38bdf8';
ctx.beginPath();
ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
ctx.stroke();

ctx.restore();`
  },
  {
    id: 'liquid_aurora_ribbon',
    name: 'Liquid Aurora Waves',
    category: 'Waves',
    icon: 'fa-water',
    description: 'Dải lụa sóng âm cực quang cực mượt với gradient chuyển màu lượn sóng',
    code: `// LIQUID AURORA WAVES
const width = canvas.width;
const height = canvas.height;
const centerY = height * 0.65;
const bufferLength = dataArray.length;

const numPoints = 60;
const step = width / (numPoints - 1);
const waveLayers = 3;

for (let l = 0; l < waveLayers; l++) {
  const phase = time * (1.2 + l * 0.5) + l * 2;
  const layerAmp = (height * 0.12) * (1 - l * 0.2);

  ctx.beginPath();
  ctx.moveTo(0, centerY);

  for (let i = 0; i < numPoints; i++) {
    const x = i * step;
    const norm = i / (numPoints - 1);
    const centerWeight = Math.sin(norm * Math.PI);
    const dataIdx = Math.floor(norm * (bufferLength * 0.5));
    const audioVal = (dataArray[dataIdx] || 0) / 255;

    const sine = Math.sin(norm * 8 + phase) * 20;
    const y = centerY - (audioVal * layerAmp * centerWeight) + sine;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();

  const colors = [
    ['rgba(168, 85, 247, 0.4)', 'rgba(59, 130, 246, 0.1)'],
    ['rgba(6, 182, 212, 0.45)', 'rgba(16, 185, 129, 0.1)'],
    ['rgba(244, 63, 94, 0.5)', 'rgba(251, 146, 60, 0.1)']
  ];

  const grad = ctx.createLinearGradient(0, centerY - layerAmp, 0, height);
  grad.addColorStop(0, colors[l][0]);
  grad.addColorStop(1, colors[l][1]);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = l === 0 ? '#c084fc' : (l === 1 ? '#22d3ee' : '#fb7185');
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 15;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.stroke();
}`
  },
  {
    id: 'floating_star_nebula',
    name: 'Cosmic Audio Nebula',
    category: 'Particle',
    icon: 'fa-wand-magic-sparkles',
    description: 'Vũ trụ thiên hà hạt sao lơ lửng phóng to thu nhỏ và đổi màu theo từng nhịp điệu',
    code: `// COSMIC AUDIO NEBULA
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
const bufferLength = dataArray.length;

const numOrbs = 36;
const angleStep = (Math.PI * 2) / numOrbs;

ctx.save();
ctx.translate(centerX, centerY);

for (let i = 0; i < numOrbs; i++) {
  const norm = i / numOrbs;
  const angle = i * angleStep + time * 0.3;
  const dataIdx = Math.floor(norm * (bufferLength * 0.6));
  const val = (dataArray[dataIdx] || 0) / 255;

  const dist = 60 + norm * (Math.min(width, height) * 0.35) + Math.sin(time * 2 + i) * 15;
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;
  const orbRadius = 3 + Math.pow(val, 1.5) * 28;

  const hue = (norm * 280 + time * 40) % 360;
  ctx.fillStyle = \`hsla(\${hue}, 90%, 65%, 0.85)\`;
  ctx.shadowBlur = 18;
  ctx.shadowColor = \`hsl(\${hue}, 90%, 60%)\`;

  ctx.beginPath();
  ctx.arc(x, y, orbRadius, 0, Math.PI * 2);
  ctx.fill();

  // Core white point
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, orbRadius * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

ctx.restore();`
  }
];
