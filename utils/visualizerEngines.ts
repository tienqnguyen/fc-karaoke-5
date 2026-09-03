import React from 'react';
import { WaveformStyle } from '../types';
import { cleanCustomJsCode } from './customVisualizerPresets';

export interface VisualizerEngineOption {
  value: WaveformStyle;
  name: string;
  category: 'Specterr Elite' | 'Renderforest 3D' | 'Cinematic Studio' | 'Classic Spectrum';
  icon: string;
  badge?: string;
  desc: string;
}

export const VISUALIZER_ENGINES: VisualizerEngineOption[] = [
  // --- RENDERFOREST 3D ---
  {
    value: 'lofi_vibes',
    name: 'Lofi Vibes Widescreen 360°',
    category: 'Renderforest 3D',
    icon: 'fa-record-vinyl',
    badge: 'Renderforest Lofi',
    desc: 'Visualizer chuẩn Renderforest Lofi Vibes: Đĩa xoay Vinyl Artwork, hào quang Pastel, hạt bụi phát sáng và dải sóng 360° siêu mượt'
  },
  {
    value: 'parallax_waves',
    name: 'Parallax Waves 3D',
    category: 'Renderforest 3D',
    icon: 'fa-water',
    badge: 'Renderforest #1',
    desc: 'Sóng âm 3D Parallax đa tầng với gradient neon, dải lụa không gian và logo/ảnh bìa trung tâm phản hồi nhịp Bass'
  },
  // --- CUSTOM JS ---
  {
    value: 'custom_js',
    name: 'Custom JS Engine',
    category: 'Cinematic Studio',
    icon: 'fa-code',
    badge: 'Code Your Own',
    desc: 'Viết mã JavaScript tuỳ chỉnh để render visualizer (ctx, canvas, dataArray)'
  },
  // --- SPECTERR ELITE ---
  {
    value: 'trap_bass_ring',
    name: 'Trap Bass Ring',
    category: 'Specterr Elite',
    icon: 'fa-circle-notch',
    badge: 'Specterr #1',
    desc: 'Vòng tròn Bass EDM phát nổ nhịp, sóng năng lượng shockwave & hạt hào quang'
  },
  {
    value: 'cyber_mirrored_bars',
    name: 'Cyber Mirrored',
    category: 'Specterr Elite',
    icon: 'fa-chart-simple',
    badge: 'Pro Bars',
    desc: 'Thanh đối xứng hai chiều cao cấp, LED peak-hold rơi mượt & hiệu ứng phản chiếu kính'
  },
  {
    value: 'solar_flare',
    name: 'Solar Supernova',
    category: 'Specterr Elite',
    icon: 'fa-sun',
    badge: 'Supernova',
    desc: 'Mặt trời năng lượng rực lửa với tia plasma corona và bão từ theo nhịp'
  },
  {
    value: 'neon_heartbeat',
    name: 'Symmetry Glow Wave',
    category: 'Specterr Elite',
    icon: 'fa-wave-square',
    badge: 'Specterr',
    desc: 'Sóng đôi đối xứng 2 chiều cực mượt chuẩn Specterr với lớp Glow rực rỡ'
  },

  // --- RENDERFOREST 3D ---
  {
    value: 'tunnel_vortex',
    name: '3D Neon Vortex',
    category: 'Renderforest 3D',
    icon: 'fa-ring',
    badge: 'Renderforest',
    desc: 'Đường hầm 3D đa chiều xoay hút vào vô tận với dây laser kết nối'
  },
  {
    value: 'quantum_ribbon',
    name: 'Quantum Silk',
    category: 'Renderforest 3D',
    icon: 'fa-water',
    badge: 'Fluid Silk',
    desc: 'Dải lụa sóng âm đa lớp mềm mại phát sáng neon xuyên không gian'
  },
  {
    value: 'glass_pillars',
    name: 'Glass Equalizer',
    category: 'Renderforest 3D',
    icon: 'fa-bars-staggered',
    badge: 'Glass 3D',
    desc: 'Cột trụ thuỷ tinh chia tầng LED 3D với nắp bay lơ lửng phản xạ mặt sàn'
  },
  {
    value: 'vinyl_groove',
    name: 'Vinyl Glow Disc',
    category: 'Renderforest 3D',
    icon: 'fa-compact-disc',
    badge: 'Vinyl Pro',
    desc: 'Đĩa than cổ điển xoay mượt với rãnh đĩa phản quang & sóng âm tỏa tròn'
  },

  // --- CINEMATIC STUDIO ---
  {
    value: 'liquid_gold',
    name: 'Liquid Gold',
    category: 'Cinematic Studio',
    icon: 'fa-droplet',
    badge: 'Gold Flow',
    desc: 'Dòng chảy vàng kim tuyến lỏng uốn lượn huyền ảo'
  },
  {
    value: 'stardust_orbit',
    name: 'Stardust Orbit',
    category: 'Cinematic Studio',
    icon: 'fa-arrows-spin',
    badge: 'Gold Orbit',
    desc: 'Vòng đĩa mạ vàng sang trọng với gai sóng âm và bụi sao bay'
  },
  {
    value: 'audio_ring',
    name: 'Triple Audio Ring',
    category: 'Cinematic Studio',
    icon: 'fa-circle-dot',
    badge: '3-Ring',
    desc: '3 vòng tròn tần số Bass - Mid - Treble tách biệt phát sáng'
  },
  {
    value: 'cosmic_mandala',
    name: 'Cosmic Mandala',
    category: 'Cinematic Studio',
    icon: 'fa-certificate',
    badge: 'Cosmic',
    desc: 'Hoa văn Mandala vũ trụ xoay chuyển và biến đổi theo giai điệu'
  },
  {
    value: 'aurora',
    name: 'Aurora Borealis',
    category: 'Cinematic Studio',
    icon: 'fa-cloud-moon',
    badge: 'Aurora',
    desc: 'Cực quang huyền ảo lượn sóng đa sắc màu'
  },
  {
    value: 'dna_helix',
    name: 'DNA Double Helix',
    category: 'Cinematic Studio',
    icon: 'fa-dna',
    badge: 'Helix',
    desc: 'Chuỗi xoắn kép DNA phản ứng theo nhịp nhạc'
  },
  {
    value: 'cyber_matrix',
    name: 'Cyber Matrix',
    category: 'Cinematic Studio',
    icon: 'fa-table-cells',
    badge: 'Matrix',
    desc: 'Ma trận kỹ thuật số tương lai nhấp nháy theo tần số'
  },
  {
    value: 'neon_perspective',
    name: 'Synthwave Horizon',
    category: 'Cinematic Studio',
    icon: 'fa-mountain-sun',
    badge: 'Synthwave',
    desc: 'Lưới sàn 3D phối cảnh tương lai Retro Synthwave thập niên 80'
  },

  // --- CLASSIC SPECTRUM ---
  {
    value: 'bars',
    name: 'Spectrum Bars',
    category: 'Classic Spectrum',
    icon: 'fa-chart-column',
    desc: 'Cột sóng phổ cổ điển đơn giản, hiện đại'
  },
  {
    value: 'reflected',
    name: 'Mirror Bars',
    category: 'Classic Spectrum',
    icon: 'fa-arrows-up-down',
    desc: 'Cột sóng phản chiếu đối xứng qua trục giữa'
  },
  {
    value: 'pulse',
    name: 'Oscilloscope Line',
    category: 'Classic Spectrum',
    icon: 'fa-wave-square',
    desc: 'Đường dao động sóng âm thanh cơ bản'
  },
  {
    value: 'circles',
    name: 'Pulse Rings',
    category: 'Classic Spectrum',
    icon: 'fa-circle-notch',
    desc: 'Các vòng tròn đồng tâm mở rộng theo biên độ'
  },
  {
    value: 'neon_lines',
    name: 'Neon Waves',
    category: 'Classic Spectrum',
    icon: 'fa-lines-leaning',
    desc: 'Các lớp sóng Neon lượn sóng song song'
  }
];

// Persistent state caches for smooth physics (falling peaks, particles, etc.)
const peakValuesMap = new Map<string, number[]>();
const shockwavesMap = new Map<string, { radius: number; maxRadius: number; alpha: number; speed: number; color: string }[]>();
const internalParticlesMap = new Map<string, any[]>();
const parallaxHeightMap = new Map<string, number[][]>();
const parallaxMusicPhaseMap = new Map<string, number>();
const customJsCompiledCache = new Map<string, Function>();

export interface VisualizerColorPalette {
  primary: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  rgba: (alpha: number) => string;
  glow: (alpha?: number) => string;
  secondary: (shiftHueDeg?: number) => string;
  complement: string;
  light: string;
  dark: string;
  isLight: boolean;
}

export function parseColorToRgb(colorStr: string): { r: number; g: number; b: number } {
  if (!colorStr) return { r: 56, g: 189, b: 248 };
  const str = colorStr.trim();
  
  if (str.startsWith('#')) {
    let clean = str.slice(1);
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (clean.length >= 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return { r, g, b };
    }
  }

  const rgbMatch = str.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))),
      g: Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))),
      b: Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)))
    };
  }

  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (ctx) {
      ctx.fillStyle = str;
      const computed = ctx.fillStyle;
      if (computed.startsWith('#')) {
        let clean = computed.slice(1);
        if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
        return {
          r: parseInt(clean.substring(0, 2), 16) || 56,
          g: parseInt(clean.substring(2, 4), 16) || 189,
          b: parseInt(clean.substring(4, 6), 16) || 248
        };
      }
    }
  } catch (e) {}

  return { r: 56, g: 189, b: 248 };
}

