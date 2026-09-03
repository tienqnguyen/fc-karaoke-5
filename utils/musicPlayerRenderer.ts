import { MusicPlayerStyle, MusicPlayerTheme } from '../types';

export interface MusicPlayerRenderOptions {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  style: MusicPlayerStyle;
  title: string;
  artist: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  scale: number;
  opacity: number;
  theme: MusicPlayerTheme;
  showButtons: boolean;
  showTimer: boolean;
  showProgress: boolean;
  showCover: boolean;
  showWaveform?: boolean;
  coverImage: HTMLImageElement | null;
  dataArray?: Uint8Array;
  smoothedBass?: number;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function renderOnVideoMusicPlayer(options: MusicPlayerRenderOptions) {
  const {
    ctx,
    canvasWidth,
    canvasHeight,
    currentTime,
    duration,
    isPlaying,
    style,
    title = 'Untitled Track',
    artist = 'Unknown Artist',
    x,
    y,
    scale = 1.0,
    opacity = 1.0,
    theme = 'dark_glass',
    showButtons = true,
    showTimer = true,
    showProgress = true,
    showCover = true,
    showWaveform = true,
    coverImage,
    dataArray,
    smoothedBass = 0.5
  } = options;

  if (opacity <= 0.01) return;

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const timeStr = formatTime(currentTime);
  const totalStr = formatTime(duration);
  const displayTitle = title.trim() || 'Lofi Chill Beats';
  const displayArtist = artist.trim() || 'Lofi Vibes Studio';

  const posX = (x / 100) * canvasWidth;
  const posY = (y / 100) * canvasHeight;

  ctx.save();
  ctx.translate(posX, posY);
  ctx.scale(scale, scale);
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  switch (style) {
    case 'lofi_cassette':
      renderLofiCassette();
      break;
    case 'spotify_bar':
      renderSpotifyBar();
      break;
    case 'retro_vinyl_card':
      renderRetroVinylCard();
      break;
    case 'minimal_timer_badge':
      renderMinimalTimerBadge();
      break;
    case 'cyber_hologram':
      renderCyberHologram();
      break;
    case 'neon_synthwave':
      renderNeonSynthwave();
      break;
    case 'apple_dynamic_island':
      renderAppleDynamicIsland();
      break;
    case 'vintage_ipod':
      renderVintageIpod();
      break;
    case 'glow_cd_case':
      renderGlowCdCase();
      break;
    case 'modern_glass':
    default:
      renderModernGlassCard();
      break;
  }

  ctx.restore();

  // -------------------------------------------------------------
  // 1. MODERN GLASS CARD (Apple / Spotify Studio HUD)
  // -------------------------------------------------------------
  function renderModernGlassCard() {
    const cardW = 540;
    const cardH = 170;
    const cardX = -cardW / 2;
    const cardY = -cardH / 2;

    // Theme Color Sets
    let bgFill = 'rgba(15, 23, 42, 0.78)';
    let borderStroke = 'rgba(255, 255, 255, 0.18)';
    let primaryText = '#ffffff';
    let subText = '#94a3b8';
    let accentGradStart = '#38bdf8';
    let accentGradEnd = '#818cf8';
    let thumbGlow = '#38bdf8';

    if (theme === 'lofi_pastel') {
      bgFill = 'rgba(30, 27, 46, 0.82)';
      borderStroke = 'rgba(244, 114, 182, 0.3)';
      primaryText = '#fdf2f8';
      subText = '#f472b6';
      accentGradStart = '#f472b6';
      accentGradEnd = '#c084fc';
      thumbGlow = '#f472b6';
    } else if (theme === 'cyberpunk') {
      bgFill = 'rgba(10, 10, 20, 0.88)';
      borderStroke = 'rgba(6, 182, 212, 0.45)';
      primaryText = '#22d3ee';
      subText = '#f43f5e';
      accentGradStart = '#06b6d4';
      accentGradEnd = '#f43f5e';
      thumbGlow = '#22d3ee';
    } else if (theme === 'warm_amber') {
      bgFill = 'rgba(26, 18, 11, 0.82)';
      borderStroke = 'rgba(245, 158, 11, 0.35)';
      primaryText = '#fef3c7';
      subText = '#fbbf24';
      accentGradStart = '#f59e0b';
      accentGradEnd = '#ef4444';
      thumbGlow = '#f59e0b';
    } else if (theme === 'clean_white') {
      bgFill = 'rgba(255, 255, 255, 0.9)';
      borderStroke = 'rgba(0, 0, 0, 0.12)';
      primaryText = '#0f172a';
      subText = '#64748b';
      accentGradStart = '#6366f1';
      accentGradEnd = '#a855f7';
      thumbGlow = '#6366f1';
    }

    // Outer Glow & Glass Card Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = bgFill;
    ctx.strokeStyle = borderStroke;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Top Gloss Highlight
    const gloss = ctx.createLinearGradient(cardX, cardY, cardX, cardY + 50);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, 50, [20, 20, 0, 0]);
    ctx.fill();

    let contentLeft = cardX + 24;

    // Album Artwork Cover Thumbnail
    if (showCover) {
      const coverSize = 118;
      const coverX = cardX + 22;
      const coverY = cardY + (cardH - coverSize) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
      ctx.clip();

      if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
        ctx.drawImage(coverImage, coverX, coverY, coverSize, coverSize);
      } else {
        // Fallback procedural artwork
        const artGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
        artGrad.addColorStop(0, accentGradStart);
        artGrad.addColorStop(1, accentGradEnd);
        ctx.fillStyle = artGrad;
        ctx.fillRect(coverX, coverY, coverSize, coverSize);

        // Music Note icon
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♫', coverX + coverSize / 2, coverY + coverSize / 2);
      }

      // Vinyl spin overlay if playing
      if (isPlaying) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(coverX + coverSize / 2, coverY + coverSize / 2, coverSize * 0.35, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Border around cover
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
      ctx.stroke();

      contentLeft = coverX + coverSize + 22;
    }

    const contentWidth = (cardX + cardW - 24) - contentLeft;

    // Song Title & Animated Soundwave Bars
    ctx.fillStyle = primaryText;
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Truncate title if too long
    let trimmedTitle = displayTitle;
    if (ctx.measureText(trimmedTitle).width > contentWidth - 60) {
      while (trimmedTitle.length > 3 && ctx.measureText(trimmedTitle + '...').width > contentWidth - 60) {
        trimmedTitle = trimmedTitle.slice(0, -1);
      }
      trimmedTitle += '...';
    }
    ctx.fillText(trimmedTitle, contentLeft, cardY + 24);

    // Mini Live Equalizer Waveform beside title
    if (showWaveform) {
      const waveX = contentLeft + ctx.measureText(trimmedTitle).width + 12;
      const waveY = cardY + 27;
      const t = Date.now() * 0.008;
      for (let b = 0; b < 4; b++) {
        const val = dataArray ? (dataArray[b * 4] || 0) : 0;
        const bh = isPlaying ? 4 + (val / 255) * 16 : 4;
        ctx.fillStyle = accentGradStart;
        ctx.fillRect(waveX + b * 5, waveY + (12 - bh), 3, bh);
      }
    }

    // Artist Name
    ctx.fillStyle = subText;
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(displayArtist, contentLeft, cardY + 52);

    // Progress Bar
    const progY = cardY + 82;
    const progW = contentWidth;
    const progH = 6;

    if (showProgress) {
      // Background track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(contentLeft, progY, progW, progH, 3);
      ctx.fill();

      // Filled track
      const fillW = Math.max(progH, progW * progress);
      const progGrad = ctx.createLinearGradient(contentLeft, 0, contentLeft + fillW, 0);
      progGrad.addColorStop(0, accentGradStart);
      progGrad.addColorStop(1, accentGradEnd);

      ctx.fillStyle = progGrad;
      ctx.beginPath();
      ctx.roundRect(contentLeft, progY, fillW, progH, 3);
      ctx.fill();

      // Scrubber Thumb Point
      const thumbX = contentLeft + fillW;
      ctx.shadowColor = thumbGlow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(thumbX, progY + progH / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Timer & Status Indicator
    if (showTimer) {
      ctx.fillStyle = subText;
      ctx.font = '600 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(timeStr, contentLeft, cardY + 98);
      ctx.textAlign = 'right';
      ctx.fillText(totalStr, contentLeft + progW, cardY + 98);
    }

    // Interactive/Rendered Player Control Icons
    if (showButtons) {
      const btnCenterY = cardY + 134;
      const btnCenterX = contentLeft + progW / 2;

      // Shuffle icon
      drawIconShuffle(btnCenterX - 85, btnCenterY, 14, subText);

      // Prev Button
      drawIconPrev(btnCenterX - 45, btnCenterY, 16, primaryText);

      // Main Play/Pause Circle
      const playR = 18;
      const playGrad = ctx.createLinearGradient(btnCenterX - playR, btnCenterY - playR, btnCenterX + playR, btnCenterY + playR);
      playGrad.addColorStop(0, accentGradStart);
      playGrad.addColorStop(1, accentGradEnd);
      ctx.fillStyle = playGrad;
      ctx.shadowColor = thumbGlow;
      ctx.shadowBlur = isPlaying ? 14 : 6;
      ctx.beginPath();
      ctx.arc(btnCenterX, btnCenterY, playR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Play or Pause Glyph
      if (isPlaying) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(btnCenterX - 5, btnCenterY - 6, 3.5, 12);
        ctx.fillRect(btnCenterX + 1.5, btnCenterY - 6, 3.5, 12);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(btnCenterX - 4, btnCenterY - 7);
        ctx.lineTo(btnCenterX + 6, btnCenterY);
        ctx.lineTo(btnCenterX - 4, btnCenterY + 7);
        ctx.closePath();
        ctx.fill();
      }

      // Next Button
      drawIconNext(btnCenterX + 45, btnCenterY, 16, primaryText);

      // Repeat icon
      drawIconRepeat(btnCenterX + 85, btnCenterY, 14, subText);
    }
  }

  // -------------------------------------------------------------
  // 2. LOFI CASSETTE TAPE PLAYER (Ultra-Realistic Vintage Analog & Animated)
  // -------------------------------------------------------------
  function renderLofiCassette() {
    const tapeW = 500;
    const tapeH = 290;
    const tapeX = -tapeW / 2;
    const tapeY = -tapeH / 2;

    // Theme Color Palette Configuration
    let shellBase = '#1a1720';
    let shellHighlight = '#302b3c';
    let shellBorder = '#4a4358';
    let labelBg = '#fff5ea';
    let labelBorder = '#e2d4c0';
    let labelStripe1 = '#f472b6';
    let labelStripe2 = '#db2777';
    let textPrimary = '#1e1b26';
    let textSecondary = '#831843';
    let accentGlow = '#f472b6';
    let windowTint = 'rgba(18, 14, 24, 0.94)';
    let tapeOxideColor = '#382218';
    let tapeOxideBorder = '#25150e';

    if (theme === 'lofi_pastel') {
      shellBase = '#221a2c';
      shellHighlight = '#382b48';
      shellBorder = '#6b4f88';
      labelBg = '#fff0f6';
      labelBorder = '#fbcfe8';
      labelStripe1 = '#f472b6';
      labelStripe2 = '#c084fc';
      textPrimary = '#3b0764';
      textSecondary = '#9333ea';
      accentGlow = '#f472b6';
      windowTint = 'rgba(28, 18, 40, 0.95)';
    } else if (theme === 'sunset_neon' || theme === 'warm_amber' || (theme as string) === 'vintage_warm') {
      shellBase = '#241b12';
      shellHighlight = '#3d2e1f';
      shellBorder = '#6b4e2f';
      labelBg = '#fef7e8';
      labelBorder = '#fde68a';
      labelStripe1 = '#f59e0b';
      labelStripe2 = '#d97706';
      textPrimary = '#451a03';
      textSecondary = '#b45309';
      accentGlow = '#f59e0b';
      windowTint = 'rgba(26, 17, 10, 0.95)';
      tapeOxideColor = '#3f2214';
    } else if (theme === 'cyberpunk' || (theme as string) === 'cyber_glow') {
      shellBase = '#090e1a';
      shellHighlight = '#131e33';
      shellBorder = '#06b6d4';
      labelBg = '#0b1324';
      labelBorder = '#1e293b';
      labelStripe1 = '#06b6d4';
      labelStripe2 = '#f43f5e';
      textPrimary = '#38bdf8';
      textSecondary = '#f43f5e';
      accentGlow = '#22d3ee';
      windowTint = 'rgba(5, 10, 22, 0.96)';
      tapeOxideColor = '#162238';
      tapeOxideBorder = '#0c1626';
    } else if (theme === 'clean_white') {
      shellBase = '#f1f5f9';
      shellHighlight = '#ffffff';
      shellBorder = '#cbd5e1';
      labelBg = '#ffffff';
      labelBorder = '#e2e8f0';
      labelStripe1 = '#3b82f6';
      labelStripe2 = '#ef4444';
      textPrimary = '#0f172a';
      textSecondary = '#64748b';
      accentGlow = '#3b82f6';
      windowTint = 'rgba(241, 245, 249, 0.88)';
      tapeOxideColor = '#473024';
    } else {
      // dark_glass & default stealth
      shellBase = '#141416';
      shellHighlight = '#27272a';
      shellBorder = '#3f3f46';
      labelBg = '#222226';
      labelBorder = '#3f3f46';
      labelStripe1 = '#38bdf8';
      labelStripe2 = '#818cf8';
      textPrimary = '#f4f4f5';
      textSecondary = '#a1a1aa';
      accentGlow = '#38bdf8';
      windowTint = 'rgba(12, 12, 14, 0.96)';
    }

    // -------------------------------------------------------------
    // A. 3D OUTER CASSETTE SHELL CASING
    // -------------------------------------------------------------
    // Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;

    // Outer Shell Body
    const shellGrad = ctx.createLinearGradient(tapeX, tapeY, tapeX, tapeY + tapeH);
    shellGrad.addColorStop(0, shellHighlight);
    shellGrad.addColorStop(0.12, shellBase);
    shellGrad.addColorStop(0.88, shellBase);
    shellGrad.addColorStop(1, '#0b090e');
    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.roundRect(tapeX, tapeY, tapeW, tapeH, 20);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Shell Bevel Border Stroke
    ctx.strokeStyle = shellBorder;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(tapeX + 1, tapeY + 1, tapeW - 2, tapeH - 2, 19);
    ctx.stroke();

    // Inner Rim Highlight for 3D Inset Effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tapeX + 6, tapeY + 6, tapeW - 12, tapeH - 12, 14);
    ctx.stroke();

    // Top Write-Protect Notches (Authentic Cassette Indentations)
    ctx.fillStyle = '#0a080d';
    ctx.fillRect(tapeX + 45, tapeY, 32, 7);
    ctx.fillRect(tapeX + tapeW - 77, tapeY, 32, 7);
    ctx.strokeStyle = shellBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(tapeX + 45, tapeY, 32, 7);
    ctx.strokeRect(tapeX + tapeW - 77, tapeY, 32, 7);

    // Left & Right Tactile Ribbed Grip Strips
    for (let r = 0; r < 5; r++) {
      const gripY = tapeY + 45 + r * 14;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(tapeX + 9, gripY, 6, 8);
      ctx.fillRect(tapeX + tapeW - 15, gripY, 6, 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(tapeX + 9, gripY + 1, 6, 2);
      ctx.fillRect(tapeX + tapeW - 15, gripY + 1, 6, 2);
    }

    // Metallic Precision Cross Screws (5 Screws: 4 corners + 1 center bottom)
    const screwPositions = [
      [tapeX + 18, tapeY + 18],
      [tapeX + tapeW - 18, tapeY + 18],
      [tapeX + 18, tapeY + tapeH - 18],
      [tapeX + tapeW - 18, tapeY + tapeH - 18],
      [tapeX + tapeW / 2, tapeY + tapeH - 12]
    ];
    screwPositions.forEach(([sx, sy]) => {
      // Screw Well
      ctx.fillStyle = '#08070b';
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Metal Head
      const screwGrad = ctx.createRadialGradient(sx - 1, sy - 1, 0.5, sx, sy, 4.5);
      screwGrad.addColorStop(0, '#e2e8f0');
      screwGrad.addColorStop(0.5, '#94a3b8');
      screwGrad.addColorStop(1, '#475569');
      ctx.fillStyle = screwGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Cross Slot Cut
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx - 2.6, sy); ctx.lineTo(sx + 2.6, sy);
      ctx.moveTo(sx, sy - 2.6); ctx.lineTo(sx, sy + 2.6);
      ctx.stroke();
    });

    // -------------------------------------------------------------
    // B. BOTTOM TAPE HEAD TRAPEZOID HOUSING & ROLLERS
    // -------------------------------------------------------------
    const trapTopW = tapeW - 170;
    const trapBotW = tapeW - 110;
    const trapTopY = tapeY + tapeH - 52;
    const trapBotY = tapeY + tapeH - 3;
    const trapLeftTop = tapeX + (tapeW - trapTopW) / 2;
    const trapRightTop = tapeX + (tapeW + trapTopW) / 2;
    const trapLeftBot = tapeX + (tapeW - trapBotW) / 2;
    const trapRightBot = tapeX + (tapeW + trapBotW) / 2;

    // Trapezoid Cutout Well
    ctx.fillStyle = '#100e14';
    ctx.beginPath();
    ctx.moveTo(trapLeftBot, trapBotY);
    ctx.lineTo(trapRightBot, trapBotY);
    ctx.lineTo(trapRightTop, trapTopY);
    ctx.lineTo(trapLeftTop, trapTopY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shellBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Central Magnetic Tape Head / Pressure Pad
    const headX = tapeX + tapeW / 2;
    const headY = trapTopY + 22;
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.roundRect(headX - 22, headY - 10, 44, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Central Head Core
    ctx.fillStyle = '#d97706';
    ctx.fillRect(headX - 6, headY - 7, 12, 14);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(headX - 2, headY - 7, 4, 14);

    // Left & Right Chrome / Brass Tape Guide Rollers
    [trapLeftTop + 24, trapRightTop - 24].forEach((rx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(rx, headY, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Brass Roller
      const rGrad = ctx.createRadialGradient(rx - 1, headY - 1, 1, rx, headY, 7);
      rGrad.addColorStop(0, '#fef08a');
      rGrad.addColorStop(0.6, '#b45309');
      rGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(rx, headY, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Pin Center
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(rx, headY, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // -------------------------------------------------------------
    // C. VINTAGE PAPER CASSETTE STICKER LABEL
    // -------------------------------------------------------------
    const labelW = tapeW - 48;
    const labelH = 158;
    const labelX = tapeX + 24;
    const labelY = tapeY + 24;

    // Label Sticker Shadow & Body
    ctx.fillStyle = labelBg;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelW, labelH, 12);
    ctx.fill();
    ctx.strokeStyle = labelBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top Decorative Dual Retro Pinstripes
    const pinstripeH = 6;
    ctx.fillStyle = labelStripe1;
    ctx.fillRect(labelX + 8, labelY + 6, labelW - 16, pinstripeH);
    ctx.fillStyle = labelStripe2;
    ctx.fillRect(labelX + 8, labelY + 12, labelW - 16, pinstripeH / 2);

    // Album Artwork Polaroid / Stamp (if showCover is true)
    let labelContentLeft = labelX + 16;
    if (showCover) {
      const coverSize = 52;
      const coverX = labelX + 14;
      const coverY = labelY + 22;

      // Polaroid Outer Frame
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.roundRect(coverX - 3, coverY - 3, coverSize + 6, coverSize + 14, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Album Image or Stylized Placeholder
      if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 3);
        ctx.clip();
        ctx.drawImage(coverImage, coverX, coverY, coverSize, coverSize);
        ctx.restore();
      } else {
        const coverGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
        coverGrad.addColorStop(0, labelStripe1);
        coverGrad.addColorStop(1, labelStripe2);
        ctx.fillStyle = coverGrad;
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 3);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♫', coverX + coverSize / 2, coverY + coverSize / 2);
      }

      // Micro Label on Polaroid
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MIXTAPE', coverX + coverSize / 2, coverY + coverSize + 5);

      labelContentLeft = coverX + coverSize + 16;
    }

    // Cassette Vintage Header Brand & Type
    ctx.fillStyle = textSecondary;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('LO-FI STEREO CHILL • TYPE I (Fe) NORMAL BIAS 120µs EQ', labelContentLeft, labelY + 22);

    // SIDE A Badge
    const sideBadgeW = 34;
    const sideBadgeH = 15;
    const sideBadgeX = labelX + labelW - sideBadgeW - 14;
    const sideBadgeY = labelY + 20;
    ctx.fillStyle = labelStripe2;
    ctx.beginPath();
    ctx.roundRect(sideBadgeX, sideBadgeY, sideBadgeW, sideBadgeH, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SIDE A', sideBadgeX + sideBadgeW / 2, sideBadgeY + sideBadgeH / 2);

    // Track Title (Handwritten Typewriter with Ruled Line)
    const availableTitleW = sideBadgeX - labelContentLeft - 10;
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 15px "Courier New", monospace, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let trimmedTitle = displayTitle;
    if (ctx.measureText('A ‣ ' + trimmedTitle).width > availableTitleW) {
      while (trimmedTitle.length > 2 && ctx.measureText('A ‣ ' + trimmedTitle + '...').width > availableTitleW) {
        trimmedTitle = trimmedTitle.slice(0, -1);
      }
      trimmedTitle += '...';
    }
    ctx.fillText(`A ‣ ${trimmedTitle.toUpperCase()}`, labelContentLeft, labelY + 36);

    // Ruled Line Under Track
    ctx.strokeStyle = labelBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(labelContentLeft, labelY + 54);
    ctx.lineTo(labelX + labelW - 14, labelY + 54);
    ctx.stroke();

    // Artist Name & Audio Markings
    ctx.fillStyle = textSecondary;
    ctx.font = '600 11px "Courier New", monospace';
    let trimmedArtist = displayArtist;
    if (ctx.measureText('ARTIST: ' + trimmedArtist).width > availableTitleW) {
      while (trimmedArtist.length > 2 && ctx.measureText('ARTIST: ' + trimmedArtist + '...').width > availableTitleW) {
        trimmedArtist = trimmedArtist.slice(0, -1);
      }
      trimmedArtist += '...';
    }
    ctx.fillText(`ARTIST: ${trimmedArtist.toUpperCase()}`, labelContentLeft, labelY + 58);

    // Dolby & Spec Badges
    ctx.fillStyle = textSecondary;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('DO [DOLBY B-NR] • HIGH OUTPUT', labelX + labelW - 14, labelY + 60);

    // -------------------------------------------------------------
    // D. CENTER SMOKED ACRYLIC VIEWING WINDOW & SPOOLS
    // -------------------------------------------------------------
    const winW = 270;
    const winH = 74;
    const winX = tapeX + (tapeW - winW) / 2;
    const winY = tapeY + 104;

    // Window Inset Well Shadow
    ctx.fillStyle = '#060508';
    ctx.beginPath();
    ctx.roundRect(winX - 3, winY - 3, winW + 6, winH + 6, 15);
    ctx.fill();

    // Window Acrylic Glass Body
    ctx.fillStyle = windowTint;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 12);
    ctx.fill();

    // Window Neon / Color Highlight Border
    ctx.strokeStyle = accentGlow;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 12);
    ctx.stroke();

    // Glass Specular Shine Glint
    const glassGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY + winH);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)');
    glassGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 12);
    ctx.fill();

    // Left & Right Spool Positions
    const leftSpoolX = winX + 54;
    const rightSpoolX = winX + winW - 54;
    const spoolY = winY + winH / 2;
    const baseHubR = 19;
    const maxCoilAddition = 24;

    // Smooth Rotation Speed when Playing
    const rotSpeed = isPlaying ? currentTime * 3.2 : 0;

    // 1. Magnetic Tape Coil Physics (Left decreases, Right increases)
    const leftTapeR = baseHubR + (1 - progress) * maxCoilAddition;
    const rightTapeR = baseHubR + progress * maxCoilAddition;

    // Draw Magnetic Oxide Tape Packs
    [
      { sx: leftSpoolX, tr: leftTapeR },
      { sx: rightSpoolX, tr: rightTapeR }
    ].forEach(({ sx, tr }) => {
      // Magnetic Oxide Layer
      const oxideGrad = ctx.createRadialGradient(sx, spoolY, baseHubR, sx, spoolY, tr);
      oxideGrad.addColorStop(0, '#1c120c');
      oxideGrad.addColorStop(0.8, tapeOxideColor);
      oxideGrad.addColorStop(1, tapeOxideBorder);
      ctx.fillStyle = oxideGrad;
      ctx.beginPath();
      ctx.arc(sx, spoolY, tr, 0, Math.PI * 2);
      ctx.fill();

      // Magnetic Tape Concentric Wind Texture Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let cr = baseHubR + 4; cr < tr - 2; cr += 4) {
        ctx.beginPath();
        ctx.arc(sx, spoolY, cr, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Connecting Tape Ribbon (Straight & Taut between spools)
    ctx.fillStyle = tapeOxideColor;
    ctx.fillRect(leftSpoolX, spoolY + 12, rightSpoolX - leftSpoolX, 5);
    ctx.strokeStyle = tapeOxideBorder;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(leftSpoolX, spoolY + 12, rightSpoolX - leftSpoolX, 5);

    // 2. Rotating Precision 6-Tooth White Gear Hubs
    [leftSpoolX, rightSpoolX].forEach((sx, idx) => {
      // White Plastic Hub Ring
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(sx, spoolY, baseHubR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Hub Rim
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Spinning Gear Teeth
      ctx.save();
      ctx.translate(sx, spoolY);
      ctx.rotate(rotSpeed + (idx * 0.5));

      // Spindle Center Hole
      ctx.fillStyle = '#09080c';
      ctx.beginPath();
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // 6 Notched Teeth
      for (let g = 0; g < 6; g++) {
        const ga = (g * Math.PI) / 3;
        ctx.fillStyle = '#1e1b24';
        const gx = Math.cos(ga) * 10;
        const gy = Math.sin(ga) * 10;
        ctx.beginPath();
        ctx.arc(gx, gy, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3 Inner Hub Splines
      ctx.fillStyle = '#e2e8f0';
      for (let s = 0; s < 3; s++) {
        const sa = (s * Math.PI * 2) / 3;
        ctx.fillRect(Math.cos(sa) * 6 - 1.5, Math.sin(sa) * 6 - 1.5, 3, 3);
      }

      ctx.restore();
    });

    // 3. Central Tape Scale Gauge & Reference Ruler
    const gaugeW = 70;
    const gaugeX = winX + (winW - gaugeW) / 2;
    const gaugeY = winY + 14;

    // Scale Hashmarks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('100', gaugeX, gaugeY);
    ctx.fillText('50', gaugeX + gaugeW / 2, gaugeY);
    ctx.fillText('0', gaugeX + gaugeW, gaugeY);

    // Hash Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let h = 0; h <= 10; h++) {
      const hx = gaugeX + (h / 10) * gaugeW;
      const hLen = h === 0 || h === 5 || h === 10 ? 6 : 3;
      ctx.beginPath();
      ctx.moveTo(hx, gaugeY + 9);
      ctx.lineTo(hx, gaugeY + 9 + hLen);
      ctx.stroke();
    }

    // Red Center Alignment Reference Line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(winX + winW / 2, gaugeY + 8);
    ctx.lineTo(winX + winW / 2, winY + winH - 12);
    ctx.stroke();

    // -------------------------------------------------------------
    // E. AUDIO-REACTIVE STEREO VU METER & MECHANICAL TAPE COUNTER
    // -------------------------------------------------------------
    // 1. 3-Digit Analog Mechanical Roller Counter [ 0 4 2 ]
    const counterX = winX + winW / 2 - 28;
    const counterY = winY + winH - 24;
    const counterW = 56;
    const counterH = 16;

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(counterX, counterY, counterW, counterH, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Digits
    const tapeCountNum = Math.floor((currentTime * 1.5) % 999);
    const countStr = tapeCountNum.toString().padStart(3, '0');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let d = 0; d < 3; d++) {
      const dx = counterX + 10 + d * 18;
      // Tumbler divider
      if (d > 0) {
        ctx.strokeStyle = '#333333';
        ctx.beginPath();
        ctx.moveTo(dx - 9, counterY + 2);
        ctx.lineTo(dx - 9, counterY + counterH - 2);
        ctx.stroke();
      }
      ctx.fillText(countStr[d], dx, counterY + counterH / 2 + 1);
    }

    // 2. Real-Time Audio Reactive Mini VU Meter (L & R Stereo Peaks)
    if (showWaveform) {
      const vuW = 32;
      const vuY = winY + winH / 2 - 4;
      const vuLeftX = winX + 8;
      const vuRightX = winX + winW - vuW - 8;

      // Bass & Audio Level Calculations
      const bassEnergy = Math.min(1, Math.max(0, (smoothedBass || 0.4) * 1.2));
      const midVal = dataArray && dataArray.length > 8 ? (dataArray[8] || 0) / 255 : 0.3;

      [
        { vx: vuLeftX, lvl: isPlaying ? bassEnergy : 0.1, label: 'L' },
        { vx: vuRightX, lvl: isPlaying ? Math.min(1, (bassEnergy + midVal) / 2) : 0.1, label: 'R' }
      ].forEach(({ vx, lvl, label }) => {
        // VU Channel Label
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, vx + vuW / 2, vuY - 6);

        // 5 LED Segments
        for (let seg = 0; seg < 5; seg++) {
          const segX = vx + seg * 6;
          const segLit = lvl > (seg * 0.2);
          
          let ledColor = '#10b981'; // Green (Normal)
          if (seg === 3) ledColor = '#f59e0b'; // Amber (Warm)
          if (seg === 4) ledColor = '#ef4444'; // Red (Peak)

          ctx.fillStyle = segLit ? ledColor : 'rgba(255,255,255,0.1)';
          if (segLit && isPlaying) {
            ctx.shadowColor = ledColor;
            ctx.shadowBlur = 4;
          }
          ctx.fillRect(segX, vuY, 4, 8);
          ctx.shadowBlur = 0;
        }
      });
    }

    // 3. Glowing "PLAY / REC" LED Indicator Light
    const ledX = labelX + labelW - 14;
    const ledY = labelY + labelH - 12;
    const isLedLit = isPlaying;
    
    ctx.fillStyle = isLedLit ? '#ef4444' : '#4b5563';
    if (isLedLit) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.arc(ledX, ledY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = isLedLit ? textPrimary : '#6b7280';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPlaying ? '● PLAY' : '○ STOP', ledX - 7, ledY);

    // -------------------------------------------------------------
    // F. RETRO PROGRESS BAR & TIMECODE
    // -------------------------------------------------------------
    // Analog Tape Progress Timeline Bar
    if (showProgress) {
      const progBarW = tapeW - 64;
      const progBarX = tapeX + 32;
      const progBarY = trapTopY - 14;
      const progBarH = 5;

      // Track Groove
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(progBarX, progBarY, progBarW, progBarH, 2.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Active Progress Fill
      const fillW = Math.max(progBarH, progBarW * progress);
      const progGrad = ctx.createLinearGradient(progBarX, 0, progBarX + fillW, 0);
      progGrad.addColorStop(0, labelStripe1);
      progGrad.addColorStop(1, labelStripe2);
      ctx.fillStyle = progGrad;
      ctx.beginPath();
      ctx.roundRect(progBarX, progBarY, fillW, progBarH, 2.5);
      ctx.fill();

      // Magnetic Scrubber Pin
      const pinX = progBarX + fillW;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = accentGlow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pinX, progBarY + progBarH / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // High-Contrast Retro Digital Timecode (LCD Time Display)
    if (showTimer) {
      const timerW = 120;
      const timerH = 18;
      const timerX = tapeX + (tapeW - timerW) / 2;
      const timerY = trapTopY - 36;

      ctx.fillStyle = 'rgba(10, 8, 14, 0.9)';
      ctx.beginPath();
      ctx.roundRect(timerX, timerY, timerW, timerH, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10.5px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${timeStr} / ${totalStr}`, timerX + timerW / 2, timerY + timerH / 2 + 1);
    }

    // -------------------------------------------------------------
    // G. PHYSICAL MECHANICAL CASSETTE PIANO-KEY BUTTONS
    // -------------------------------------------------------------
    if (showButtons) {
      const btns = [
        { label: 'REW', icon: 'prev' },
        { label: 'PLAY', icon: 'play', active: isPlaying },
        { label: 'PAUSE', icon: 'pause', active: !isPlaying },
        { label: 'FF', icon: 'next' },
        { label: 'EJECT', icon: 'eject' }
      ];

      const totalBtnsW = 260;
      const btnW = 46;
      const btnH = 18;
      const btnStartX = tapeX + (tapeW - totalBtnsW) / 2;
      const btnY = trapBotY - 14;

      btns.forEach((btn, i) => {
        const bx = btnStartX + i * 54;
        const isBtnActive = !!btn.active;

        // Metallic Key Shading
        const keyGrad = ctx.createLinearGradient(bx, btnY, bx, btnY + btnH);
        if (isBtnActive) {
          keyGrad.addColorStop(0, '#475569');
          keyGrad.addColorStop(1, '#1e293b');
        } else {
          keyGrad.addColorStop(0, '#94a3b8');
          keyGrad.addColorStop(0.5, '#64748b');
          keyGrad.addColorStop(1, '#334155');
        }

        ctx.fillStyle = keyGrad;
        ctx.beginPath();
        ctx.roundRect(bx, isBtnActive ? btnY + 2 : btnY, btnW, isBtnActive ? btnH - 2 : btnH, 3);
        ctx.fill();

        ctx.strokeStyle = isBtnActive ? accentGlow : '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Button Icon & Label
        ctx.fillStyle = isBtnActive ? '#ffffff' : '#f8fafc';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, bx + btnW / 2, btnY + btnH / 2 + (isBtnActive ? 1 : 0));
      });
    }
  }

  // -------------------------------------------------------------
  // 3. SPOTIFY SLEEK FLOATING DOCK (Minimalist Pill / Island)
  // -------------------------------------------------------------
  function renderSpotifyBar() {
    const barW = 560;
    const barH = 72;
    const barX = -barW / 2;
    const barY = -barH / 2;

    // Glowing Pill Background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(18, 18, 18, 0.92)';
    ctx.strokeStyle = '#1db954';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 36);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Thumbnail
    const coverR = 24;
    const coverX = barX + 38;
    const coverY = barY + barH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(coverX, coverY, coverR, 0, Math.PI * 2);
    ctx.clip();
    if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
      ctx.drawImage(coverImage, coverX - coverR, coverY - coverR, coverR * 2, coverR * 2);
    } else {
      ctx.fillStyle = '#1db954';
      ctx.fillRect(coverX - coverR, coverY - coverR, coverR * 2, coverR * 2);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♫', coverX, coverY);
    }
    ctx.restore();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(coverX, coverY, coverR, 0, Math.PI * 2);
    ctx.stroke();

    // Track Title & Artist
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(displayTitle, barX + 74, barY + 33);

    ctx.fillStyle = '#b3b3b3';
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(displayArtist, barX + 74, barY + 52);

    // Mini Live Dynamic Waveform
    if (showWaveform) {
      const waveStartX = barX + 270;
      const waveCenterY = barY + 36;
      for (let i = 0; i < 6; i++) {
        const val = dataArray ? (dataArray[i * 3] || 0) : 0;
        const waveH = isPlaying ? 3 + (val / 255) * 16 : 3;
        ctx.fillStyle = '#1db954';
        ctx.fillRect(waveStartX + i * 6, waveCenterY - waveH / 2, 3, waveH);
      }
    }

    // Play/Pause Button
    const playX = barX + barW - 130;
    const playY = barY + barH / 2;
    ctx.fillStyle = '#1db954';
    ctx.beginPath();
    ctx.arc(playX, playY, 17, 0, Math.PI * 2);
    ctx.fill();

    if (isPlaying) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(playX - 4, playY - 5, 3, 10);
      ctx.fillRect(playX + 1, playY - 5, 3, 10);
    } else {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(playX - 3, playY - 6);
      ctx.lineTo(playX + 5, playY);
      ctx.lineTo(playX - 3, playY + 6);
      ctx.closePath();
      ctx.fill();
    }

    // Timer Pill Badge
    if (showTimer) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${timeStr}`, barX + barW - 32, barY + 33);
      ctx.fillStyle = '#888888';
      ctx.fillText(`${totalStr}`, barX + barW - 32, barY + 50);
    }

    // Progress Bar at Bottom of Pill
    if (showProgress) {
      const pbX = barX + 24;
      const pbY = barY + barH - 4;
      const pbW = barW - 48;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(pbX, pbY, pbW, 3);

      ctx.fillStyle = '#1db954';
      ctx.fillRect(pbX, pbY, pbW * progress, 3);
    }
  }

  // -------------------------------------------------------------
  // 4. RETRO VINYL CARD (Record Popping Out of Sleeve)
  // -------------------------------------------------------------
  function renderRetroVinylCard() {
    const sleeveW = 320;
    const sleeveH = 160;
    const sleeveX = -sleeveW / 2 - 40;
    const sleeveY = -sleeveH / 2;

    // Vinyl Record Popping Out Right
    const vinylX = sleeveX + sleeveW - 40;
    const vinylY = sleeveY + sleeveH / 2;
    const vinylR = 68;

    ctx.save();
    ctx.translate(vinylX, vinylY);
    if (isPlaying) ctx.rotate(currentTime * 1.8);

    // Vinyl Black Grooves
    ctx.fillStyle = '#111111';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, vinylR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Concentric Grooves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 24; r < vinylR - 4; r += 7) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center Label Artwork
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // Center Spindle Hole
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Card Sleeve
    ctx.fillStyle = 'rgba(28, 25, 23, 0.95)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.roundRect(sleeveX, sleeveY, sleeveW, sleeveH, 14);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Sleeve Content
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 18px "Georgia", serif';
    ctx.textAlign = 'left';
    ctx.fillText(displayTitle, sleeveX + 22, sleeveY + 36);

    ctx.fillStyle = '#d97706';
    ctx.font = 'italic 13px "Georgia", serif';
    ctx.fillText(`By ${displayArtist}`, sleeveX + 22, sleeveY + 60);

    // Progress Bar
    if (showProgress) {
      const pW = sleeveW - 44;
      const pY = sleeveY + 90;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(sleeveX + 22, pY, pW, 4);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(sleeveX + 22, pY, pW * progress, 4);
    }

    // Timestamps
    if (showTimer) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${timeStr} / ${totalStr}`, sleeveX + 22, sleeveY + 124);
    }
  }

  // -------------------------------------------------------------
  // 5. MINIMAL TIMER BADGE (Cinematic Floating Timecode)
  // -------------------------------------------------------------
  function renderMinimalTimerBadge() {
    const badgeW = 280;
    const badgeH = 50;
    const badgeX = -badgeW / 2;
    const badgeY = -badgeH / 2;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Play indicator pulsing dot
    ctx.fillStyle = isPlaying ? '#38bdf8' : '#94a3b8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = isPlaying ? 8 : 0;
    ctx.beginPath();
    ctx.arc(badgeX + 22, badgeY + badgeH / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Time text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${timeStr} / ${totalStr}`, badgeX + 36, badgeY + badgeH / 2);

    // Mini Live Equalizer Spectrum on the right
    if (showWaveform) {
      const specStartX = badgeX + badgeW - 65;
      for (let i = 0; i < 5; i++) {
        const val = dataArray ? (dataArray[i * 4] || 0) : 0;
        const bh = isPlaying ? 3 + (val / 255) * 12 : 3;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(specStartX + i * 6, badgeY + badgeH / 2 - bh / 2, 3, bh);
      }
    }
  }

  // -------------------------------------------------------------
  // 6. CYBER HOLOGRAM (Sci-Fi Futuristic Panel)
  // -------------------------------------------------------------
  function renderCyberHologram() {
    const cardW = 500;
    const cardH = 140;
    const cardX = -cardW / 2;
    const cardY = -cardH / 2;

    const cyan = '#0ff';
    const darkBg = 'rgba(0, 20, 20, 0.85)';

    // Hexagon/Cyber Frame
    ctx.fillStyle = darkBg;
    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2;
    ctx.shadowColor = cyan;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(cardX + 20, cardY);
    ctx.lineTo(cardX + cardW - 20, cardY);
    ctx.lineTo(cardX + cardW, cardY + 20);
    ctx.lineTo(cardX + cardW, cardY + cardH - 20);
    ctx.lineTo(cardX + cardW - 20, cardY + cardH);
    ctx.lineTo(cardX + 20, cardY + cardH);
    ctx.lineTo(cardX, cardY + cardH - 20);
    ctx.lineTo(cardX, cardY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Scanlines
    ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
    for (let i = 0; i < cardH; i += 4) {
      ctx.fillRect(cardX, cardY + i, cardW, 2);
    }

    if (showCover) {
      const coverSize = 100;
      const cx = cardX + 20;
      const cy = cardY + 20;
      ctx.strokeStyle = cyan;
      ctx.strokeRect(cx, cy, coverSize, coverSize);
      if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(coverImage, cx, cy, coverSize, coverSize);
        ctx.globalAlpha = 1.0;
      } else {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.fillRect(cx, cy, coverSize, coverSize);
      }
    }

    const contentLeft = showCover ? cardX + 140 : cardX + 30;

    // Title & Artist (Glitch/Cyber Font style)
    ctx.fillStyle = cyan;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(displayTitle.toUpperCase(), contentLeft, cardY + 40);
    ctx.fillStyle = '#0a9';
    ctx.font = '14px monospace';
    ctx.fillText(`// ${displayArtist.toUpperCase()}`, contentLeft, cardY + 65);

    // Waveform
    if (showWaveform) {
      const waveStartX = contentLeft;
      const waveY = cardY + 90;
      ctx.beginPath();
      ctx.strokeStyle = cyan;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) {
        const val = dataArray ? (dataArray[i * 2] || 0) : 0;
        const h = isPlaying ? 2 + (val / 255) * 28 : 2;
        const wx = waveStartX + i * 6;
        if (i === 0) ctx.moveTo(wx, waveY);
        else ctx.lineTo(wx, waveY - h);
      }
      ctx.stroke();
    }

    // Progress & Timer
    if (showProgress) {
      const pY = cardY + 115;
      const pW = cardW - (contentLeft - cardX) - 20;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.fillRect(contentLeft, pY, pW, 4);
      ctx.fillStyle = cyan;
      ctx.fillRect(contentLeft, pY, pW * progress, 4);
    }
    
    if (showTimer) {
      ctx.fillStyle = cyan;
      ctx.font = '10px monospace';
      ctx.fillText(`T:${timeStr} / END:${totalStr}`, contentLeft, cardY + 110);
    }
  }

  // -------------------------------------------------------------
  // 7. NEON SYNTHWAVE (Retro 80s Outrun)
  // -------------------------------------------------------------
  function renderNeonSynthwave() {
    const cardW = 520;
    const cardH = 150;
    const cardX = -cardW / 2;
    const cardY = -cardH / 2;

    const hotPink = '#ff00ff';
    const cyan = '#00ffff';

    ctx.fillStyle = 'rgba(15, 5, 25, 0.85)';
    ctx.strokeStyle = hotPink;
    ctx.lineWidth = 3;
    ctx.shadowColor = hotPink;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Grid Background in Card
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < cardW; i += 20) {
      ctx.beginPath(); ctx.moveTo(cardX + i, cardY); ctx.lineTo(cardX + i - 40, cardY + cardH); ctx.stroke();
    }
    for (let i = 0; i < cardH; i += 20) {
      ctx.beginPath(); ctx.moveTo(cardX, cardY + i); ctx.lineTo(cardX + cardW, cardY + i); ctx.stroke();
    }
    ctx.restore();

    if (showCover) {
      const coverSize = 110;
      const cx = cardX + 20;
      const cy = cardY + 20;
      ctx.shadowColor = cyan;
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#000';
      ctx.fillRect(cx, cy, coverSize, coverSize);
      ctx.shadowBlur = 0;
      
      if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
        ctx.drawImage(coverImage, cx, cy, coverSize, coverSize);
      }
      
      // Synthwave sun overlay on cover
      const sunY = cy + coverSize/2;
      const sunGrad = ctx.createLinearGradient(0, cy, 0, cy + coverSize);
      sunGrad.addColorStop(0, '#ffff00');
      sunGrad.addColorStop(1, hotPink);
      ctx.fillStyle = sunGrad;
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.arc(cx + coverSize/2, cy + coverSize/2, coverSize/2 - 10, 0, Math.PI*2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    const contentLeft = showCover ? cardX + 150 : cardX + 30;

    ctx.fillStyle = cyan;
    ctx.shadowColor = cyan;
    ctx.shadowBlur = 8;
    ctx.font = 'italic 900 24px sans-serif';
    ctx.fillText(displayTitle, contentLeft, cardY + 45);

    ctx.fillStyle = hotPink;
    ctx.shadowColor = hotPink;
    ctx.shadowBlur = 5;
    ctx.font = '20px "Brush Script MT", cursive';
    ctx.fillText(displayArtist, contentLeft, cardY + 75);
    ctx.shadowBlur = 0;

    if (showWaveform) {
      const waveX = contentLeft;
      const waveY = cardY + 100;
      for (let i = 0; i < 20; i++) {
        const val = dataArray ? (dataArray[i * 3] || 0) : 0;
        const h = isPlaying ? 3 + (val / 255) * 20 : 3;
        ctx.fillStyle = i % 2 === 0 ? hotPink : cyan;
        ctx.fillRect(waveX + i * 10, waveY - h, 6, h);
      }
    }

    if (showProgress) {
      const pY = cardY + 120;
      const pW = cardW - (contentLeft - cardX) - 30;
      ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
      ctx.fillRect(contentLeft, pY, pW, 6);
      ctx.fillStyle = cyan;
      ctx.shadowColor = cyan;
      ctx.shadowBlur = 8;
      ctx.fillRect(contentLeft, pY, pW * progress, 6);
      ctx.shadowBlur = 0;
    }
  }

  // -------------------------------------------------------------
  // 8. APPLE DYNAMIC ISLAND (Smooth, pill-shaped)
  // -------------------------------------------------------------
  function renderAppleDynamicIsland() {
    const isExpanded = true;
    const barW = isExpanded ? 400 : 160;
    const barH = isExpanded ? 160 : 40;
    const barX = -barW / 2;
    const barY = -barH / 2;

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 40);
    ctx.fill();

    if (showCover) {
      const coverSize = 60;
      const cx = barX + 20;
      const cy = barY + 20;
      ctx.beginPath();
      ctx.roundRect(cx, cy, coverSize, coverSize, 12);
      ctx.clip();
      if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
        ctx.drawImage(coverImage, cx, cy, coverSize, coverSize);
      } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(cx, cy, coverSize, coverSize);
      }
      ctx.restore();
      ctx.save();
      ctx.translate(posX, posY);
      ctx.scale(scale, scale);
    }

    const contentLeft = showCover ? barX + 95 : barX + 30;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(displayTitle, contentLeft, barY + 40);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '15px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(displayArtist, contentLeft, barY + 65);

    if (showWaveform) {
      const waveX = barX + barW - 50;
      const waveY = barY + 50;
      ctx.fillStyle = '#10b981'; // iOS green
      for (let i = 0; i < 4; i++) {
        const val = dataArray ? (dataArray[i * 6] || 0) : 0;
        const h = isPlaying ? 4 + (val / 255) * 16 : 4;
        ctx.beginPath();
        ctx.roundRect(waveX + i*6, waveY - h/2, 4, h, 2);
        ctx.fill();
      }
    }

    if (showProgress) {
      const pY = barY + 110;
      const pW = barW - 40;
      ctx.fillStyle = '#333333';
      ctx.beginPath(); ctx.roundRect(barX + 20, pY, pW, 8, 4); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.roundRect(barX + 20, pY, pW * progress, 8, 4); ctx.fill();
    }

    if (showTimer) {
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px monospace';
      ctx.fillText(timeStr, barX + 20, barY + 135);
      ctx.textAlign = 'right';
      ctx.fillText('-' + formatTime(duration - currentTime), barX + barW - 20, barY + 135);
      ctx.textAlign = 'left';
    }
  }

  // -------------------------------------------------------------
  // 9. VINTAGE IPOD (Classic UI)
  // -------------------------------------------------------------
  function renderVintageIpod() {
    const cardW = 320;
    const cardH = 220;
    const cardX = -cardW / 2;
    const cardY = -cardH / 2;

    // iPod Screen Bezel
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 10);
    ctx.fill();
    
    // Screen bg
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.fillRect(cardX + 10, cardY + 10, cardW - 20, cardH - 20);

    // Header bar
    const topBarH = 25;
    const topGrad = ctx.createLinearGradient(0, cardY+10, 0, cardY+10+topBarH);
    topGrad.addColorStop(0, '#f8fafc');
    topGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = topGrad;
    ctx.fillRect(cardX + 10, cardY + 10, cardW - 20, topBarH);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Now Playing', 0, cardY + 27);
    ctx.textAlign = 'left';

    // Battery / Play icon in header
    if (isPlaying) {
      ctx.beginPath();
      ctx.moveTo(cardX + 20, cardY + 17);
      ctx.lineTo(cardX + 28, cardY + 22);
      ctx.lineTo(cardX + 20, cardY + 27);
      ctx.fill();
    }

    // Cover
    if (showCover) {
      const coverSize = 90;
      const cx = cardX + 20;
      const cy = cardY + 45;
      if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
        ctx.drawImage(coverImage, cx, cy, coverSize, coverSize);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx, cy, coverSize, coverSize);
      }
      
      // Reflection
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + coverSize, cy);
      ctx.lineTo(cx, cy + coverSize);
      ctx.fill();
    }

    const contentLeft = showCover ? cardX + 125 : cardX + 25;
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(displayTitle, contentLeft, cardY + 65);
    ctx.font = '14px sans-serif';
    ctx.fillText(displayArtist, contentLeft, cardY + 90);
    ctx.fillStyle = '#64748b';
    ctx.fillText('1 of 1', contentLeft, cardY + 115);

    if (showWaveform) {
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 15; i++) {
        const val = dataArray ? (dataArray[i * 4] || 0) : 0;
        const h = isPlaying ? 2 + (val / 255) * 20 : 2;
        ctx.fillRect(contentLeft + i*4, cardY + 140 - h, 3, h);
      }
    }

    if (showProgress) {
      const pY = cardY + 160;
      const pW = cardW - 40;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cardX + 20, pY, pW, 12);
      ctx.fillStyle = '#3b82f6'; // classic blue
      ctx.fillRect(cardX + 20, pY, pW * progress, 12);
    }

    if (showTimer) {
      ctx.fillStyle = '#000';
      ctx.font = '11px sans-serif';
      ctx.fillText(timeStr, cardX + 20, cardY + 185);
      ctx.textAlign = 'right';
      ctx.fillText('-' + formatTime(duration - currentTime), cardX + cardW - 20, cardY + 185);
      ctx.textAlign = 'left';
    }
  }

  // -------------------------------------------------------------
  // 10. GLOW CD CASE (Transparent plastic & Holographic)
  // -------------------------------------------------------------
  function renderGlowCdCase() {
    const caseW = 280;
    const caseH = 260;
    const caseX = -caseW / 2;
    const caseY = -caseH / 2;

    // CD sticking out of the top right
    const cdX = caseX + caseW - 40;
    const cdY = caseY + 60;
    const cdR = 100;

    ctx.save();
    ctx.translate(cdX, cdY);
    if (isPlaying) ctx.rotate(currentTime * 3);
    
    // CD Base
    const cdGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, cdR);
    cdGrad.addColorStop(0, '#e2e8f0');
    cdGrad.addColorStop(0.3, '#f1f5f9');
    cdGrad.addColorStop(0.8, '#cbd5e1');
    cdGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = cdGrad;
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, cdR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // CD Holographic reflections
    const holo = ctx.createConicGradient(0, 0, 0);
    holo.addColorStop(0, 'rgba(255,0,0,0.1)');
    holo.addColorStop(0.2, 'rgba(0,255,0,0.1)');
    holo.addColorStop(0.4, 'rgba(0,0,255,0.1)');
    holo.addColorStop(0.6, 'rgba(255,0,255,0.1)');
    holo.addColorStop(0.8, 'rgba(0,255,255,0.1)');
    holo.addColorStop(1, 'rgba(255,0,0,0.1)');
    ctx.fillStyle = holo;
    ctx.beginPath();
    ctx.arc(0, 0, cdR, 0, Math.PI * 2);
    ctx.fill();

    // Center hole
    ctx.fillStyle = '#000'; // Assuming dark background
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    
    ctx.restore();

    // The Plastic Case
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.roundRect(caseX, caseY, caseW, caseH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hinge left
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(caseX, caseY + 20, 20, caseH - 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(caseX, caseY + 20, 20, caseH - 40);

    if (showCover) {
      const coverSize = caseW - 40;
      const cx = caseX + 30;
      const cy = caseY + 10;
      if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
        ctx.drawImage(coverImage, cx, cy, coverSize, coverSize);
      } else {
        ctx.fillStyle = 'rgba(255, 100, 200, 0.5)';
        ctx.fillRect(cx, cy, coverSize, coverSize);
      }
    }

    // Info overlay box
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(caseX + 30, caseY + caseH - 70, caseW - 40, 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(displayTitle, caseX + 40, caseY + caseH - 45);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(displayArtist, caseX + 40, caseY + caseH - 25);

    if (showWaveform) {
      ctx.fillStyle = '#cbd5e1';
      for (let i = 0; i < 10; i++) {
        const val = dataArray ? (dataArray[i * 4] || 0) : 0;
        const h = isPlaying ? 2 + (val / 255) * 20 : 2;
        ctx.fillRect(caseX + caseW - 60 + i*5, caseY + caseH - 25 - h, 3, h);
      }
    }
  }

  // Helper Vector Glyphs
  function drawIconPrev(cx: number, cy: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.fillRect(cx - size / 2, cy - size / 2, 2.5, size);
    ctx.beginPath();
    ctx.moveTo(cx + size / 2, cy - size / 2);
    ctx.lineTo(cx - size / 2 + 3, cy);
    ctx.lineTo(cx + size / 2, cy + size / 2);
    ctx.closePath();
    ctx.fill();
  }

  function drawIconNext(cx: number, cy: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.fillRect(cx + size / 2 - 2.5, cy - size / 2, 2.5, size);
    ctx.beginPath();
    ctx.moveTo(cx - size / 2, cy - size / 2);
    ctx.lineTo(cx + size / 2 - 3, cy);
    ctx.lineTo(cx - size / 2, cy + size / 2);
    ctx.closePath();
    ctx.fill();
  }

  function drawIconShuffle(cx: number, cy: number, size: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - size / 2, cy + size / 3);
    ctx.lineTo(cx + size / 2, cy - size / 3);
    ctx.moveTo(cx - size / 2, cy - size / 3);
    ctx.lineTo(cx + size / 2, cy + size / 3);
    ctx.stroke();
  }

  function drawIconRepeat(cx: number, cy: number, size: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 - 2, 0.4, Math.PI * 1.8);
    ctx.stroke();
  }
}
