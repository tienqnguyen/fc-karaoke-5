import { SmartIntroCard, SmartOutroCard } from '../types';

export interface RenderIntroCardParams {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  introCard: SmartIntroCard;
  currentTime: number;
  coverImage?: HTMLImageElement | null;
}

export interface RenderOutroCardParams {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  outroCard: SmartOutroCard;
  currentTime: number;
  duration: number;
}

/**
 * Renders the Smart Intro Card with smooth animation, glassmorphism, and elegant typography
 */
export function renderSmartIntroCard({
  ctx,
  canvasWidth,
  canvasHeight,
  introCard,
  currentTime,
  coverImage
}: RenderIntroCardParams) {
  if (!introCard.enabled) return;

  const start = introCard.startTime || 0;
  const dur = introCard.duration || 4.5;
  const end = start + dur;

  if (currentTime < start || currentTime > end) return;

  const elapsed = currentTime - start;
  const progress = Math.max(0, Math.min(1, elapsed / dur));

  // Entrance & Exit Easing: 0 to 0.18 (Entrance), 0.18 to 0.82 (Hold/Sustain), 0.82 to 1.0 (Exit)
  let animProgress = 1;
  let alpha = 1;
  let translateY = 0;
  let scale = introCard.scale ?? 1.0;

  if (progress < 0.18) {
    const t = progress / 0.18;
    // Ease out cubic
    animProgress = 1 - Math.pow(1 - t, 3);
    alpha = animProgress;
    translateY = (1 - animProgress) * 45;
  } else if (progress > 0.82) {
    const t = (progress - 0.82) / 0.18;
    // Ease in cubic
    animProgress = 1 - Math.pow(t, 3);
    alpha = animProgress;
    translateY = - (1 - animProgress) * 35;
  }

  const customX = introCard.x !== undefined ? (introCard.x / 100) * canvasWidth : canvasWidth / 2;
  const customY = introCard.y !== undefined ? (introCard.y / 100) * canvasHeight : canvasHeight * 0.22;

  ctx.save();
  ctx.translate(customX, customY + translateY);
  ctx.scale(scale, scale);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const style = introCard.style || 'spotify_glass';

  if (style === 'spotify_glass') {
    renderSpotifyGlassStyle(ctx, introCard, coverImage, progress);
  } else if (style === 'apple_music_minimal') {
    renderAppleMusicMinimalStyle(ctx, introCard, coverImage, progress);
  } else if (style === 'neon_billboard') {
    renderNeonBillboardStyle(ctx, introCard, coverImage, progress);
  } else {
    renderRetroMixtapeStyle(ctx, introCard, coverImage, progress);
  }

  ctx.restore();
}

function renderSpotifyGlassStyle(
  ctx: CanvasRenderingContext2D,
  intro: SmartIntroCard,
  coverImg?: HTMLImageElement | null,
  progress: number = 0
) {
  const cardW = 600;
  const cardH = 140;
  const x = -cardW / 2;
  const y = -cardH / 2;

  // Frosted Glass Backdrop
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;

  const bgGrad = ctx.createLinearGradient(x, y, x + cardW, y + cardH);
  bgGrad.addColorStop(0, 'rgba(24, 24, 27, 0.88)');
  bgGrad.addColorStop(1, 'rgba(9, 9, 11, 0.94)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 24);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Glowing Spotify Green / Neon Edge Highlight
  ctx.strokeStyle = 'rgba(29, 185, 84, 0.5)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 24);
  ctx.stroke();

  // Glass Specular Shimmer
  const shimmer = ctx.createLinearGradient(x, y, x + cardW, y);
  shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  shimmer.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)');
  shimmer.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = shimmer;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, 20, [24, 24, 0, 0]);
  ctx.fill();

  // Album Artwork Square (Left)
  const coverSize = 104;
  const coverX = x + 18;
  const coverY = y + 18;

  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
  ctx.fill();

  if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
    ctx.clip();
    ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
    ctx.restore();
  } else {
    const artGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
    artGrad.addColorStop(0, '#10b981');
    artGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = artGrad;
    ctx.beginPath();
    ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♫', coverX + coverSize / 2, coverY + coverSize / 2);
  }

  // Info Column
  const textLeft = coverX + coverSize + 22;
  const maxTextW = cardW - (textLeft - x) - 26;

  // Header Pill / Spotify Badge
  ctx.fillStyle = '#1ed760';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('NOW PLAYING • SPOTIFY CANVAS', textLeft, y + 20);

  // Song Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Plus Jakarta Sans", Montserrat, sans-serif';
  let titleText = intro.title || 'Track Title';
  if (ctx.measureText(titleText).width > maxTextW) {
    while (titleText.length > 3 && ctx.measureText(titleText + '...').width > maxTextW) {
      titleText = titleText.slice(0, -1);
    }
    titleText += '...';
  }
  ctx.fillText(titleText, textLeft, y + 38);

  // Artist Name
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '600 16px "Plus Jakarta Sans", Montserrat, sans-serif';
  ctx.fillText(intro.artist || 'Artist Name', textLeft, y + 70);

  // Composer / Producer / Tag
  const metaParts: string[] = [];
  if (intro.composer) metaParts.push(`Sáng tác: ${intro.composer}`);
  if (intro.coverBy) metaParts.push(`Cover: ${intro.coverBy}`);
  if (intro.albumOrTag) metaParts.push(intro.albumOrTag);
  const metaText = metaParts.join(' • ') || 'Official Audio Master';

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(metaText, textLeft, y + 95);

  // Micro Progress Bar at bottom of card
  const barW = cardW - 40;
  const barX = x + 20;
  const barY = y + cardH - 8;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, 3, 1.5);
  ctx.fill();

  ctx.fillStyle = '#1ed760';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * (1 - progress), 3, 1.5);
  ctx.fill();
}