export function getVisualizerPalette(waveformColor?: string): VisualizerColorPalette {
  const primary = waveformColor && waveformColor.trim() !== '' ? waveformColor.trim() : '#38bdf8';
  const { r, g, b } = parseColorToRgb(primary);

  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  const rgba = (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
  const glow = (alpha = 0.8) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
  const secondary = (shiftDeg = 45) => `hsl(${(hDeg + shiftDeg + 360) % 360}, ${Math.max(60, sPct)}%, ${Math.min(80, Math.max(40, lPct))}%)`;
  const complement = `hsl(${(hDeg + 180) % 360}, ${Math.max(60, sPct)}%, ${Math.min(80, Math.max(40, lPct))}%)`;
  const light = `hsl(${hDeg}, ${Math.min(100, sPct)}%, ${Math.min(95, lPct + 25)}%)`;
  const dark = `hsl(${hDeg}, ${sPct}%, ${Math.max(12, lPct - 25)}%)`;
  const isLight = (0.299 * r + 0.587 * g + 0.114 * b) > 180;

  return {
    primary,
    r, g, b,
    h: hDeg,
    s: sPct,
    l: lPct,
    rgba,
    glow,
    secondary,
    complement,
    light,
    dark,
    isLight
  };
}

export interface RenderVisualizerConfig {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  dataArray: Uint8Array | number[];
  bufferLength: number;
  smoothedBass: number;
  smoothedMid: number;
  smoothedHigh: number;
  rotationAngle: number;
  waveformStyle: WaveformStyle;
  globalTimeMs: number;
  waveformColor: string;
  waveformOpacity: number;
  waveformSize: number;
  waveformPosition: number; // 0 - 100
  waveformX: number; // 0 - 100
  waveformWidth: number; // 0 - 100
  visualizerScale?: number;
  bgImage?: HTMLImageElement | null;
  logoImage?: HTMLImageElement | null;
  waveformParticlesRef?: React.MutableRefObject<any[]>;
  customVisualizerJs?: string;
}

function drawCenterLogo(
  ctx: CanvasRenderingContext2D,
  logoImage: HTMLImageElement | null | undefined,
  bgImage: HTMLImageElement | null | undefined,
  radius: number,
  rotationAngle: number = 0,
  fallbackColor: string = '#000000'
) {
  const img = logoImage || bgImage;
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0, radius), 0, Math.PI * 2);
  ctx.clip();
  if (rotationAngle !== 0) ctx.rotate(rotationAngle);
  
  if (img && img.complete && img.naturalWidth > 0) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const size = radius * 2;
    let sx = 0, sy = 0, sWidth = iw, sHeight = ih;
    if (iw > ih) {
      sWidth = ih;
      sx = (iw - ih) / 2;
    } else {
      sHeight = iw;
      sy = (ih - iw) / 2;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, -radius, -radius, size, size);
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Main dispatcher for rendering premium visualizer engines
 */
