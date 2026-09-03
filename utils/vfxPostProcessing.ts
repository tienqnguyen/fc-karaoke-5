import { PostProcessingVfx } from '../types';

interface PostProcessingOptions {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  effect: PostProcessingVfx;
  intensity?: number;
  smoothedBass: number;
  smoothedMid?: number;
  smoothedHigh?: number;
  isPlaying: boolean;
  currentTime?: number;
}

// Reusable offscreen buffers for high-performance blits & multi-pass shader simulation
let scratchCanvasA: HTMLCanvasElement | null = null;
let scratchCtxA: CanvasRenderingContext2D | null = null;

let scratchCanvasB: HTMLCanvasElement | null = null;
let scratchCtxB: CanvasRenderingContext2D | null = null;

function getBufferA(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (!scratchCanvasA) {
    scratchCanvasA = document.createElement('canvas');
  }
  if (scratchCanvasA.width !== w || scratchCanvasA.height !== h) {
    scratchCanvasA.width = w;
    scratchCanvasA.height = h;
  }
  if (!scratchCtxA) {
    scratchCtxA = scratchCanvasA.getContext('2d');
  }
  return scratchCtxA ? { canvas: scratchCanvasA, ctx: scratchCtxA } : null;
}

function getBufferB(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (!scratchCanvasB) {
    scratchCanvasB = document.createElement('canvas');
  }
  if (scratchCanvasB.width !== w || scratchCanvasB.height !== h) {
    scratchCanvasB.width = w;
    scratchCanvasB.height = h;
  }
  if (!scratchCtxB) {
    scratchCtxB = scratchCanvasB.getContext('2d');
  }
  return scratchCtxB ? { canvas: scratchCanvasB, ctx: scratchCtxB } : null;
}

// Organic deterministic pseudo-noise helper
function pseudoNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * SPECTRA Cinema Grade Pro Post-Processing VFX Suite (60FPS Canvas Shader Engine)
 */