function renderAppleMusicMinimalStyle(
  ctx: CanvasRenderingContext2D,
  intro: SmartIntroCard,
  coverImg?: HTMLImageElement | null,
  progress: number = 0
) {
  const cardW = 540;
  const cardH = 120;
  const x = -cardW / 2;
  const y = -cardH / 2;

  // Ultra-Clean Frosted White Glass
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;

  const bgGrad = ctx.createLinearGradient(x, y, x, y + cardH);
  bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  bgGrad.addColorStop(1, 'rgba(240, 240, 245, 0.92)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 20);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Cover Image (Left Circle)
  const coverSize = 84;
  const coverX = x + 18;
  const coverY = y + 18;

  if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(coverX, coverY, coverSize, coverSize, 12);
    ctx.clip();
    ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
    ctx.restore();
  } else {
    ctx.fillStyle = '#fa2d48';
    ctx.beginPath();
    ctx.roundRect(coverX, coverY, coverSize, coverSize, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('', coverX + coverSize / 2, coverY + coverSize / 2);
  }

  const textLeft = coverX + coverSize + 20;
  const maxW = cardW - (textLeft - x) - 20;

  ctx.fillStyle = '#fa2d48';
  ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, "SF Pro", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('APPLE MUSIC EXCLUSIVE', textLeft, y + 20);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillText(intro.title || 'Track Title', textLeft, y + 36, maxW);

  ctx.fillStyle = '#475569';
  ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
  ctx.fillText(intro.artist || 'Artist Name', textLeft, y + 65, maxW);

  const sub = [intro.composer ? `Tác giả: ${intro.composer}` : '', intro.coverBy ? `Cover: ${intro.coverBy}` : ''].filter(Boolean).join(' • ');
  if (sub) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11.5px sans-serif';
    ctx.fillText(sub, textLeft, y + 88, maxW);
  }
}

function renderNeonBillboardStyle(
  ctx: CanvasRenderingContext2D,
  intro: SmartIntroCard,
  coverImg?: HTMLImageElement | null,
  progress: number = 0
) {
  const cardW = 620;
  const cardH = 145;
  const x = -cardW / 2;
  const y = -cardH / 2;

  // Cyberpunk Dark Card
  ctx.fillStyle = 'rgba(10, 10, 18, 0.94)';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 16);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Neon Gradient Border
  const borderGrad = ctx.createLinearGradient(x, y, x + cardW, y);
  borderGrad.addColorStop(0, '#06b6d4');
  borderGrad.addColorStop(0.5, '#ec4899');
  borderGrad.addColorStop(1, '#8b5cf6');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Left Album Art with Neon glow
  const coverSize = 98;
  const coverX = x + 24;
  const coverY = y + 24;

  ctx.save();
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(coverX, coverY, coverSize, coverSize, 10);
  ctx.clip();
  if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) {
    ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
  } else {
    ctx.fillStyle = '#831843';
    ctx.fillRect(coverX, coverY, coverSize, coverSize);
    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', coverX + coverSize / 2, coverY + coverSize / 2);
  }
  ctx.restore();

  const textLeft = coverX + coverSize + 24;
  const maxW = cardW - (textLeft - x) - 20;

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('▶ DIGITAL AUDIO MASTER // HIGH RESOLUTION', textLeft, y + 22);

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 8;
  ctx.font = 'bold 24px monospace';
  ctx.fillText((intro.title || 'TRACK TITLE').toUpperCase(), textLeft, y + 42, maxW);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 16px monospace';
  ctx.fillText((intro.artist || 'ARTIST').toUpperCase(), textLeft, y + 74, maxW);

  const sub = [intro.composer ? `COMPOSER: ${intro.composer}` : '', intro.coverBy ? `COVER: ${intro.coverBy}` : ''].filter(Boolean).join(' | ');
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px monospace';
  ctx.fillText((sub || 'SYNTHWAVE CYBER PRODUCTION').toUpperCase(), textLeft, y + 100, maxW);
}