export function renderVisualizerEngine(config: RenderVisualizerConfig): void {
  const {
    ctx,
    canvasWidth,
    canvasHeight,
    dataArray,
    bufferLength,
    smoothedBass,
    smoothedMid,
    smoothedHigh,
    rotationAngle,
    waveformStyle,
    globalTimeMs,
    waveformColor,
    waveformOpacity,
    waveformSize,
    waveformPosition,
    waveformX,
    waveformWidth,
    visualizerScale = 1.0,
    bgImage,
    logoImage,
    waveformParticlesRef,
    customVisualizerJs
  } = config;

  const centerY = (waveformPosition / 100) * canvasHeight;
  const centerX = (waveformX / 100) * canvasWidth;
  const totalWaveformWidth = (waveformWidth / 100) * canvasWidth;
  const startX = centerX - totalWaveformWidth / 2;

  const palette = getVisualizerPalette(waveformColor);

  ctx.save();
  ctx.globalAlpha = waveformOpacity;
  
  if (visualizerScale !== 1.0) {
    ctx.translate(centerX, centerY);
    ctx.scale(visualizerScale, visualizerScale);
    ctx.translate(-centerX, -centerY);
  }

  ctx.fillStyle = palette.primary;
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 2;

  switch (waveformStyle) {
    // ----------------------------------------------------
    // 0. LOFI VIBES WIDESCREEN 360° (Renderforest Signature Lofi Visualizer)
    // ----------------------------------------------------
    case 'lofi_vibes': {
      const scaleMultiplier = (waveformWidth / 100) * (waveformSize || 1.0);
      const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.17 * (waveformWidth / 100);
      const bassPulse = smoothedBass * 22 * waveformSize;
      const currentRadius = baseRadius + bassPulse;
      const now = globalTimeMs;
      const timeSec = now * 0.001;

      // 1. Ambient Floating Lofi Dust / Golden Bokeh Motes
      if (!internalParticlesMap.has('lofi_vibes_dust')) {
        const pArr = [];
        for (let i = 0; i < 60; i++) {
          pArr.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: 1.5 + Math.random() * 3.5,
            speedY: 0.2 + Math.random() * 0.8,
            speedX: (Math.random() - 0.5) * 0.4,
            depth: 0.4 + Math.random() * 0.6,
            alpha: 0.2 + Math.random() * 0.6,
            hueOffset: Math.random() * 60 - 30
          });
        }
        internalParticlesMap.set('lofi_vibes_dust', pArr);
      }

      const dustParticles = internalParticlesMap.get('lofi_vibes_dust')!;
      ctx.save();
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];
        p.y -= (p.speedY + smoothedBass * 1.5) * p.depth;
        p.x += Math.sin(timeSec * 0.8 + i) * 0.5;
        if (p.y < -20) { p.y = canvasHeight + 20; p.x = Math.random() * canvasWidth; }
        if (p.x < -20) p.x = canvasWidth + 20;
        if (p.x > canvasWidth + 20) p.x = -20;

        const pColor = `hsla(${(palette.h + (p.hueOffset || 0) + 360) % 360}, ${Math.max(60, palette.s)}%, ${Math.min(85, palette.l + 10)}%, ${p.alpha * (0.5 + smoothedBass * 0.5)})`;
        ctx.fillStyle = pColor;
        ctx.shadowColor = pColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + smoothedMid * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // 2. Translucent Sonic Shockwave Rings on Bass
      if (smoothedBass > 0.4) {
        const waveProgress = (now % 1200) / 1200;
        const waveR = currentRadius + waveProgress * (160 * scaleMultiplier);
        ctx.save();
        ctx.strokeStyle = palette.rgba((1 - waveProgress) * 0.45 * smoothedBass);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveR, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary inner echo
        const echoProgress = ((now + 400) % 1200) / 1200;
        const echoR = currentRadius + echoProgress * (120 * scaleMultiplier);
        ctx.strokeStyle = `hsla(${(palette.h + 40) % 360}, ${palette.s}%, ${palette.l}%, ${(1 - echoProgress) * 0.3 * smoothedBass})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, echoR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Multi-Layer Radial Audio Bars & Glowing Orbit Nodes (360°)
      const numBars = 72;
      const angleStep = (Math.PI * 2) / numBars;
      const spinOffset = rotationAngle * 0.4;

      ctx.save();
      for (let i = 0; i < numBars; i++) {
        const angle = i * angleStep + spinOffset;
        const dataIdx = Math.floor((i < numBars / 2 ? i : numBars - i) * (bufferLength / (numBars / 2)));
        const rawVal = dataArray[dataIdx] || 0;
        const normalized = rawVal / 255;
        
        const barHeight = Math.max(4, Math.pow(normalized, 1.3) * 140 * waveformSize * (waveformWidth / 100));
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const startXBar = centerX + cos * (currentRadius + 6);
        const startYBar = centerY + sin * (currentRadius + 6);
        const endXBar = centerX + cos * (currentRadius + 6 + barHeight);
        const endYBar = centerY + sin * (currentRadius + 6 + barHeight);

        const barNorm = i / numBars;
        let barColor = palette.primary;
        if (barNorm < 0.33) barColor = palette.primary;
        else if (barNorm < 0.66) barColor = palette.secondary(35);
        else barColor = palette.secondary(70);

        ctx.strokeStyle = barColor;
        ctx.lineWidth = Math.max(2, (angleStep * currentRadius * 0.55));
        ctx.lineCap = 'round';
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.moveTo(startXBar, startYBar);
        ctx.lineTo(endXBar, endYBar);
        ctx.stroke();

        // Orbit peak dot with floating inertia
        if (barHeight > 18) {
          const dotR = currentRadius + 14 + barHeight + Math.sin(timeSec * 3 + i) * 3;
          const dotX = centerX + cos * dotR;
          const dotY = centerY + sin * dotR;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = barColor;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // 4. Center Vinyl Record Artwork Disc
      ctx.save();
      // Outer Glowing Aura
      const auraGrad = ctx.createRadialGradient(centerX, centerY, currentRadius * 0.7, centerX, centerY, currentRadius * 1.25);
      auraGrad.addColorStop(0, palette.rgba(0.32));
      auraGrad.addColorStop(0.6, `hsla(${(palette.h + 40) % 360}, ${palette.s}%, ${palette.l}%, 0.18)`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Vinyl Black Rim
      ctx.fillStyle = '#141416';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Concentric Vinyl Micro-Grooves
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let r = currentRadius * 0.55; r < currentRadius - 6; r += 7) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center Artwork Thumbnail (Spins with rotationAngle)
      const labelRadius = currentRadius * 0.52;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);
      ctx.beginPath();
      ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
      ctx.clip();

      const discImg = logoImage || bgImage;
      if (discImg && discImg.complete && discImg.naturalWidth > 0) {
        const iw = discImg.naturalWidth || discImg.width;
        const ih = discImg.naturalHeight || discImg.height;
        const minSide = Math.min(iw, ih);
        const sx = (iw - minSide) / 2;
        const sy = (ih - minSide) / 2;
        ctx.drawImage(discImg, sx, sy, minSide, minSide, -labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
      } else {
        // Fallback procedural retro vinyl label
        const grad = ctx.createLinearGradient(-labelRadius, -labelRadius, labelRadius, labelRadius);
        grad.addColorStop(0, palette.primary);
        grad.addColorStop(0.5, palette.secondary(45));
        grad.addColorStop(1, palette.secondary(90));
        ctx.fillStyle = grad;
        ctx.fillRect(-labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);

        // Music Note symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(labelRadius * 0.6)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♫', 0, 0);
      }

      ctx.restore(); // end spinning center

      // Outer Vinyl Border Ring with Tone
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = palette.primary;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      break;
    }

    // ----------------------------------------------------
    // 0. PARALLAX WAVES 3D (Renderforest Signature Visualizer)
    // ----------------------------------------------------
    case 'parallax_waves': {
      const layers = 6;
      const samplePoints = 54;
      const step = totalWaveformWidth / (samplePoints - 1);
      const totalMusicEnergy = (smoothedBass * 1.5 + smoothedMid * 1.1 + smoothedHigh * 0.8);

      // 1. Music-Driven Flow Velocity (Advances purely based on music playback energy)
      let musicPhase = parallaxMusicPhaseMap.get('parallax_phase') || 0;
      const musicSpeed = 0.006 + (totalMusicEnergy * 0.035);
      musicPhase += musicSpeed;
      parallaxMusicPhaseMap.set('parallax_phase', musicPhase);

      // 2. Physics-Based Smooth Heights Buffer (Fast Attack, Natural Exponential Decay)
      if (!parallaxHeightMap.has('parallax_layers')) {
        const initLayers: number[][] = [];
        for (let l = 0; l < layers; l++) {
          initLayers.push(new Array(samplePoints).fill(0));
        }
        parallaxHeightMap.set('parallax_layers', initLayers);
      }
      const layerHeights = parallaxHeightMap.get('parallax_layers')!;

      // 3. Floating 3D Depth Particles / Light Bokeh Motes (Accelerate on Bass)
      if (!internalParticlesMap.has('parallax_waves_particles')) {
        const pArr = [];
        for (let i = 0; i < 70; i++) {
          pArr.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: 1.5 + Math.random() * 3.5,
            speedY: 0.3 + Math.random() * 1.0,
            speedX: (Math.random() - 0.5) * 0.5,
            depth: 0.3 + Math.random() * 0.7,
            alpha: 0.2 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2
          });
        }
        internalParticlesMap.set('parallax_waves_particles', pArr);
      }

      const particles = internalParticlesMap.get('parallax_waves_particles')!;
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= (p.speedY + smoothedBass * 3.0) * p.depth;
        p.x += p.speedX + Math.sin(musicPhase * 1.5 + p.phase) * 0.35;
        if (p.y < 0) {
          p.y = canvasHeight + 10;
          p.x = Math.random() * canvasWidth;
        }
        if (p.x < 0) p.x = canvasWidth;
        if (p.x > canvasWidth) p.x = 0;

        const pRadius = p.size * (0.8 + smoothedBass * 0.6 * p.depth);
        ctx.globalAlpha = waveformOpacity * p.alpha * (0.5 + smoothedMid * 0.4 + Math.sin(musicPhase * 2 + p.phase) * 0.3);
        ctx.fillStyle = waveformColor || '#38bdf8';
        ctx.shadowBlur = 12 * p.depth + (smoothedBass * 8);
        ctx.shadowColor = waveformColor || '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, pRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4. Multi-Plane 3D Parallax Ribbon Waves (Scultped Directly By Music FFT Frequency Bands)
      for (let layer = 0; layer < layers; layer++) {
        const depth = (layer + 1) / layers; // 0.16 (back horizon) to 1.0 (foreground)
        const layerBaseY = centerY + (layer - 2.5) * (34 * waveformSize);
        const lHeights = layerHeights[layer];

        // Specific acoustic band energy for each depth plane
        let bandEnergy = 0;
        if (layer === 0) bandEnergy = smoothedBass * 1.6;
        else if (layer === 1) bandEnergy = (smoothedBass * 1.2 + smoothedMid * 0.6);
        else if (layer === 2) bandEnergy = smoothedMid * 1.3;
        else if (layer === 3) bandEnergy = (smoothedMid * 1.1 + smoothedHigh * 0.8);
        else if (layer === 4) bandEnergy = (smoothedMid * 0.6 + smoothedHigh * 1.4);
        else bandEnergy = smoothedHigh * 1.7;

        const pts: { x: number; y: number }[] = [];

        for (let i = 0; i < samplePoints; i++) {
          const x = startX + i * step;
          const normIdx = i / (samplePoints - 1); // 0 to 1
          const distFromCenter = Math.abs(normIdx - 0.5) * 2; // 0 at center, 1 at edges
          const centerWeight = Math.pow(Math.max(0.15, 1.0 - distFromCenter * 0.5), 1.1);

          // Direct mapping to discrete audio FFT spectrum bins based on frequency plane
          let freqBin = 0;
          if (layer === 0) {
            freqBin = Math.floor((1.0 - distFromCenter * 0.8) * (bufferLength * 0.06));
          } else if (layer === 1) {
            freqBin = Math.floor((1.0 - distFromCenter * 0.6) * (bufferLength * 0.12) + 2);
          } else if (layer === 2) {
            freqBin = Math.floor(distFromCenter * (bufferLength * 0.25) + 4);
          } else if (layer === 3) {
            freqBin = Math.floor(distFromCenter * (bufferLength * 0.42) + 8);
          } else if (layer === 4) {
            freqBin = Math.floor(distFromCenter * (bufferLength * 0.62) + 14);
          } else {
            freqBin = Math.floor((0.2 + distFromCenter * 0.8) * (bufferLength * 0.82) + 20);
          }
          freqBin = Math.min(bufferLength - 1, Math.max(0, freqBin));
          const rawFreq = (dataArray[freqBin] || 0) / 255;

          // Target wave crest amplitude strictly determined by audio data
          const targetAmp = (bandEnergy * 75 + rawFreq * 95) * centerWeight * depth * waveformSize;

          // Exponential Attack & Decay Envelope Smoothing
          if (targetAmp > lHeights[i]) {
            // Fast attack on beat impact
            lHeights[i] = lHeights[i] * 0.45 + targetAmp * 0.55;
          } else {
            // Natural liquid decay
            lHeights[i] = lHeights[i] * 0.86 + targetAmp * 0.14;
          }

          // Subtle organic harmonic wave flow (active only when music plays)
          const harmonicRipple = Math.sin(normIdx * Math.PI * (2 + layer * 0.7) + musicPhase * (1.0 + layer * 0.35)) 
            * (rawFreq * 16 + bandEnergy * 10) * depth * waveformSize;

          const currentHeight = lHeights[i] + harmonicRipple;
          const y = layerBaseY - currentHeight;
          pts.push({ x, y });
        }

        // Draw filled gradient ribbon down to canvas bottom
        const fillGrad = ctx.createLinearGradient(startX, layerBaseY - 150 * waveformSize, startX, canvasHeight);
        const layerAlpha = 0.5 + depth * 0.35;
        const layerHue = (palette.h + (layer - 2) * 25 + 360) % 360;

        fillGrad.addColorStop(0, `hsla(${layerHue}, ${palette.s}%, ${palette.l}%, ${layerAlpha * 0.75})`);
        fillGrad.addColorStop(0.65, `hsla(${(layerHue + 30) % 360}, ${palette.s}%, ${Math.max(20, palette.l - 15)}%, ${layerAlpha * 0.3})`);
        fillGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = fillGrad;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i].x + pts[i - 1].x) / 2;
          const yc = (pts[i].y + pts[i - 1].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.lineTo(startX + totalWaveformWidth, canvasHeight);
        ctx.lineTo(startX, canvasHeight);
        ctx.closePath();
        ctx.fill();

        // Stroke Luminous Glowing Crest Line
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i].x + pts[i - 1].x) / 2;
          const yc = (pts[i].y + pts[i - 1].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }

        const crestColor = `hsl(${layerHue}, ${Math.max(60, palette.s)}%, ${Math.min(85, palette.l + 10)}%)`;

        ctx.strokeStyle = crestColor;
        ctx.lineWidth = 1.8 + depth * 2.4 + (bandEnergy * 1.2);
        ctx.shadowBlur = 10 + depth * 16 + (smoothedBass * 14);
        ctx.shadowColor = crestColor;
        ctx.stroke();

        // Glowing light nodes at wave crest points for foreground layers (flash with snare/hi-hats)
        if (layer >= 3) {
          for (let i = 2; i < pts.length - 2; i += 4) {
            const pt = pts[i];
            const nodeFreq = (dataArray[Math.min(bufferLength - 1, i * 6)] || 0) / 255;
            const nodePulse = 2.5 + (nodeFreq * 3.5) + (smoothedHigh * 2.5);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 16 + nodeFreq * 10;
            ctx.shadowColor = crestColor;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, nodePulse, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 5. Central Reactive Parallax Emblem Disc (With Uploaded Logo / Custom Art Support)
      const discCenterY = centerY - 55 * waveformSize;
      const baseDiscRadius = Math.min(canvasWidth, canvasHeight) * 0.125 * waveformSize;
      const reactiveDiscRadius = baseDiscRadius * (0.94 + smoothedBass * 0.28);

      ctx.save();
      ctx.translate(centerX, discCenterY);

      // Bass Beat Shockwave Pulse behind Emblem
      if (!shockwavesMap.has('parallax_waves_disc')) shockwavesMap.set('parallax_waves_disc', []);
      const discShockwaves = shockwavesMap.get('parallax_waves_disc')!;
      if (smoothedBass > 0.48 && (discShockwaves.length === 0 || discShockwaves[discShockwaves.length - 1].radius > baseDiscRadius * 1.35)) {
        discShockwaves.push({
          radius: reactiveDiscRadius,
          maxRadius: baseDiscRadius * 2.7,
          alpha: 0.95,
          speed: 6 + smoothedBass * 9,
          color: waveformColor || '#38bdf8'
        });
      }

      for (let i = discShockwaves.length - 1; i >= 0; i--) {
        const sw = discShockwaves[i];
        sw.radius += sw.speed;
        sw.alpha *= 0.91;
        if (sw.radius >= sw.maxRadius || sw.alpha < 0.02) {
          discShockwaves.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3.2 * sw.alpha;
        ctx.shadowBlur = 22;
        ctx.shadowColor = sw.color;
        ctx.globalAlpha = waveformOpacity * sw.alpha;
        ctx.stroke();
      }

      ctx.globalAlpha = waveformOpacity;

      // Outer Rotating Neon Orbit Ring with Audio Equalizer Pins (Directly bound to FFT spectrum)
      const numPins = 64;
      const pinAngleStep = (Math.PI * 2) / numPins;
      const orbitRadius = reactiveDiscRadius + 14 + (smoothedBass * 10);

      for (let i = 0; i < numPins; i++) {
        const angle = i * pinAngleStep + musicPhase * 0.05;
        const normIdx = i < numPins / 2 ? (i / (numPins / 2)) : ((numPins - i) / (numPins / 2));
        const freqIdx = Math.floor(normIdx * bufferLength * 0.75);
        const val = (dataArray[freqIdx] || 0) / 255;
        const pinLength = 4 + Math.pow(val, 1.3) * (52 * waveformSize);

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const pX1 = cosA * orbitRadius;
        const pY1 = sinA * orbitRadius;
        const pX2 = cosA * (orbitRadius + pinLength);
        const pY2 = sinA * (orbitRadius + pinLength);

        ctx.strokeStyle = waveformColor || '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 10 + val * 10;
        ctx.shadowColor = waveformColor || '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(pX1, pY1);
        ctx.lineTo(pX2, pY2);
        ctx.stroke();
      }

      // Outer Glowing Ring Frame
      ctx.beginPath();
      ctx.arc(0, 0, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 14 + (smoothedBass * 10);
      ctx.shadowColor = waveformColor || '#38bdf8';
      ctx.stroke();

      // Disc Shadow & Outer Bezel
      ctx.beginPath();
      ctx.arc(0, 0, reactiveDiscRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 15, 30, 0.92)';
      ctx.shadowBlur = 32;
      ctx.shadowColor = '#000000';
      ctx.fill();

      // Disc Face Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, reactiveDiscRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.rotate(musicPhase * 0.05); // Slow rotation for the logo/disc face

      if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
        // Draw User-Uploaded Logo / Cover Art Centered & Aspect-Fitted
        const lImg = logoImage;
        const iw = lImg.naturalWidth || lImg.width;
        const ih = lImg.naturalHeight || lImg.height;
        const size = reactiveDiscRadius * 2;
        
        let sx = 0, sy = 0, sWidth = iw, sHeight = ih;
        if (iw > ih) {
          sWidth = ih;
          sx = (iw - ih) / 2;
        } else {
          sHeight = iw;
          sy = (ih - iw) / 2;
        }

        ctx.drawImage(lImg, sx, sy, sWidth, sHeight, -reactiveDiscRadius, -reactiveDiscRadius, size, size);

        // Holographic Glass Reflection Sheen
        const sheenGrad = ctx.createLinearGradient(-reactiveDiscRadius, -reactiveDiscRadius, reactiveDiscRadius, reactiveDiscRadius);
        const sheenPhase = (musicPhase * 0.3) % 1;
        sheenGrad.addColorStop(Math.max(0, sheenPhase - 0.2), 'rgba(255, 255, 255, 0)');
        sheenGrad.addColorStop(sheenPhase, 'rgba(255, 255, 255, 0.35)');
        sheenGrad.addColorStop(Math.min(1, sheenPhase + 0.2), 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sheenGrad;
        ctx.fillRect(-reactiveDiscRadius, -reactiveDiscRadius, size, size);
      } else {
        // Default Sleek Dark Acrylic Disc with Glowing Music Core
        const discGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, reactiveDiscRadius);
        discGrad.addColorStop(0, '#1e1b4b');
        discGrad.addColorStop(0.6, '#0f172a');
        discGrad.addColorStop(1, '#020617');
        ctx.fillStyle = discGrad;
        ctx.fillRect(-reactiveDiscRadius, -reactiveDiscRadius, reactiveDiscRadius * 2, reactiveDiscRadius * 2);

        // Concentric Vinyl Micro-Grooves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let r = reactiveDiscRadius * 0.35; r < reactiveDiscRadius * 0.95; r += 5) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center Glowing Soundwave Icon
        ctx.fillStyle = waveformColor || '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.shadowColor = waveformColor || '#38bdf8';

        const barCount = 7;
        const bW = 4;
        const bGap = 5;
        const bStartX = -((barCount * bW + (barCount - 1) * bGap) / 2);

        for (let b = 0; b < barCount; b++) {
          const bNorm = 1.0 - Math.abs(b - 3) / 3.5;
          const bFreqVal = (dataArray[b * 6 + 2] || 0) / 255;
          const bH = 8 + (bNorm * 30 * waveformSize) * (0.4 + bFreqVal * 1.2 + smoothedBass * 0.8);
          const bx = bStartX + b * (bW + bGap);
          ctx.beginPath();
          ctx.roundRect(bx, -bH / 2, bW, bH, 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Disc Outer Chrome Rim
      ctx.beginPath();
      ctx.arc(0, 0, reactiveDiscRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = waveformColor || '#38bdf8';
      ctx.stroke();

      ctx.restore();
      break;
    }
    // ----------------------------------------------------
    // 1. TRAP BASS RING (Specterr #1)
    // ----------------------------------------------------
    case 'trap_bass_ring': {
      const baseRadius = Math.min(canvasWidth, canvasHeight) / 5.2;
      const reactiveRadius = baseRadius * (1.0 + smoothedBass * 0.35 * waveformSize);

      // Bass shake effect (VideoBolt signature camera shake)
      const shakeX = (Math.random() - 0.5) * smoothedBass * 25;
      const shakeY = (Math.random() - 0.5) * smoothedBass * 25;
      ctx.translate(centerX + shakeX, centerY + shakeY);

      // Render expanding shockwaves
      if (!shockwavesMap.has('trap_bass')) shockwavesMap.set('trap_bass', []);
      const shockwaves = shockwavesMap.get('trap_bass')!;
      if (smoothedBass > 0.55 && (shockwaves.length === 0 || shockwaves[shockwaves.length - 1].radius > baseRadius * 1.4)) {
        shockwaves.push({
          radius: reactiveRadius,
          maxRadius: baseRadius * 3.5 * waveformSize,
          alpha: 1.0,
          speed: 8 + smoothedBass * 15,
          color: waveformColor || '#06b6d4'
        });
      }

      ctx.globalCompositeOperation = 'screen';
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha *= 0.92;
        if (sw.radius >= sw.maxRadius || sw.alpha < 0.02) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, sw.radius), 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 5 * sw.alpha;
        ctx.shadowBlur = 30;
        ctx.shadowColor = sw.color;
        ctx.globalAlpha = waveformOpacity * sw.alpha;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = waveformOpacity;

      // Radial Equalizer Spikes (Thick, clean, gradient)
      const numSpikes = 96;
      const angleStep = (Math.PI * 2) / numSpikes;
      ctx.shadowBlur = 25;
      ctx.shadowColor = waveformColor || '#38bdf8';

      for (let i = 0; i < numSpikes; i++) {
        const angle = i * angleStep + rotationAngle * 0.15;
        // Mirror frequencies across both hemispheres
        const normIdx = i < numSpikes / 2 ? (i / (numSpikes / 2)) : ((numSpikes - i) / (numSpikes / 2));
        const freqIdx = Math.floor(normIdx * bufferLength * 0.65);
        const val = (dataArray[freqIdx] || 0) / 255;
        const spikeHeight = Math.pow(val, 1.6) * 160 * waveformSize + (smoothedBass * 15);
        
        if (spikeHeight < 2) continue;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x1 = cos * (reactiveRadius + 8);
        const y1 = sin * (reactiveRadius + 8);
        const midX = cos * (reactiveRadius + 8 + spikeHeight * 0.3);
        const midY = sin * (reactiveRadius + 8 + spikeHeight * 0.3);
        const x2 = cos * (reactiveRadius + 8 + spikeHeight);
        const y2 = sin * (reactiveRadius + 8 + spikeHeight);

        // Core White line segment
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(midX, midY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Outer Colored line segment
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, waveformColor || '#22d3ee');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Inner Glowing Ring
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, reactiveRadius + 2), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = waveformColor || '#38bdf8';
      ctx.stroke();

      // Outer Dashed Orbit Ring
      ctx.save();
      ctx.rotate(-rotationAngle * 0.2);
      ctx.beginPath();
      ctx.setLineDash([15, 25]);
      ctx.arc(0, 0, Math.max(0, reactiveRadius + 25), 0, Math.PI * 2);
      ctx.strokeStyle = waveformColor || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // Draw Logo inside the ring
      drawCenterLogo(ctx, logoImage, bgImage, reactiveRadius - 8, rotationAngle * 0.05, 'transparent');

      ctx.translate(-centerX - shakeX, -centerY - shakeY);
      break;
    }


    // ----------------------------------------------------
    // 3. 3D NEON TUNNEL VORTEX (Renderforest)
    // ----------------------------------------------------
    case 'tunnel_vortex': {
      ctx.translate(centerX, centerY);
      ctx.globalCompositeOperation = 'screen';
      const rings = 40; // High density premium wireframe
      const fov = 450;
      const timeScroll = globalTimeMs * 0.002;
      
      for (let r = rings; r > 0; r--) {
        // Compute depth (Z) moving towards viewer
        const z = (r * 15 - (timeScroll * 250) % 15);
        if (z <= 0) continue;
        
        const scale = fov / z;
        
        // Color mapping by depth
        const depthNorm = Math.max(0, Math.min(1, 1 - z / (rings * 15)));
        const hue = (timeScroll * 30 + depthNorm * 120 + 200) % 360; // Cyberpunk/synthwave hues
        
        const dataVal = (dataArray[Math.floor(depthNorm * bufferLength * 0.3)] || 0) / 255;
        const radius = (100 + dataVal * 60 * waveformSize) * scale;
        
        const sides = 6; // Hexagon tunnel
        // Smooth rotation intertwined with depth
        const rotation = timeScroll * 0.4 + z * 0.015 + smoothedMid * 0.15;
        
        ctx.beginPath();
        const pts2D = [];
        for (let s = 0; s <= sides; s++) {
          const angle = (s / sides) * Math.PI * 2 + rotation;
          // Reactivity per vertex creating the "Vortex" warp
          const bump = Math.sin(angle * 3 + timeScroll * 4) * (dataVal * 30) * scale * waveformSize;
          const px = Math.cos(angle) * (radius + bump);
          const py = Math.sin(angle) * (radius + bump);
          
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          
          if (s < sides) pts2D.push({x: px, y: py});
        }
        
        // Draw the ring
        ctx.lineWidth = 0.5 + 3.5 * depthNorm * depthNorm;
        ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${depthNorm * (0.3 + smoothedBass * 0.7)})`;
        ctx.shadowBlur = 10 * depthNorm + smoothedBass * 25;
        ctx.shadowColor = `hsla(${hue}, 100%, 65%, 1)`;
        ctx.stroke();
        
        // Connect vertices across depth for wireframe tunnel illusion
        // We do this by calculating the NEXT ring's inner coordinates (approximately)
        if (r < rings) {
            const zInner = ((r + 1) * 15 - (timeScroll * 250) % 15);
            const scaleInner = fov / zInner;
            const radiusInner = (100 + dataVal * 60 * waveformSize) * scaleInner;
            const rotationInner = timeScroll * 0.4 + zInner * 0.015 + smoothedMid * 0.15;
            
            ctx.beginPath();
            ctx.lineWidth = 0.5 + 1.5 * depthNorm * depthNorm;
            ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${(depthNorm * 0.4) * (0.2 + smoothedHigh * 0.4)})`;
            for(let s = 0; s < sides; s++) {
                const angleInner = (s / sides) * Math.PI * 2 + rotationInner;
                const bumpInner = Math.sin(angleInner * 3 + timeScroll * 4) * (dataVal * 30) * scaleInner * waveformSize;
                const pxInner = Math.cos(angleInner) * (radiusInner + bumpInner);
                const pyInner = Math.sin(angleInner) * (radiusInner + bumpInner);
                ctx.moveTo(pts2D[s].x, pts2D[s].y);
                ctx.lineTo(pxInner, pyInner);
            }
            ctx.stroke();
        }
      }
      
      // Far singularity glow
      ctx.shadowBlur = 60 + smoothedBass * 60;
      ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.beginPath();
      ctx.arc(0, 0, 5 + smoothedBass * 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.translate(-centerX, -centerY);
      break;
    }

    // ----------------------------------------------------
    // 4. QUANTUM SILK RIBBON (Renderforest)
    // ----------------------------------------------------
    case 'quantum_ribbon': {
      const layers = 6;
      const pts = 45;
      const step = totalWaveformWidth / (pts - 1);
      const ampMax = 180 * waveformSize;
      ctx.globalCompositeOperation = 'screen';
      
      for (let layer = 0; layer < layers; layer++) {
        const layerPhase = (layer * Math.PI) / 3 + globalTimeMs * 0.0025;
        const layerY = centerY + Math.sin(globalTimeMs * 0.001 + layer) * 40 * waveformSize; 
        const points = [];
        
        for (let i = 0; i < pts; i++) {
          const x = startX + i * step;
          const freqIndex = Math.floor(Math.pow((i / pts), 1.2) * bufferLength * 0.5);
          const freqVal = (dataArray[freqIndex] || 0) / 255;
          
          const waveHarmonic = Math.sin(i * 0.28 + layerPhase) * Math.cos(i * 0.14 - layerPhase * 1.5);
          const y = layerY + waveHarmonic * (ampMax * (0.3 + freqVal * 1.8 + smoothedBass * 0.5));
          points.push({ x, y });
        }
        
        const ribbonGrad = ctx.createLinearGradient(startX, layerY - ampMax, startX, layerY + ampMax);
        const hue = (globalTimeMs * 0.05 + layer * 60) % 360;
        ribbonGrad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.8)`);
        ribbonGrad.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 100%, 60%, 0.2)`);
        ribbonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = ribbonGrad;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }
        ctx.lineTo(startX + totalWaveformWidth, canvasHeight);
        ctx.lineTo(startX, canvasHeight);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = `hsla(${hue}, 100%, 75%, 0.9)`;
        ctx.lineWidth = 3 - layer * 0.3 + smoothedMid * 2.5;
        ctx.shadowBlur = 25 + smoothedHigh * 20;
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 1)`;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      break;
    }

    // ----------------------------------------------------
    // 5. SOLAR FLARE & SUPERNOVA (Specterr)
    // ----------------------------------------------------
    case 'solar_flare': {
      const sunRadius = Math.min(canvasWidth, canvasHeight) / 5.5;
      const pulseSun = sunRadius * (1.0 + smoothedBass * 0.3 * waveformSize);

      ctx.translate(centerX, centerY);

      ctx.globalCompositeOperation = 'screen';

      // Deep Space Radiance Bloom
      const auraGrad = ctx.createRadialGradient(0, 0, pulseSun * 0.5, 0, 0, pulseSun * 3.5);
      auraGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      auraGrad.addColorStop(0.1, 'rgba(253, 224, 71, 0.8)'); // yellow-300
      auraGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.5)'); // orange-500
      auraGrad.addColorStop(0.6, 'rgba(225, 29, 72, 0.15)'); // rose-600
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, pulseSun * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Chaotic Solar Flares (Multiple layers)
      const flareRays = 120;
      const flareStep = (Math.PI * 2) / flareRays;
      
      for (let layer = 0; layer < 2; layer++) {
        ctx.shadowBlur = layer === 0 ? 15 : 30;
        ctx.shadowColor = layer === 0 ? '#fef08a' : '#ea580c';
        
        for (let i = 0; i < flareRays; i++) {
          const angle = i * flareStep + rotationAngle * (layer === 0 ? 0.3 : -0.2);
          const freqIdx = Math.floor((i / flareRays) * bufferLength * (layer === 0 ? 0.6 : 0.8));
          const val = (dataArray[freqIdx] || 0) / 255;
          const flareLength = Math.pow(val, 1.8) * 180 * waveformSize * (layer === 0 ? 1 : 1.5) + (Math.sin(i * 1.5 + globalTimeMs * 0.005) * 20);

          if (flareLength < 5) continue;

          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const x1 = cos * pulseSun * 0.8;
          const y1 = sin * pulseSun * 0.8;
          // Add a slight curve (tangent offset) for organic fire look
          const tangX = -sin * flareLength * 0.3 * (layer === 0 ? 1 : -1);
          const tangY = cos * flareLength * 0.3 * (layer === 0 ? 1 : -1);
          const x2 = cos * (pulseSun + flareLength) + tangX;
          const y2 = sin * (pulseSun + flareLength) + tangY;

          const flareGrad = ctx.createLinearGradient(x1, y1, x2, y2);
          flareGrad.addColorStop(0, '#ffffff');
          flareGrad.addColorStop(0.2, '#fde047');
          flareGrad.addColorStop(0.6, '#ef4444');
          flareGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.strokeStyle = flareGrad;
          ctx.lineWidth = layer === 0 ? 3 : 1.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Core Star Surface
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#f59e0b';
      
      drawCenterLogo(ctx, logoImage, bgImage, pulseSun * 0.85, rotationAngle * 0.05, '#000');
      // Add an inner rim light
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, pulseSun * 0.85), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.translate(-centerX, -centerY);
      break;
    }


    // ----------------------------------------------------
    // 6. GLASS EQUALIZER PILLARS (Renderforest)
    // ----------------------------------------------------
    case 'glass_pillars': {
      const numCols = 42;
      const colSpacing = 8;
      const colWidth = (totalWaveformWidth - (numCols - 1) * colSpacing) / numCols;
      const maxH = 150 * waveformSize;

      for (let c = 0; c < numCols; c++) {
        const freqIdx = Math.floor((c / numCols) * bufferLength * 0.6);
        const val = (dataArray[freqIdx] || 0) / 255;
        const h = Math.pow(val, 1.5) * maxH * (1 + smoothedBass * 0.25);
        const x = startX + c * (colWidth + colSpacing);
        const yBase = centerY + 30; // Anchor point
        const r = colWidth / 2;

        // Only draw when there is an active signal
        if (h > 2) {
          ctx.globalCompositeOperation = 'screen';
          const grad = ctx.createLinearGradient(0, yBase, 0, yBase - h);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)'); 
          grad.addColorStop(1, 'rgba(200, 230, 255, 0.7)'); 

          ctx.fillStyle = grad;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.roundRect(x + 1, yBase - h + 1, colWidth - 2, h - 2, r - 1);
          ctx.fill();
          
          // Floating glowing bubble inside tube at peak
          const bubbleY = yBase - h + (Math.sin(globalTimeMs * 0.005 + c) * h * 0.1);
          if (bubbleY < yBase && bubbleY > yBase - h) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(x + r, bubbleY, r * 0.5, 0, Math.PI*2);
            ctx.fill();
          }
          ctx.globalCompositeOperation = 'source-over';

          // Specular Highlight (The 3D Glass Shine on the left edge) 
          // Only applied to the filled height since background is hidden
          const shineW = colWidth * 0.3;
          const shineGrad = ctx.createLinearGradient(0, yBase, 0, yBase - h);
          shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
          shineGrad.addColorStop(0.3, 'rgba(255,255,255,0.4)');
          shineGrad.addColorStop(1, 'rgba(255,255,255,0.9)');
          
          ctx.fillStyle = shineGrad;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.roundRect(x + 1, yBase - h + 1, shineW, h - 2, shineW/2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      break;
    }

    // ----------------------------------------------------
    // 7. CYBER BEATLINE / ECG (Specterr)
    // ----------------------------------------------------
    case 'neon_heartbeat': {
      const halfW = totalWaveformWidth / 2;
      const ptsCount = 90; 
      const step = halfW / ptsCount;
      const maxAmp = 220 * waveformSize * (1 + smoothedBass * 0.25);
      
      ctx.translate(centerX, centerY);
      
      const getVal = (normIdx) => {
         const freqIdx = Math.floor(Math.pow(normIdx, 1.2) * bufferLength * 0.65);
         return (dataArray[freqIdx] || 0) / 255;
      };

      const rawPoints = [];
      
      for (let i = ptsCount; i >= 1; i--) {
         const val = getVal(i / ptsCount);
         rawPoints.push({ x: -i * step, y: Math.pow(val, 1.8) * maxAmp });
      }
      rawPoints.push({ x: 0, y: Math.pow(getVal(0), 1.8) * maxAmp });
      for (let i = 1; i <= ptsCount; i++) {
         const val = getVal(i / ptsCount);
         rawPoints.push({ x: i * step, y: Math.pow(val, 1.8) * maxAmp });
      }

      // Smooth points to prevent jagged edges
      const points = [];
      const window = 4;
      for(let i=0; i<rawPoints.length; i++) {
          let sum = 0;
          let count = 0;
          for(let j=Math.max(0, i-window); j<=Math.min(rawPoints.length-1, i+window); j++) {
              // Bell curve weight
              const dist = Math.abs(i-j);
              const weight = 1 - (dist / (window+1));
              sum += rawPoints[j].y * weight;
              count += weight;
          }
          points.push({ x: rawPoints[i].x, yOffset: sum/count });
      }

      ctx.globalCompositeOperation = 'screen';
      const baseColor = waveformColor || '#38bdf8';
      
      const drawSmoothCurve = (sign, scale) => {
         ctx.beginPath();
         ctx.moveTo(points[0].x, sign * points[0].yOffset * scale);
         for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = sign * (points[i].yOffset + points[i + 1].yOffset) / 2 * scale;
            ctx.quadraticCurveTo(points[i].x, sign * points[i].yOffset * scale, xc, yc);
         }
         // Curve through the last two points
         ctx.quadraticCurveTo(
            points[points.length - 2].x, sign * points[points.length - 2].yOffset * scale,
            points[points.length - 1].x, sign * points[points.length - 1].yOffset * scale
         );
         return ctx;
      };

      // 1. Fill the area between top and bottom waves
      ctx.beginPath();
      ctx.moveTo(points[0].x, -points[0].yOffset);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, -points[i].yOffset);
      for (let i = points.length - 1; i >= 0; i--) ctx.lineTo(points[i].x, points[i].yOffset);
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, -maxAmp, 0, maxAmp);
      fillGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      fillGrad.addColorStop(0.35, baseColor); 
      fillGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)'); 
      fillGrad.addColorStop(0.65, baseColor); 
      fillGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = fillGrad;
      ctx.globalAlpha = 0.35 * waveformOpacity;
      ctx.fill();
      ctx.globalAlpha = waveformOpacity;

      // 2. Draw Outer Glow Lines
      ctx.shadowBlur = 25;
      ctx.shadowColor = baseColor;
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      drawSmoothCurve(-1, 1).stroke(); // Top outer
      drawSmoothCurve(1, 1).stroke();  // Bottom outer

      // 3. Draw Inner Core Lines (White hot)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      
      drawSmoothCurve(-1, 0.6).stroke(); // Top inner
      drawSmoothCurve(1, 0.6).stroke();  // Bottom inner
      
      // Center Horizon Line
      ctx.beginPath();
      ctx.moveTo(-halfW - 50, 0);
      ctx.lineTo(halfW + 50, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 10;
      ctx.stroke();

      // 4. Center Axis Particle burst
      if (smoothedBass > 0.4) {
         ctx.fillStyle = '#ffffff';
         ctx.shadowBlur = 30;
         ctx.shadowColor = baseColor;
         ctx.beginPath();
         ctx.ellipse(0, 0, 150 * smoothedBass, 3 * smoothedBass, 0, 0, Math.PI * 2);
         ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.translate(-centerX, -centerY);
      ctx.shadowBlur = 0;
      break;
    }


    // ----------------------------------------------------
    // 8. VINYL GROOVE ROTATING SPECTRUM (Specterr / Renderforest)
    // ----------------------------------------------------
    case 'vinyl_groove': {
      const vinylRad = Math.min(canvasWidth, canvasHeight) / 4.6;
      ctx.translate(centerX, centerY);

      // Radial Frequency Spikes bursting from edge of Vinyl
      const spikeCount = 90;
      const spikeStep = (Math.PI * 2) / spikeCount;
      ctx.shadowBlur = 15;
      ctx.shadowColor = waveformColor || '#eab308';

      for (let i = 0; i < spikeCount; i++) {
        const angle = i * spikeStep + rotationAngle;
        const freqIdx = Math.floor((i / spikeCount) * bufferLength * 0.65);
        const val = (dataArray[freqIdx] || 0) / 255;
        const spikeLen = Math.pow(val, 1.4) * 65 * waveformSize;

        const x1 = Math.cos(angle) * (vinylRad + 2);
        const y1 = Math.sin(angle) * (vinylRad + 2);
        const x2 = Math.cos(angle) * (vinylRad + 2 + spikeLen);
        const y2 = Math.sin(angle) * (vinylRad + 2 + spikeLen);

        ctx.strokeStyle = waveformColor || '#eab308';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Vinyl Record Body
      ctx.fillStyle = '#090a0f';
      ctx.shadowBlur = 25;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(0, 0, vinylRad, 0, Math.PI * 2);
      ctx.fill();

      // Realistic concentric vinyl grooves
      ctx.lineWidth = 1;
      for (let r = vinylRad * 0.38; r < vinylRad * 0.95; r += 4.5) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Specular sheen light reflection over vinyl
      const sheenGrad = ctx.createLinearGradient(-vinylRad, -vinylRad, vinylRad, vinylRad);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sheenGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.08)');
      sheenGrad.addColorStop(0.52, 'rgba(255, 255, 255, 0.18)');
      sheenGrad.addColorStop(0.56, 'rgba(255, 255, 255, 0.08)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.arc(0, 0, vinylRad, 0, Math.PI * 2);
      ctx.fill();

      // Center Record Label
      ctx.save();
      const labelRad = vinylRad * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, labelRad, 0, Math.PI * 2);
      ctx.clip();
      const vinylArt = logoImage || bgImage;
      if (vinylArt && vinylArt.complete && vinylArt.naturalWidth > 0) {
        ctx.rotate(rotationAngle);
        const iw = vinylArt.naturalWidth || vinylArt.width;
        const ih = vinylArt.naturalHeight || vinylArt.height;
        let sx = 0, sy = 0, sWidth = iw, sHeight = ih;
        if (iw > ih) {
          sWidth = ih;
          sx = (iw - ih) / 2;
        } else {
          sHeight = iw;
          sy = (ih - iw) / 2;
        }
        ctx.drawImage(vinylArt, sx, sy, sWidth, sHeight, -labelRad, -labelRad, labelRad * 2, labelRad * 2);
        ctx.rotate(-rotationAngle);
      } else {
        ctx.fillStyle = '#e11d48';
        ctx.fill();
      }
      ctx.restore();

      // Center Spindle Hole
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.translate(-centerX, -centerY);
      break;
    }

    // ----------------------------------------------------
    // 9. LIQUID GOLD WAVES
    // ----------------------------------------------------
    case 'liquid_gold': {
      const wavesCount = 3;
      const waveHeightMax = 95 * waveformSize;
      const ptsCount = 8;
      const segment = totalWaveformWidth / (ptsCount - 1);

      for (let w = 0; w < wavesCount; w++) {
        const speedFactor = 0.0018 + w * 0.0009;
        const waveOpacity = 0.18 + (1.0 - w * 0.3) * 0.45;
        const shiftPhase = w * (Math.PI / 2.5);

        const gradLine = ctx.createLinearGradient(startX, 0, startX + totalWaveformWidth, 0);
        gradLine.addColorStop(0, `rgba(180, 130, 80, ${waveOpacity * 0.2})`);
        gradLine.addColorStop(0.5, `rgba(251, 191, 36, ${waveOpacity * 1.5})`);
        gradLine.addColorStop(1, `rgba(255, 230, 180, ${waveOpacity * 0.1})`);

        ctx.strokeStyle = gradLine;
        ctx.lineWidth = (4.5 - w) * 1.2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(245, 158, 11, 0.4)`;

        ctx.beginPath();
        for (let i = 0; i < ptsCount; i++) {
          const px = startX + i * segment;
          const soundIndex = Math.floor((i / ptsCount) * bufferLength * 0.5);
          const frequencyVal = (dataArray[soundIndex] || 0) / 255;
          const reactiveHeight = frequencyVal * waveHeightMax * (1.1 - w * 0.22);
          const osc = Math.sin(globalTimeMs * speedFactor + i * 0.52 + shiftPhase);
          const py = centerY + osc * reactiveHeight - (smoothedBass * 35);

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            const prevX = startX + (i - 1) * segment;
            const prevSoundIndex = Math.floor(((i - 1) / ptsCount) * bufferLength * 0.5);
            const prevFrequencyVal = (dataArray[prevSoundIndex] || 0) / 255;
            const prevReactiveHeight = prevFrequencyVal * waveHeightMax * (1.1 - w * 0.22);
            const prevOsc = Math.sin(globalTimeMs * speedFactor + (i - 1) * 0.52 + shiftPhase);
            const prevY = centerY + prevOsc * prevReactiveHeight - (smoothedBass * 35);

            const cpX1 = prevX + segment / 2;
            const cpY1 = prevY;
            const cpX2 = px - segment / 2;
            const cpY2 = py;
            ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, px, py);
          }
        }
        ctx.stroke();
      }
      break;
    }

    // ----------------------------------------------------
    // 10. STARDUST ORBIT
    // ----------------------------------------------------
    case 'stardust_orbit': {
      ctx.translate(centerX, centerY);
      ctx.globalCompositeOperation = 'screen';
      const radBase = (Math.min(canvasWidth, canvasHeight) / 5) * waveformSize;
      const coreRad = radBase * (1.0 + smoothedBass * 0.2);
      
      // Black hole / glowing core
      drawCenterLogo(ctx, logoImage, bgImage, coreRad - 5, rotationAngle * 0.1, 'transparent');
      
      const arms = 6;
      const particlesPerArm = 60;
      const spiralSpread = 5;
      
      for (let a = 0; a < arms; a++) {
        const armAngle = (a / arms) * Math.PI * 2 + (globalTimeMs * 0.0003);
        
        for (let p = 0; p < particlesPerArm; p++) {
          const pNorm = p / particlesPerArm; // 0 to 1
          
          const freqIndex = Math.floor(pNorm * bufferLength * 0.5);
          const val = (dataArray[freqIndex] || 0) / 255;
          
          // Spiral math
          const radius = coreRad + (pNorm * radBase * spiralSpread) + (val * 40 * waveformSize);
          // Angle lags behind the further out it goes (spiral)
          const angle = armAngle - (pNorm * 4) + (globalTimeMs * 0.001 / (pNorm + 0.1));
          
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          // Color based on distance from core
          const hue = (pNorm * 120 + globalTimeMs * 0.02) % 360;
          ctx.fillStyle = `hsla(${hue}, 100%, 75%, ${0.2 + val * 0.8})`;
          ctx.shadowBlur = 10 + val * 20;
          ctx.shadowColor = `hsla(${hue}, 100%, 65%, 1)`;
          
          // Particle size
          const pSize = (1 + val * 6 + (1 - pNorm) * 3) * waveformSize;
          
          ctx.beginPath();
          ctx.arc(x, y, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Golden core ring
      ctx.shadowBlur = 30 + smoothedBass * 40;
      ctx.shadowColor = "rgba(255, 200, 50, 0.8)";
      ctx.strokeStyle = `rgba(255, 200, 50, ${0.5 + smoothedBass * 0.5})`;
      ctx.lineWidth = 4 + smoothedBass * 5;
      ctx.beginPath();
      ctx.arc(0, 0, coreRad, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalCompositeOperation = 'source-over';
      ctx.translate(-centerX, -centerY);
      break;
    }

    // ----------------------------------------------------
    // 11. AUDIO RING (TRIPLE FREQUENCY RINGS)
    // ----------------------------------------------------
    case 'audio_ring': {
      ctx.translate(centerX, centerY);
      const innermostR = Math.min(canvasWidth, canvasHeight) / 5.5;
      drawCenterLogo(ctx, logoImage, bgImage, innermostR - 10, rotationAngle * 0.05, 'transparent');

      ctx.globalCompositeOperation = 'screen';

      // 1. High Freq - Inner Electric Core
      const highRadius = innermostR + 15 * waveformSize;
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 + smoothedHigh * 0.5})`;
      ctx.shadowBlur = 15 + smoothedHigh * 20;
      ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
      ctx.lineWidth = 3 + smoothedHigh * 2;
      
      const steps = 180;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2 + (globalTimeMs * 0.0015);
        // sample dataArray directly for jagged EQ spikes
        const dataIdx = Math.floor((i / steps) * (bufferLength * 0.5));
        const val = (dataArray[dataIdx] || 0) / 255;
        const r = highRadius + Math.pow(val, 2) * 45 * waveformSize;
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.stroke();

      // 2. Mid Freq - Dual Intertwined Elegant Orbits
      const midRadius = highRadius + 45 * waveformSize;
      ctx.strokeStyle = `rgba(255, 0, 255, ${0.7 + smoothedMid * 0.5})`;
      ctx.shadowBlur = 25 + smoothedMid * 20;
      ctx.shadowColor = "rgba(255, 0, 255, 0.9)";
      ctx.lineWidth = 4 + smoothedMid * 5;

      for (let w = 0; w < 2; w++) {
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          const offset = globalTimeMs * (w === 0 ? 0.002 : -0.0015);
          const wave = Math.sin(angle * (5 + w * 3) + offset) * (15 + smoothedMid * 35) * waveformSize;
          const r = midRadius + wave;
          if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 3. Bass Freq - Cyberpunk Segmented Dash Ring
      const bassRadius = midRadius + 55 * waveformSize + smoothedBass * 25 * waveformSize;
      const segments = 90;
      ctx.strokeStyle = `rgba(255, 200, 0, ${0.8 + smoothedBass * 0.6})`;
      ctx.shadowBlur = 30 + smoothedBass * 40;
      ctx.shadowColor = "rgba(255, 200, 0, 1)";
      ctx.lineWidth = 8 + smoothedBass * 15;
      const spin = globalTimeMs * 0.0006;

      for (let i = 0; i < segments; i++) {
        if (i % 2 === 0) continue; // Dashed effect
        
        const angle = (i / segments) * Math.PI * 2 + spin;
        // Sample bass region smoothly
        const val = (dataArray[i % Math.floor(bufferLength * 0.2)] || 0) / 255;
        const segmentRadius = bassRadius + Math.pow(val, 2) * 50 * waveformSize;
        
        ctx.beginPath();
        // Draw an arc segment
        ctx.arc(0, 0, segmentRadius, angle, angle + (Math.PI * 2 / segments) * 0.7);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.translate(-centerX, -centerY);
      break;
    }

    // ----------------------------------------------------
    // 12. COSMIC MANDALA
    // ----------------------------------------------------
    case 'cosmic_mandala': {
      ctx.translate(centerX, centerY);
      ctx.globalCompositeOperation = 'screen';
      const radBase = (Math.min(canvasWidth, canvasHeight) / 5) * waveformSize;
      
      // Central glowing core
      drawCenterLogo(ctx, logoImage, bgImage, radBase - 15, rotationAngle * 0.05, 'transparent');
      
      const layers = 5;
      for (let i = 0; i < layers; i++) {
        const radius = radBase + (i * 45) + (smoothedBass * 30 * i);
        const sides = 6 + i * 2; // Increasing geometric complexity
        
        const rotation = (globalTimeMs * 0.0005) * (i % 2 === 0 ? 1 : -1) * (1 + i * 0.2);
        
        ctx.beginPath();
        for (let s = 0; s <= sides; s++) {
          const angle = (s / sides) * Math.PI * 2 + rotation;
          
          // Sample data evenly
          const dataIdx = Math.floor((s / sides) * (bufferLength * 0.5));
          const val = (dataArray[dataIdx] || 0) / 255;
          
          // Complex reactivity
          const pulse = (i === 0 ? smoothedBass : i === 1 ? smoothedMid : smoothedHigh);
          const r = radius + Math.sin(angle * (i + 2) + globalTimeMs * 0.001) * (20 + val * 40 + pulse * 20);
          
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        
        // Multi-colored neon mandala layers
        const hue = (globalTimeMs * 0.02 + i * 60) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.4 + smoothedMid * 0.6})`;
        ctx.lineWidth = 2 + (layers - i) * 0.5 + smoothedHigh * 2;
        ctx.shadowBlur = 15 + i * 5 + smoothedBass * 20;
        ctx.shadowColor = `hsla(${hue}, 100%, 65%, 1)`;
        
        ctx.closePath();
        ctx.stroke();
        
        // Draw intersecting star lines for premium geometry feel
        if (i % 2 === 1) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 100%, 75%, 0.5)`;
          ctx.lineWidth = 1;
          for (let s = 0; s < sides; s += 2) {
             const a1 = (s / sides) * Math.PI * 2 + rotation;
             const a2 = ((s + 2) / sides) * Math.PI * 2 + rotation;
             ctx.moveTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
             ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
          }
          ctx.stroke();
        }
      }
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.translate(-centerX, -centerY);
      break;
    }

    // ----------------------------------------------------
    // 13. AURORA BOREALIS
    // ----------------------------------------------------
    case 'aurora': {
      const sliceWidth = totalWaveformWidth / bufferLength;
      const heightAmp = 350 * waveformSize;
      ctx.globalCompositeOperation = 'screen';
      
      for (let layer = 0; layer < 3; layer++) {
        const yOffset = centerY + (layer * 20) - 20;
        const phase = globalTimeMs * 0.001 * (layer + 1) + layer;
        
        ctx.beginPath();
        ctx.moveTo(startX, yOffset);
        for (let i = 0; i < bufferLength; i++) {
          const x = startX + i * sliceWidth;
          const val = (dataArray[i] || 0) / 255;
          const wave = Math.sin(i * 0.1 + phase) * 20;
          const h = val * heightAmp;
          const y = yOffset - h - wave;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(startX + totalWaveformWidth, canvasHeight);
        ctx.lineTo(startX, canvasHeight);
        ctx.closePath();
        
        let color = 'rgba(16, 185, 129, 0.2)';
        if (layer === 1) color = 'rgba(6, 182, 212, 0.15)';
        if (layer === 2) color = 'rgba(139, 92, 246, 0.1)';
        
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color.replace(/0\.\d+\)$/, '0.6)');
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      break;
    }

    // ----------------------------------------------------
    // 14. CYBER MATRIX
    // ----------------------------------------------------
    case 'cyber_matrix': {
      const cols = 64;
      const colW = totalWaveformWidth / cols;
      const gap = colW * 0.25;
      const barW = colW - gap;
      const maxH = 180 * waveformSize;
      
      ctx.translate(centerX, centerY);
      
      // Center glowing axis line
      ctx.beginPath();
      ctx.moveTo(-totalWaveformWidth / 2 - 50, 0);
      ctx.lineTo(totalWaveformWidth / 2 + 50, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();

      ctx.globalCompositeOperation = 'screen';
      
      for (let i = 0; i < cols; i++) {
        // Mirrored frequency index
        const centerOffset = Math.abs(i - cols/2) / (cols/2);
        const dataIdx = Math.floor(centerOffset * (bufferLength * 0.7)); 
        const val = (dataArray[dataIdx] || 0) / 255;
        const h = Math.pow(val, 1.6) * maxH * (1 + smoothedBass * 0.4);
        const x = -totalWaveformWidth / 2 + i * colW;

        if (h > 2) {
          // Top Bar (Luxury Gradient)
          const gradTop = ctx.createLinearGradient(0, 0, 0, -h);
          gradTop.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          gradTop.addColorStop(0.4, 'rgba(200, 230, 255, 0.7)');
          gradTop.addColorStop(1, 'rgba(100, 150, 255, 0)');
          
          ctx.fillStyle = gradTop;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(200, 230, 255, 0.8)';
          ctx.beginPath();
          ctx.roundRect(x, -h, barW, h, barW/2);
          ctx.fill();

          // Bottom Bar (Reflection mirror)
          const gradBot = ctx.createLinearGradient(0, 0, 0, h * 0.6);
          gradBot.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
          gradBot.addColorStop(1, 'rgba(100, 150, 255, 0)');
          ctx.fillStyle = gradBot;
          ctx.beginPath();
          ctx.roundRect(x, 0, barW, h * 0.6, barW/2);
          ctx.fill();

          // Glowing Node at Peak
          ctx.beginPath();
          ctx.arc(x + barW / 2, -h - 8, barW * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#ffffff';
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.translate(-centerX, -centerY);
      break;
    }

    // ----------------------------------------------------
    // 15. DNA DOUBLE HELIX
    // ----------------------------------------------------
    case 'dna_helix': {
      const step = totalWaveformWidth / (bufferLength / 2);
      const phase = globalTimeMs * 0.003;
      const amp = 100 * waveformSize * (1 + smoothedBass);
      
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      
      for (let i = 0; i < bufferLength / 2; i += 4) {
        const x = startX + i * step;
        const val = (dataArray[i] || 0) / 255;
        const localAmp = amp * (0.2 + val * 0.8);
        const y1 = centerY + Math.sin(i * 0.2 + phase) * localAmp;
        const y2 = centerY + Math.sin(i * 0.2 + phase + Math.PI) * localAmp;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + val * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }
      
      ['#ec4899', '#06b6d4'].forEach((color, idx) => {
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.beginPath();
        const strandPhase = phase + (idx * Math.PI);
        for (let i = 0; i < bufferLength / 2; i++) {
          const x = startX + i * step;
          const val = (dataArray[i] || 0) / 255;
          const localAmp = amp * (0.2 + val * 0.8);
          const y = centerY + Math.sin(i * 0.2 + strandPhase) * localAmp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      break;
    }

    // ----------------------------------------------------
    // 16. NEON PERSPECTIVE / SYNTHWAVE HORIZON
    // ----------------------------------------------------
    case 'neon_perspective': {
      const horizonY = centerY + 30; // Push horizon down a bit
      
      ctx.globalCompositeOperation = 'screen';

      // 1. Massive Glowing Premium Sun
      const sunRadius = 130 * waveformSize + smoothedBass * 40;
      const sunY = horizonY - 20 - smoothedBass * 10;
      
      ctx.shadowBlur = 80 + smoothedBass * 50;
      ctx.shadowColor = "rgba(255, 40, 120, 0.9)";
      
      const sunsetGlow = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
      sunsetGlow.addColorStop(0, "rgba(255, 220, 80, 1)");   // Yellow top
      sunsetGlow.addColorStop(0.5, "rgba(255, 100, 100, 0.95)"); // Red/Pink middle
      sunsetGlow.addColorStop(1, "rgba(150, 0, 200, 0.8)"); // Purple bottom
      
      ctx.fillStyle = sunsetGlow;
      ctx.beginPath();
      // Only draw the top half above horizon for perfect retro feel
      ctx.arc(centerX, sunY, sunRadius, Math.PI, Math.PI * 2); 
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over'; // reset for floor

      // 2. Horizon Glow Line (Intense)
      ctx.shadowBlur = 40 + smoothedBass * 20;
      ctx.shadowColor = "rgba(0, 255, 255, 1)";
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 + smoothedBass * 0.5})`;
      ctx.lineWidth = 4 + smoothedBass * 4;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(canvasWidth, horizonY);
      ctx.stroke();

      // 3. Premium 3D Moving Floor Grid
      ctx.shadowBlur = 20;
      
      // Vertical Perspective Lines (Cyan)
      const linesCount = 18;
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + smoothedBass * 0.4})`;
      ctx.lineWidth = 2 + smoothedBass * 2;
      const sway = Math.sin(globalTimeMs * 0.0005) * 80 * smoothedBass; // Subtle grid sway

      for (let i = -linesCount; i <= linesCount; i++) {
        const spreadFactor = (i * canvasWidth) / linesCount;
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        // Expand widely at bottom
        ctx.lineTo(centerX + spreadFactor * (2.0 + smoothedBass * 0.2) + sway, canvasHeight);
        ctx.stroke();
      }

      // Horizontal Scrolling Lines (Pink)
      const horizontalLinesCount = 20;
      ctx.strokeStyle = `rgba(255, 0, 255, ${0.5 + smoothedMid * 0.4})`;
      ctx.shadowColor = "rgba(255, 0, 255, 0.8)";
      
      const scrollOffset = (globalTimeMs * 0.002) % 1.0;
      
      for (let j = 0; j <= horizontalLinesCount; j++) {
        // Use an exponential curve for true 3D depth perception
        const rawNormY = (j + scrollOffset) / horizontalLinesCount;
        if (rawNormY > 1) continue; 
        
        // Depth easing: rawNormY^3 pushes lines closer together at the top (horizon)
        const depthNormY = Math.pow(rawNormY, 3);
        const projectY = horizonY + depthNormY * (canvasHeight - horizonY);
        
        // Fade lines in as they emerge from the horizon
        ctx.globalAlpha = Math.min(1, rawNormY * 3);
        
        ctx.lineWidth = 1 + depthNormY * 4 + smoothedBass * 2; // Thicker as they get closer
        ctx.beginPath();
        ctx.moveTo(0, projectY);
        ctx.lineTo(canvasWidth, projectY);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      
      // 4. Synthwave Audio Particles (floating upwards from horizon)
      ctx.globalCompositeOperation = 'screen';
      const particleCount = 64;
      ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
      for(let i=0; i<particleCount; i++) {
         const pVal = (dataArray[i * 2] || 0) / 255;
         if (pVal < 0.2) continue;
         
         const px = centerX + (i - particleCount/2) * 15 * waveformSize;
         // Particles shoot up from horizon
         const py = horizonY - pVal * 200 * waveformSize - Math.random() * 20;
         
         ctx.beginPath();
         ctx.arc(px, py, 2 + pVal * 4, 0, Math.PI*2);
         ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      break;
    }

    // ----------------------------------------------------
    // 17. CLASSIC SPECTRUM BARS
    // ----------------------------------------------------
    case 'bars': {
      const barWidth = totalWaveformWidth / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const h = ((dataArray[i] || 0) / 255) * 450 * waveformSize;
        const x = startX + i * barWidth;
        ctx.fillRect(x, centerY - h, barWidth - 3, h);
      }
      break;
    }

    // ----------------------------------------------------
    // 18. REFLECTED SPECTRUM BARS
    // ----------------------------------------------------
    case 'reflected': {
      const barWidth = totalWaveformWidth / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const h = ((dataArray[i] || 0) / 255) * 450 * waveformSize;
        const x = startX + i * barWidth;
        ctx.fillRect(x, centerY - h / 2, barWidth - 3, h);
      }
      break;
    }

    // ----------------------------------------------------
    // 19. OSCILLOSCOPE PULSE
    // ----------------------------------------------------
    case 'pulse': {
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] || 0) / 128.0;
        const y = centerY + (v - 1) * 250 * waveformSize;
        const x = startX + i * (totalWaveformWidth / bufferLength);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }

    // ----------------------------------------------------
    // 20. CIRCLES
    // ----------------------------------------------------
    case 'circles': {
      ctx.translate(centerX, centerY);
      
      const logoRadius = 60 * waveformSize; 
      drawCenterLogo(ctx, logoImage, bgImage, logoRadius, rotationAngle * 0.05, 'transparent');

      for (let i = 0; i < bufferLength; i += 4) {
        const r = logoRadius + 10 + ((dataArray[i] || 0) / 255) * 180 * waveformSize;
        ctx.beginPath(); 
        ctx.arc(0, 0, r, 0, Math.PI * 2); 
        ctx.stroke();
      }
      ctx.translate(-centerX, -centerY);
      break;
    }

    // ----------------------------------------------------
    // 21. NEON LINES
    // ----------------------------------------------------
    case 'neon_lines': {
      const sliceWidth = totalWaveformWidth / bufferLength;
      const heightAmp = 250 * waveformSize;
      
      ['rgba(244, 63, 94, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)'].forEach((color, layer) => {
        const yOffset = centerY + (layer - 1) * 20;
        const phase = layer * Math.PI / 3;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 4 - layer;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        
        ctx.beginPath();
        ctx.moveTo(startX, yOffset);
        for (let i = 0; i < bufferLength; i++) {
          const x = startX + i * sliceWidth;
          const val = (dataArray[i] || 0) / 255;
          const wave = Math.sin(i * 0.2 + phase + globalTimeMs * 0.005) * 30 * val;
          const y = yOffset - (val * heightAmp) + wave;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      break;
    }

    // ----------------------------------------------------
    // 22. CUSTOM JS
    // ----------------------------------------------------
    case 'custom_js': {
      if (customVisualizerJs) {
        try {
          const time = globalTimeMs * 0.001;
          const cleanedCode = cleanCustomJsCode(customVisualizerJs);
          
          // Calculate scale factor from Visual Width (%) and Amplitude Size (x)
          const scale = (waveformWidth / 100) * (waveformSize || 1.0);
          
          // Use cached compiled function or compile once
          let renderFn = customJsCompiledCache.get(cleanedCode);
          if (!renderFn) {
            renderFn = new Function('ctx', 'canvas', 'dataArray', 'time', 'params', cleanedCode);
            customJsCompiledCache.set(cleanedCode, renderFn);
          }
          
          // Apply coordinate transform so (X, Y, Scale/Width) seamlessly manipulate the visualizer
          ctx.save();
          
          // Shift origin from default center (canvasWidth/2, canvasHeight/2) to custom (centerX, centerY) with scaling
          ctx.translate(centerX, centerY);
          ctx.scale(scale, scale);
          ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

          const params = {
            centerX,
            centerY,
            width: totalWaveformWidth,
            startX,
            scale,
            size: waveformSize,
            color: waveformColor,
            opacity: waveformOpacity,
            smoothedBass,
            smoothedMid,
            smoothedHigh,
            logoImage,
            bgImage,
            hasLogo: !!(logoImage && logoImage.complete && logoImage.naturalWidth > 0),
            drawCenterLogo: (c: CanvasRenderingContext2D, radius: number, rot: number = 0, fallback: string = 'transparent') => {
              drawCenterLogo(c, logoImage, bgImage, radius, rot, fallback);
            }
          };

          renderFn(ctx, ctx.canvas, dataArray, time, params);
          ctx.restore();
        } catch (err) {
          // If the custom script fails, render a clear, styled glass error badge on canvas
          ctx.save();
          const errBoxWidth = Math.min(canvasWidth * 0.9, 560);
          const errBoxHeight = 54;
          const errX = centerX - errBoxWidth / 2;
          const errY = centerY - errBoxHeight / 2;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 16;
          ctx.shadowColor = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(errX, errY, errBoxWidth, errBoxHeight, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 0;
          ctx.fillText(`⚠️ Custom JS Error: ${(err as Error).message}`, centerX, centerY - 8);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText('Nhấn nút "TỰ ĐỘNG SỬA LỖI & CLEAN CODE" trong bảng điều khiển', centerX, centerY + 12);
          ctx.restore();
        }
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