export function applyPostProcessingVfx({
  ctx,
  canvasWidth: w,
  canvasHeight: h,
  effect,
  intensity = 1.0,
  smoothedBass,
  smoothedMid = 0,
  smoothedHigh = 0,
  isPlaying,
  currentTime = 0
}: PostProcessingOptions) {
  if (!effect || effect === 'none' || intensity <= 0.01) return;

  const now = performance.now();
  const bassImpact = smoothedBass * intensity;
  const midImpact = (smoothedMid || 0) * intensity;
  const highImpact = (smoothedHigh || 0) * intensity;

  switch (effect) {
    case 'chromatic_aberration': {
      // High-grade RGB Split & Prismatic Lens Dispersion (Smoother)
      const buf = getBufferA(w, h);
      if (!buf) return;

      buf.ctx.clearRect(0, 0, w, h);
      buf.ctx.drawImage(ctx.canvas, 0, 0);

      // Slower, smoother pulse
      const splitDist = Math.max(1.0, (2 + bassImpact * 12) * intensity);
      const pulseAngle = (now * 0.0006) % (Math.PI * 2);
      const dx = Math.cos(pulseAngle) * splitDist;
      const dy = Math.sin(pulseAngle) * splitDist * 0.4;

      ctx.save();
      // Red Channel Shift
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = Math.min(0.85, (0.4 + bassImpact * 0.4) * intensity);
      ctx.drawImage(buf.canvas, dx, dy);

      // Cyan-Blue Channel Shift
      ctx.globalAlpha = Math.min(0.85, (0.4 + bassImpact * 0.4) * intensity);
      ctx.drawImage(buf.canvas, -dx * 1.05, -dy * 1.05);

      // Elegant edge chromatic fringing
      const radialGradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.9);
      radialGradient.addColorStop(0, 'rgba(0,0,0,0)');
      radialGradient.addColorStop(0.6, `rgba(220, 20, 60, ${0.1 * intensity * (1 + bassImpact)})`);
      radialGradient.addColorStop(1, `rgba(0, 191, 255, ${0.2 * intensity * (1 + bassImpact)})`);
      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      break;
    }

    case 'vhs_retro': {
      // Authentic Analog 1989 VHS Cassette Camcorder:
      // Multi-layer phosphor scanlines, tracking noise bars, tape jitter, timestamp & color bleed
      ctx.save();

      // 1. Subtle horizontal jitter on bass hit
      const jitter = (Math.random() - 0.5) * (1.5 + bassImpact * 8) * intensity;
      if (Math.abs(jitter) > 1.0) {
        const buf = getBufferA(w, h);
        if (buf) {
          buf.ctx.clearRect(0, 0, w, h);
          buf.ctx.drawImage(ctx.canvas, 0, 0);
          ctx.drawImage(buf.canvas, jitter, 0);
        }
      }

      // 2. High-density TV Phosphor Scanlines (with smooth moving phase)
      const lineStep = 3.5;
      const phase = (now * 0.04) % lineStep;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * intensity})`;
      for (let y = phase; y < h; y += lineStep) {
        ctx.fillRect(0, y, w, 1.4);
      }

      // 3. Dynamic Tape Tracking Noise Glitch Bar on Heavy Bass or Periodic Noise
      const isGlitching = bassImpact > 0.4 || Math.random() < 0.12;
      if (isGlitching) {
        const glitchY = Math.floor(Math.random() * (h - 60));
        const glitchH = 6 + Math.random() * (28 * (1 + bassImpact));
        const glitchShift = (Math.random() - 0.5) * (45 * intensity);

        // Displace the slice
        ctx.drawImage(ctx.canvas, 0, glitchY, w, glitchH, glitchShift, glitchY, w, glitchH);

        // VHS Tape static noise speckles inside glitch bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 30; i++) {
          const rx = Math.random() * w;
          const ry = glitchY + Math.random() * glitchH;
          ctx.fillRect(rx, ry, Math.random() * 20 + 4, 1.5);
        }

        // Cyan / Magenta tracking color artifact
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 211, 238, 0.22)' : 'rgba(244, 63, 94, 0.22)';
        ctx.fillRect(0, glitchY, w, glitchH);
      }

      // 4. VHS OSD (On-Screen Display) Camcorder HUD in Corner
      ctx.font = 'bold 22px "Courier New", Courier, monospace';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;

      const sec = Math.floor(currentTime);
      const min = Math.floor(sec / 60);
      const frames = Math.floor((currentTime % 1) * 30);
      const timeCode = `PLAY  \u25B6  ${String(min).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}:${String(frames).padStart(2, '0')}  SP`;

      // Flashing REC / VCR indicator
      const blink = Math.floor(now / 500) % 2 === 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(timeCode, 45, h - 50);

      ctx.fillStyle = blink ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(w - 75, 45, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('HI-FI STEREO', w - 195, 50);

      // 5. Vintage Tape Color Warmth & Vignette
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(30, 25, 10, 0.15)';
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      break;
    }

    case 'film_grain': {
      // Kodak 35mm Master Film Stock Grain & Cinematic Halation
      ctx.save();

      // Film grain particles with random Gaussian-like distribution
      ctx.globalCompositeOperation = 'screen';
      const grainCount = Math.floor(550 * intensity);
      
      // Light grain
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      for (let i = 0; i < grainCount; i++) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        const size = Math.random() * 2.0 + 0.6;
        ctx.fillRect(gx, gy, size, size);
      }

      // Dark silver halide speckles
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(15, 12, 10, 0.22)';
      for (let i = 0; i < grainCount * 0.75; i++) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        const size = Math.random() * 1.8 + 0.6;
        ctx.fillRect(gx, gy, size, size);
      }

      // Warm cinematic film gate tone & soft corner halation
      ctx.globalCompositeOperation = 'soft-light';
      const filmGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.85);
      filmGrad.addColorStop(0, 'rgba(255, 248, 230, 0.08)');
      filmGrad.addColorStop(0.7, 'rgba(240, 180, 120, 0.15)');
      filmGrad.addColorStop(1, `rgba(40, 15, 5, ${0.5 * intensity})`);
      ctx.fillStyle = filmGrad;
      ctx.fillRect(0, 0, w, h);

      // Film gate dust / hair occasional artifact
      if (Math.random() < 0.05) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const hx = Math.random() * w;
        const hy = Math.random() * h;
        ctx.moveTo(hx, hy);
        ctx.bezierCurveTo(hx + 10, hy + 5, hx + 5, hy + 20, hx + 15, hy + 30);
        ctx.stroke();
      }

      ctx.restore();
      break;
    }

    case 'anamorphic_lens_flare': {
      // Hollywood Anamorphic Blue / Amber Streak Flare & Prismatic Iris Rings (Smoother, higher quality)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Slower, smoother undulating vertical position
      const flareY = h * 0.42 + Math.sin(now * 0.0007) * (h * 0.05) + Math.cos(now * 0.0004) * (h * 0.03);
      const flareWidth = w * (0.9 + bassImpact * 0.6);
      const flareHeight = (12 + bassImpact * 35) * intensity;

      // 1. Primary Horizontal Streak (Classic Panavision Blue & Teal)
      const flareGrad = ctx.createLinearGradient(w / 2 - flareWidth / 2, flareY, w / 2 + flareWidth / 2, flareY);
      flareGrad.addColorStop(0, 'rgba(14, 165, 233, 0)');
      flareGrad.addColorStop(0.2, `rgba(14, 165, 233, ${0.25 * intensity * (0.6 + bassImpact * 1.2)})`);
      flareGrad.addColorStop(0.45, `rgba(125, 211, 252, ${0.65 * intensity * (0.7 + bassImpact * 1.5)})`);
      flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.85 * intensity * (0.8 + bassImpact * 1.8)})`);
      flareGrad.addColorStop(0.55, `rgba(168, 85, 247, ${0.65 * intensity * (0.7 + bassImpact * 1.5)})`);
      flareGrad.addColorStop(0.8, `rgba(168, 85, 247, ${0.25 * intensity * (0.6 + bassImpact * 1.2)})`);
      flareGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = flareGrad;
      ctx.fillRect(w / 2 - flareWidth / 2, flareY - flareHeight / 2, flareWidth, flareHeight);

      // 2. Central Core Light Burst
      const burstRadius = (40 + bassImpact * 90) * intensity;
      const burstGrad = ctx.createRadialGradient(w / 2, flareY, 0, w / 2, flareY, burstRadius);
      burstGrad.addColorStop(0, `rgba(255, 255, 255, ${0.75 * intensity})`);
      burstGrad.addColorStop(0.25, `rgba(56, 189, 248, ${0.35 * intensity})`);
      burstGrad.addColorStop(0.6, `rgba(147, 51, 234, ${0.15 * intensity})`);
      burstGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(w / 2, flareY, burstRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Diagonal iris ghosts reflecting opposite along the optical axis
      // Make them glide smoothly
      const ghostOffset = (w * 0.18) * (1 + Math.sin(now * 0.0005));
      const ghostRadius = 20 + bassImpact * 30;
      
      const ghostGrad1 = ctx.createRadialGradient(w / 2 + ghostOffset, flareY + 40, 0, w / 2 + ghostOffset, flareY + 40, ghostRadius);
      ghostGrad1.addColorStop(0, `rgba(234, 179, 8, ${0.25 * intensity})`);
      ghostGrad1.addColorStop(0.7, `rgba(239, 68, 68, ${0.1 * intensity})`);
      ghostGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ghostGrad1;
      ctx.beginPath();
      ctx.arc(w / 2 + ghostOffset, flareY + 40, ghostRadius, 0, Math.PI * 2);
      ctx.fill();
      
      const ghostGrad2 = ctx.createRadialGradient(w / 2 - ghostOffset * 1.2, flareY - 30, 0, w / 2 - ghostOffset * 1.2, flareY - 30, ghostRadius * 0.6);
      ghostGrad2.addColorStop(0, `rgba(14, 165, 233, ${0.2 * intensity})`);
      ghostGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ghostGrad2;
      ctx.beginPath();
      ctx.arc(w / 2 - ghostOffset * 1.2, flareY - 30, ghostRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'neon_glow_bloom': {
      // High-End Multi-Pass Diffusion Bloom (Cyberpunk Neon Aura)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const bloomAlpha = Math.min(0.85, (0.2 + bassImpact * 0.8) * intensity);
      const centerX = w / 2;
      const centerY = h * 0.48;

      // Outer wide soft diffusion
      const outerBloom = ctx.createRadialGradient(centerX, centerY, w * 0.1, centerX, centerY, w * 0.85);
      outerBloom.addColorStop(0, `rgba(168, 85, 247, ${bloomAlpha * 0.6})`);
      outerBloom.addColorStop(0.4, `rgba(59, 130, 246, ${bloomAlpha * 0.4})`);
      outerBloom.addColorStop(0.8, `rgba(6, 182, 212, ${bloomAlpha * 0.18})`);
      outerBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerBloom;
      ctx.fillRect(0, 0, w, h);

      // Core intense hot pink/cyan burst
      const coreBloom = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, w * 0.35);
      coreBloom.addColorStop(0, `rgba(255, 255, 255, ${bloomAlpha * 0.5})`);
      coreBloom.addColorStop(0.5, `rgba(236, 72, 153, ${bloomAlpha * 0.45})`);
      coreBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreBloom;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      break;
    }

    case 'vignette_focus': {
      // Cinema Anamorphic Feathered Vignette (Concentrates eye on center performer)
      ctx.save();
      const vignetteGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.28, w / 2, h / 2, w * 0.82);
      const edgeDarkness = Math.min(0.95, (0.55 + bassImpact * 0.4) * intensity);
      
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGrad.addColorStop(0.65, `rgba(0, 0, 0, ${edgeDarkness * 0.5})`);
      vignetteGrad.addColorStop(1, `rgba(0, 0, 0, ${edgeDarkness})`);

      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle cyan rim accent on the dark border
      if (bassImpact > 0.2) {
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * intensity * bassImpact})`;
        ctx.lineWidth = 14;
        ctx.strokeRect(7, 7, w - 14, h - 14);
      }

      ctx.restore();
      break;
    }

    case 'glitch_cyberpunk': {
      // Pro Cyberpunk 2077 Matrix Slice & Digital Glitch Dislocation (Slower, Cinema grade)
      ctx.save();
      
      // Time-stepped random for stable glitches (holds for ~120ms)
      const timeStep = Math.floor(now / 150); 
      const getNoise = (seed: number) => {
        const x = Math.sin(timeStep * seed + 12.345) * 10000;
        return x - Math.floor(x);
      };

      const glitchChance = bassImpact > 0.4 ? 0.9 : (getNoise(1) < 0.15 ? 0.6 : 0.0);

      if (glitchChance > 0.5) {
        const buf = getBufferA(w, h);
        if (buf) {
          buf.ctx.clearRect(0, 0, w, h);
          buf.ctx.drawImage(ctx.canvas, 0, 0);

          const slicesCount = Math.floor((2 + bassImpact * 5) * intensity);
          for (let i = 0; i < slicesCount; i++) {
            const sliceY = Math.floor(getNoise(i + 2) * (h - 40));
            const sliceH = Math.floor(8 + getNoise(i + 3) * (20 + bassImpact * 30));
            const offset = (getNoise(i + 4) - 0.5) * (25 + bassImpact * 50) * intensity;

            ctx.drawImage(buf.canvas, 0, sliceY, w, sliceH, offset, sliceY, w, sliceH);

            // Digital matrix neon lines inside slice
            ctx.fillStyle = i % 2 === 0 ? `rgba(0, 255, 200, ${0.15 + bassImpact*0.15})` : `rgba(255, 0, 128, ${0.15 + bassImpact*0.15})`;
            ctx.fillRect(0, sliceY, w, 2);
          }

          // RGB displacement layer - smoother
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = Math.min(0.6, 0.15 + bassImpact * 0.35);
          ctx.drawImage(buf.canvas, 5 * intensity, -2 * intensity);
        }
      }

      // Digital Grid lines - scroll slowly
      ctx.strokeStyle = `rgba(0, 255, 200, ${0.03 * intensity})`;
      ctx.lineWidth = 1;
      const gridGap = 45;
      const scrollY = (now * 0.015) % gridGap;
      for (let y = scrollY; y < h; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      
      // Vignette to center focus
      const grad = ctx.createRadialGradient(w/2, h/2, w*0.35, w/2, h/2, w);
      grad.addColorStop(0, 'rgba(0, 10, 20, 0)');
      grad.addColorStop(1, `rgba(0, 20, 40, ${0.3 * intensity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      break;
    }

    case 'light_leak_vintage': {
      // Dreamy Organic Sun Flares & Film Light Leaks (Golden Hour Nostalgia)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const timeT = now * 0.0006 + currentTime * 0.3;
      const leakX = w * (0.15 + Math.sin(timeT) * 0.3);
      const leakY = h * (0.2 + Math.cos(timeT * 0.8) * 0.25);
      const leakRadius = (w * 0.65) * (1 + bassImpact * 0.4) * intensity;

      const leakGrad = ctx.createRadialGradient(leakX, leakY, 0, leakX, leakY, leakRadius);
      leakGrad.addColorStop(0, `rgba(251, 146, 60, ${0.65 * intensity})`); // Warm amber
      leakGrad.addColorStop(0.35, `rgba(244, 63, 94, ${0.45 * intensity})`); // Rose coral
      leakGrad.addColorStop(0.7, `rgba(168, 85, 247, ${0.2 * intensity})`); // Twilight violet
      leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = leakGrad;
      ctx.fillRect(0, 0, w, h);

      // Secondary opposing soft cyan flare
      const leakGrad2 = ctx.createRadialGradient(w - leakX, h - leakY, 0, w - leakX, h - leakY, leakRadius * 0.7);
      leakGrad2.addColorStop(0, `rgba(56, 189, 248, ${0.35 * intensity})`);
      leakGrad2.addColorStop(0.6, `rgba(99, 102, 241, ${0.15 * intensity})`);
      leakGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = leakGrad2;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      break;
    }

    case 'radial_zoom_blur': {
      // Speed Warp / Hyperspace Radial Zoom Blur on Kick Drums
      if (bassImpact < 0.1) return;

      const buf = getBufferA(w, h);
      if (!buf) return;

      buf.ctx.clearRect(0, 0, w, h);
      buf.ctx.drawImage(ctx.canvas, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const passes = Math.min(8, Math.max(3, Math.floor(4 + bassImpact * 6)));
      const maxZoom = 1.0 + (0.02 + bassImpact * 0.08) * intensity;

      for (let p = 1; p <= passes; p++) {
        const factor = 1.0 + ((maxZoom - 1.0) / passes) * p;
        const alpha = (0.28 / passes) * intensity;
        ctx.globalAlpha = alpha;

        const newW = w * factor;
        const newH = h * factor;
        const offsetX = (w - newW) / 2;
        const offsetY = (h - newH) / 2;

        ctx.drawImage(buf.canvas, offsetX, offsetY, newW, newH);
      }

      ctx.restore();
      break;
    }

    case 'scanline_crt': {
      // Arcade CRT Television & Arcade Monitor Phosphor Grid
      ctx.save();
      
      // Horizontal scanlines
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * intensity})`;
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1.2);
      }

      // Vertical RGB shadow mask dots
      ctx.fillStyle = `rgba(0, 0, 0, ${0.12 * intensity})`;
      for (let x = 0; x < w; x += 4) {
        ctx.fillRect(x, 0, 1.2, h);
      }

      // Barrel distortion simulated vignette
      const crtVignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.85);
      crtVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      crtVignette.addColorStop(0.8, `rgba(0, 0, 0, ${0.4 * intensity})`);
      crtVignette.addColorStop(1, `rgba(0, 0, 0, ${0.85 * intensity})`);
      ctx.fillStyle = crtVignette;
      ctx.fillRect(0, 0, w, h);

      // CRT Refresh line scanning downwards
      const scanY = (now * 0.25) % h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      scanGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.15 * intensity})`);
      scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, w, 60);

      ctx.restore();
      break;
    }

    case 'golden_bokeh': {
      // Cinema Golden Bokeh Discs & Floating Stardust Light (VIP Luxury Atmosphere)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const timeT = now * 0.0007 + currentTime * 0.25;

      // 1. Soft Warm Gold Ambient Diffusion
      const ambientGrad = ctx.createRadialGradient(w / 2, h * 0.65, w * 0.15, w / 2, h * 0.65, w * 0.85);
      ambientGrad.addColorStop(0, `rgba(251, 191, 36, ${0.12 * intensity * (1 + bassImpact * 0.5)})`);
      ambientGrad.addColorStop(0.5, `rgba(217, 119, 6, ${0.08 * intensity})`);
      ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Large & Medium Out-of-Focus Golden Bokeh Spheres with Cinema Lens Aperture Rims
      const bokehOrbs = [
        { baseX: 0.18, baseY: 0.35, r: 65, speed: 0.8, phase: 0 },
        { baseX: 0.82, baseY: 0.28, r: 85, speed: 0.6, phase: 1.8 },
        { baseX: 0.32, baseY: 0.72, r: 100, speed: 0.9, phase: 3.2 },
        { baseX: 0.70, baseY: 0.68, r: 75, speed: 0.7, phase: 4.5 },
        { baseX: 0.50, baseY: 0.22, r: 50, speed: 1.1, phase: 2.1 },
        { baseX: 0.12, baseY: 0.80, r: 90, speed: 0.5, phase: 5.0 },
        { baseX: 0.88, baseY: 0.78, r: 60, speed: 1.0, phase: 0.9 },
      ];

      for (const orb of bokehOrbs) {
        // Floating organic drift
        const ox = w * orb.baseX + Math.sin(timeT * orb.speed + orb.phase) * (w * 0.06);
        const oy = h * orb.baseY + Math.cos(timeT * (orb.speed * 0.8) + orb.phase) * (h * 0.05);
        const currentR = orb.r * (1 + bassImpact * 0.45) * (0.8 + intensity * 0.25);

        // Core soft warm gradient
        const orbGrad = ctx.createRadialGradient(ox, oy, currentR * 0.1, ox, oy, currentR);
        orbGrad.addColorStop(0, `rgba(255, 251, 235, ${0.45 * intensity})`); // Warm white center highlight
        orbGrad.addColorStop(0.35, `rgba(251, 191, 36, ${0.28 * intensity * (1 + bassImpact * 0.4)})`); // Bright gold
        orbGrad.addColorStop(0.75, `rgba(217, 119, 6, ${0.14 * intensity})`); // Amber
        orbGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');

        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, currentR, 0, Math.PI * 2);
        ctx.fill();

        // Optical cinema lens aperture ring
        ctx.strokeStyle = `rgba(252, 211, 77, ${0.32 * intensity * (0.6 + bassImpact * 0.7)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(ox, oy, currentR * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Floating Specular Stardust & Golden Micro-Fleck Glimmers
      const dustCount = 45;
      for (let i = 0; i < dustCount; i++) {
        const seed = i * 137.5;
        const dx = (w * ((seed * 0.01 + timeT * 0.03) % 1));
        const dy = (h * (((seed * 0.007 + Math.sin(timeT * 0.05 + i)) % 1 + 1) % 1));
        const twinkle = Math.sin(timeT * 2.5 + i * 2.0);
        
        if (twinkle > 0) {
          const dustSize = 1.2 + Math.abs(twinkle) * 2.2;
          const dustAlpha = Math.min(0.9, (0.2 + twinkle * 0.7) * intensity * (1 + bassImpact * 0.6));

          ctx.fillStyle = `rgba(254, 240, 138, ${dustAlpha})`;
          ctx.beginPath();
          ctx.arc(dx, dy, dustSize, 0, Math.PI * 2);
          ctx.fill();

          // Delicate horizontal lens glint on brightest specks
          if (twinkle > 0.8) {
            ctx.fillStyle = `rgba(255, 255, 255, ${dustAlpha * 0.6})`;
            ctx.fillRect(dx - 5, dy - 0.5, 10, 1);
          }
        }
      }

      ctx.restore();
      break;
    }
  }
}