function renderRetroMixtapeStyle(
  ctx: CanvasRenderingContext2D,
  intro: SmartIntroCard,
  coverImg?: HTMLImageElement | null,
  progress: number = 0
) {
  const cardW = 560;
  const cardH = 130;
  const x = -cardW / 2;
  const y = -cardH / 2;

  // Aged Paper Texture Card
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 12);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Striped Edge
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x + 10, y + 10, cardW - 20, 4);

  const textLeft = x + 24;
  const maxW = cardW - 48;

  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('VINTAGE CASSETTE AUDIO • SIDE A', textLeft, y + 20);

  ctx.fillStyle = '#451a03';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText(`♪ ${intro.title || 'Track Title'}`, textLeft, y + 38, maxW);

  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText(`By: ${intro.artist || 'Artist Name'}`, textLeft, y + 68, maxW);

  const sub = [intro.composer ? `Sáng tác: ${intro.composer}` : '', intro.coverBy ? `Cover: ${intro.coverBy}` : ''].filter(Boolean).join(' • ');
  ctx.fillStyle = '#b45309';
  ctx.font = '600 11px monospace';
  ctx.fillText(sub || 'Analog Tape Master 1980s', textLeft, y + 94, maxW);
}

/**
 * Renders the Smart Outro Card at the ending of the video
 */
export function renderSmartOutroCard({
  ctx,
  canvasWidth,
  canvasHeight,
  outroCard,
  currentTime,
  duration
}: RenderOutroCardParams) {
  if (!outroCard.enabled || duration <= 0) return;

  const outroDuration = outroCard.duration || 5.0;
  const outroStart = Math.max(0, duration - outroDuration);

  if (currentTime < outroStart) return;

  const elapsed = currentTime - outroStart;
  const progress = Math.min(1, elapsed / outroDuration);

  // Smooth Fade-In during the first 1.2s
  const alpha = Math.min(1, elapsed / 1.2);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(canvasWidth / 2, canvasHeight * 0.48);

  const cardW = 620;
  const cardH = 220;
  const x = -cardW / 2;
  const y = -cardH / 2;

  // Dark Frosted Glass Box
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;

  const bgGrad = ctx.createLinearGradient(x, y, x, y + cardH);
  bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
  bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 28);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Glowing Gradient Stroke
  const strokeGrad = ctx.createLinearGradient(x, y, x + cardW, y);
  strokeGrad.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
  strokeGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)');
  strokeGrad.addColorStop(1, 'rgba(236, 72, 153, 0.6)');
  ctx.strokeStyle = strokeGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 28);
  ctx.stroke();

  // Big Thank You / Main Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Plus Jakarta Sans", Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(outroCard.mainText || 'CẢM ƠN BẠN ĐÃ LẮNG NGHE!', 0, y + 36);

  // Subtitle / Follow CTA
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(outroCard.subText || 'Đăng ký kênh & Bật chuông để không bỏ lỡ video mới', 0, y + 80);

  // Social Handle Badge
  if (outroCard.socialHandle) {
    const handle = outroCard.socialHandle.startsWith('@') ? outroCard.socialHandle : `@${outroCard.socialHandle}`;
    const badgeW = 240;
    const badgeH = 38;
    const badgeX = -badgeW / 2;
    const badgeY = y + 128;

    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 19);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 14px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`★ ${handle} ★`, 0, badgeY + badgeH / 2);
  }

  ctx.restore();
}
