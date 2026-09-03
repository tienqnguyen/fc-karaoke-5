
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { 
  LrcLine, 
  ParticleType, 
  WaveformStyle, 
  AnimationType, 
  BgAnimationType, 
  CustomTextLine, 
  MusicPlayerStyle, 
  MusicPlayerTheme, 
  PostProcessingVfx,
  TimelineSegment,
  SmartIntroCard,
  SmartOutroCard,
  SceneTransitionType,
  BeatZoomMode,
  BeatZoomTarget,
  TextTransformType
} from '../types';
import { renderVisualizerEngine } from '../utils/visualizerEngines';
import { renderOnVideoMusicPlayer } from '../utils/musicPlayerRenderer';
import { renderSmartIntroCard, renderSmartOutroCard } from '../utils/introOutroRenderer';
import { applyPostProcessingVfx } from '../utils/vfxPostProcessing';
import { lazyLoadGoogleFont } from '../utils/fontLoader';

interface VideoPreviewProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  backgroundImageUrl: string | null;
  backgroundType: 'image' | 'video';
  isExporting?: boolean;
  exportEngine?: "webcodecs" | "realtime";
  isPlaying?: boolean;
  lrcLines: LrcLine[];
  showLyrics: boolean;
  currentTime: number;
  duration?: number;
  fontSize: number;
  overlayOpacity: number;
  fontFamily: string;
  textColor: string;
  lyricIsBold?: boolean;
  lyricIsItalic?: boolean;
  lyricIsUnderline?: boolean;
  outlineColor: string;
  outlineWidth: number;
  enableHighlight: boolean;
  karaokeHighlightColor: string;
  textShadowColor: string;
  textShadowBlur: number;
  lyricPosition: number;
  lyricX: number;
  lyricAnimation: AnimationType;
  letterSpacing?: number;
  textTransform?: TextTransformType;
  enableLyricBeatPulse?: boolean;
  lyricBeatIntensity?: number;
  lyricLineSpacing?: number;
  inactiveLinesOpacity?: number;
  inactiveLinesBlur?: number;
  enableLyricBox?: boolean;
  lyricBoxColor?: string;
  animationSpeed: number;
  lyricLinesCount: number;
  bgAnimationType: BgAnimationType;
  bgAnimationSpeed: number;
  enablePan: boolean;
  particleEffect: ParticleType;
  postProcessingVfx?: PostProcessingVfx;
  vfxIntensity?: number;
  showLogo?: boolean;
  logoUrl: string | null;
  logoOpacity: number;
  logoSize: number;
  logoX: number;
  logoY: number;
  showWaveform: boolean;
  waveformStyle: WaveformStyle;
  waveformColor: string;
  waveformOpacity: number;
  waveformSize: number;
  waveformPosition: number;
  waveformX: number;
  waveformWidth: number;
  visualizerScale?: number;
  customVisualizerJs?: string;
  customTexts: CustomTextLine[];
  // On-Video Music Player HUD
  showMusicPlayer?: boolean;
  musicPlayerStyle?: MusicPlayerStyle;
  musicPlayerTitle?: string;
  musicPlayerArtist?: string;
  musicPlayerX?: number;
  musicPlayerY?: number;
  musicPlayerScale?: number;
  musicPlayerOpacity?: number;
  musicPlayerTheme?: MusicPlayerTheme;
  showPlayerButtons?: boolean;
  showPlayerTimer?: boolean;
  showPlayerProgress?: boolean;
  showPlayerCover?: boolean;
  showPlayerWaveform?: boolean;
  enableBeatZoom: boolean;
  beatZoomMode?: BeatZoomMode;
  beatZoomTarget?: BeatZoomTarget;
  beatZoomSpring?: number;
  enableBeatFlash?: boolean;
  enableBeatShake?: boolean;
  zoomMin: number;
  zoomMax: number;
  sensitivity: number;
  smoothness: number;
  exportRatio: '9:16' | '16:9' | '1:1';
  exportFps?: number;
  leadMs?: number;
  lyricLeadTime?: number; // in seconds
  enableTrim?: boolean;
  trimStart?: number;
  trimEnd?: number;
  enableFadeIn?: boolean;
  fadeInDuration?: number;
  enableFadeOut?: boolean;
  fadeOutDuration?: number;
  // Section 3: Timeline & Multi-Track Editor
  timelineSegments?: TimelineSegment[];
  smartIntroCard?: SmartIntroCard;
  smartOutroCard?: SmartOutroCard;
  enableCanvasInteractiveMode?: boolean;
  onUpdateCanvasElement?: (updates: any) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
}

// Global Image Cache to ensure instantaneous wallpaper switches without black flicker
const globalImageCache = new Map<string, HTMLImageElement>();

export function preloadImage(url: string): Promise<HTMLImageElement> {
  if (!url) return Promise.reject(new Error("Empty URL"));
  if (globalImageCache.has(url)) {
    const cached = globalImageCache.get(url)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
    globalImageCache.delete(url);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    let isSettled = false;
    
    if (url.startsWith('http') && !url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        globalImageCache.set(url, img);
        resolve(img);
      }
    };

    img.onerror = () => {
      // Retry without CORS in case server does not support crossOrigin or has header mismatch
      if (!isSettled) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          if (!isSettled) {
            isSettled = true;
            globalImageCache.set(url, fallbackImg);
            resolve(fallbackImg);
          }
        };
        fallbackImg.onerror = (err) => {
          if (!isSettled) {
            isSettled = true;
            reject(err);
          }
        };
        fallbackImg.src = url;
      }
    };

    img.src = url;
  });
}

const VideoPreview = forwardRef<HTMLCanvasElement, VideoPreviewProps>(({ 
  audioRef, 
  backgroundImageUrl, 
  backgroundType,
  isPlaying = false,
  exportEngine,
  isExporting,
  lrcLines, 
  showLyrics,
  currentTime,
  fontSize,
  overlayOpacity,
  fontFamily,
  textColor,
  lyricIsBold,
  lyricIsItalic,
  lyricIsUnderline,
  outlineColor,
  outlineWidth,
  enableHighlight,
  karaokeHighlightColor,
  textShadowColor,
  textShadowBlur,
  lyricPosition,
  lyricX,
  lyricAnimation,
  letterSpacing = 0,
  textTransform = "none" as TextTransformType,
  enableLyricBeatPulse = false,
  lyricBeatIntensity = 1.0,
  lyricLineSpacing = 1.8,
  inactiveLinesOpacity = 0.4,
  inactiveLinesBlur = 0,
  enableLyricBox = false,
  lyricBoxColor = "rgba(0, 0, 0, 0.55)",
  animationSpeed,
  lyricLinesCount,
  bgAnimationType,
  bgAnimationSpeed,
  enablePan,
  particleEffect,
  showLogo = true,
  logoUrl,
  logoOpacity,
  logoSize,
  logoX,
  logoY,
  showWaveform,
  waveformStyle,
  waveformColor,
  waveformOpacity,
  waveformSize,
  waveformPosition,
  waveformX,
  waveformWidth,

  visualizerScale = 1.0,
  customVisualizerJs,
  customTexts,
  // On-Video Music Player HUD
  showMusicPlayer = false,
  musicPlayerStyle = 'modern_glass' as MusicPlayerStyle,
  musicPlayerTitle = 'Lofi Chill Beats',
  musicPlayerArtist = 'Lofi Vibes Studio',
  musicPlayerX = 50,
  musicPlayerY = 82,
  musicPlayerScale = 1.0,
  musicPlayerOpacity = 1.0,
  musicPlayerTheme = 'dark_glass' as MusicPlayerTheme,
  showPlayerButtons = true,
  showPlayerTimer = true,
  showPlayerProgress = true,
  showPlayerCover = true,
  showPlayerWaveform = true,
  duration = 0,
  enableBeatZoom,
  beatZoomMode = 'sub_bass_pulse' as BeatZoomMode,
  beatZoomTarget = 'bg_only' as BeatZoomTarget,
  beatZoomSpring = 0.65,
  enableBeatFlash = true,
  enableBeatShake = false,
  zoomMin,
  zoomMax,
  sensitivity,
  smoothness,
  exportRatio,
  exportFps = 30,
  leadMs,
  lyricLeadTime = 0,
  enableTrim = false,
  trimStart = 0,
  trimEnd = 0,
  enableFadeIn = false,
  fadeInDuration = 1.5,
  enableFadeOut = false,
  fadeOutDuration = 1.5,
  postProcessingVfx = 'none' as PostProcessingVfx,
  vfxIntensity = 0.2,
  timelineSegments = [],
  smartIntroCard,
  smartOutroCard,
  enableCanvasInteractiveMode = false,
  onUpdateCanvasElement
}, ref) => {
  const propsRef = useRef({
    audioRef, 
    backgroundImageUrl, 
    backgroundType,
    isPlaying, exportEngine, isExporting,
    lrcLines, 
    showLyrics,
    currentTime,
    fontSize,
    overlayOpacity,
    fontFamily,
    textColor,
    lyricIsBold,
    lyricIsItalic,
    lyricIsUnderline,
    outlineColor,
    outlineWidth,
    enableHighlight,
    karaokeHighlightColor,
    textShadowColor,
    textShadowBlur,
    lyricPosition,
    lyricX,
    lyricAnimation,
    letterSpacing,
    textTransform,
    enableLyricBeatPulse,
    lyricBeatIntensity,
    lyricLineSpacing,
    inactiveLinesOpacity,
    inactiveLinesBlur,
    enableLyricBox,
    lyricBoxColor,
    animationSpeed,
    lyricLinesCount,
    bgAnimationType,
    bgAnimationSpeed,
    enablePan,
    particleEffect,
    postProcessingVfx,
    vfxIntensity,
    showLogo,
    logoUrl,
    logoOpacity,
    logoSize,
    logoX,
    logoY,
    showWaveform,
    waveformStyle,
    waveformColor,
    waveformOpacity,
    waveformSize,
    waveformPosition,
    waveformX,
    waveformWidth,
          visualizerScale,
    customVisualizerJs,
    customTexts,
    showMusicPlayer,
    musicPlayerStyle,
    musicPlayerTitle,
    musicPlayerArtist,
    musicPlayerX,
    musicPlayerY,
    musicPlayerScale,
    musicPlayerOpacity,
    musicPlayerTheme,
    showPlayerButtons,
    showPlayerTimer,
    showPlayerProgress,
    showPlayerCover,
    showPlayerWaveform,
    duration,
    enableBeatZoom,
    beatZoomMode,
    beatZoomTarget,
    beatZoomSpring,
    enableBeatFlash,
    enableBeatShake,
    zoomMin,
    zoomMax,
    sensitivity,
    smoothness,
    exportRatio, exportFps,
    leadMs,
    lyricLeadTime,
    enableTrim,
    trimStart,
    trimEnd,
    enableFadeIn,
    fadeInDuration,
    enableFadeOut,
    fadeOutDuration,
    timelineSegments,
    smartIntroCard,
    smartOutroCard,
    enableCanvasInteractiveMode,
    onUpdateCanvasElement
  });
  propsRef.current = {
    audioRef, 
    backgroundImageUrl, 
    backgroundType,
    isPlaying, exportEngine, isExporting,
    lrcLines, 
    showLyrics,
    currentTime,
    fontSize,
    overlayOpacity,
    fontFamily,
    textColor,
    lyricIsBold,
    lyricIsItalic,
    lyricIsUnderline,
    outlineColor,
    outlineWidth,
    enableHighlight,
    karaokeHighlightColor,
    textShadowColor,
    textShadowBlur,
    lyricPosition,
    lyricX,
    lyricAnimation,
    letterSpacing,
    textTransform,
    enableLyricBeatPulse,
    lyricBeatIntensity,
    lyricLineSpacing,
    inactiveLinesOpacity,
    inactiveLinesBlur,
    enableLyricBox,
    lyricBoxColor,
    animationSpeed,
    lyricLinesCount,
    bgAnimationType,
    bgAnimationSpeed,
    enablePan,
    particleEffect,
    postProcessingVfx,
    vfxIntensity,
    showLogo,
    logoUrl,
    logoOpacity,
    logoSize,
    logoX,
    logoY,
    showWaveform,
    waveformStyle,
    waveformColor,
    waveformOpacity,
    waveformSize,
    waveformPosition,
    waveformX,
    waveformWidth,
          visualizerScale,
    customVisualizerJs,
    customTexts,
    showMusicPlayer,
    musicPlayerStyle,
    musicPlayerTitle,
    musicPlayerArtist,
    musicPlayerX,
    musicPlayerY,
    musicPlayerScale,
    musicPlayerOpacity,
    musicPlayerTheme,
    showPlayerButtons,
    showPlayerTimer,
    showPlayerProgress,
    showPlayerCover,
    showPlayerWaveform,
    duration,
    enableBeatZoom,
    beatZoomMode,
    beatZoomTarget,
    beatZoomSpring,
    enableBeatFlash,
    enableBeatShake,
    zoomMin,
    zoomMax,
    sensitivity,
    smoothness,
    exportRatio, exportFps,
    leadMs,
    lyricLeadTime,
    enableTrim,
    trimStart,
    trimEnd,
    enableFadeIn,
    fadeInDuration,
    enableFadeOut,
    fadeOutDuration,
    timelineSegments,
    smartIntroCard,
    smartOutroCard,
    enableCanvasInteractiveMode,
    onUpdateCanvasElement
  };

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const mediaStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(128));
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const getInitialBgImg = () => {
    if (!backgroundImageUrl) return null;
    if (globalImageCache.has(backgroundImageUrl)) {
      const cached = globalImageCache.get(backgroundImageUrl)!;
      if (cached.complete && cached.naturalWidth > 0) return cached;
    }
    const img = new Image();
    if (backgroundImageUrl.startsWith('http') && !backgroundImageUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (img.naturalWidth > 0) {
        globalImageCache.set(backgroundImageUrl, img);
        bgImgRef.current = img;
      }
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => {
        if (fallback.naturalWidth > 0) {
          globalImageCache.set(backgroundImageUrl, fallback);
          bgImgRef.current = fallback;
        }
      };
      fallback.src = backgroundImageUrl;
    };
    img.src = backgroundImageUrl;
    return img;
  };
  const bgImgRef = useRef<HTMLImageElement | null>(getInitialBgImg());
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const visualizerActiveRef = useRef<boolean>(false);
  const smoothedEnergyRef = useRef<number>(0);
  const smoothedBassRef = useRef<number>(0);
  const smoothedMidRef = useRef<number>(0);
  const smoothedHighRef = useRef<number>(0);
  const rotationAngleRef = useRef<number>(0);
  const waveformParticlesRef = useRef<any[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  
  // SPECTRA Pro Beat Zoom Physics & Transient Detection Refs
  const springPosRef = useRef<number>(0);
  const springVelocityRef = useRef<number>(0);
  const runningBassAvgRef = useRef<number>(0.2);
  const prevBassEnergyRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  const beatImpulseRef = useRef<number>(0);
  const shakeImpulseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const tiltImpulseRef = useRef<number>(0);
  const beatCounterRef = useRef<number>(0);
  
  useImperativeHandle(ref, () => canvasRef.current!);
  
  const baseExportWidth = exportRatio === '16:9' ? 1920 : (exportRatio === '1:1' ? 1080 : 1080);
  const baseExportHeight = exportRatio === '16:9' ? 1080 : (exportRatio === '1:1' ? 1080 : 1920);

  // Scale canvas resolution adaptively to 720p for ultra-smooth 60 FPS preview (saves 55%+ GPU load with zero lag)
  const TIKTOK_WIDTH = !isFullscreen
    ? (exportRatio === '16:9' ? 1280 : (exportRatio === '1:1' ? 720 : 720))
    : baseExportWidth;
  const TIKTOK_HEIGHT = !isFullscreen
    ? (exportRatio === '16:9' ? 720 : (exportRatio === '1:1' ? 720 : 1280))
    : baseExportHeight;

  useEffect(() => {
    if (backgroundType === 'video') {
      bgImgRef.current = null;
      if (bgVideoRef.current) {
        bgVideoRef.current.pause();
        bgVideoRef.current.src = "";
        bgVideoRef.current = null;
      }

      if (backgroundImageUrl) {
        const video = document.createElement('video');
        if (backgroundImageUrl.startsWith('http') && !backgroundImageUrl.startsWith('blob:')) {
          video.crossOrigin = "anonymous";
        }
        video.src = backgroundImageUrl;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play().catch(e => console.warn("Video auto-play failed:", e));
        bgVideoRef.current = video;
      }
      return;
    }

    // Background type is 'image'
    if (bgVideoRef.current) {
      bgVideoRef.current.pause();
      bgVideoRef.current.src = "";
      bgVideoRef.current = null;
    }

    if (!backgroundImageUrl) {
      bgImgRef.current = null;
      return;
    }

    // Check if image is already cached and loaded
    if (globalImageCache.has(backgroundImageUrl)) {
      const cached = globalImageCache.get(backgroundImageUrl)!;
      if (cached.complete && cached.naturalWidth > 0) {
        bgImgRef.current = cached;
        return;
      }
    }

    // Load asynchronously without wiping previous image to prevent black flash
    let isCurrent = true;
    preloadImage(backgroundImageUrl)
      .then((loadedImg) => {
        if (isCurrent) {
          bgImgRef.current = loadedImg;
        }
      })
      .catch((err) => {
        console.warn("Background image failed to load:", backgroundImageUrl, err);
      });

    return () => {
      isCurrent = false;
    };
  }, [backgroundImageUrl, backgroundType]);

  useEffect(() => {
    if (logoUrl) {
      if (globalImageCache.has(logoUrl)) {
        const cached = globalImageCache.get(logoUrl)!;
        if (cached.complete && cached.naturalWidth > 0) {
          logoImgRef.current = cached;
          return;
        }
      }
      const img = new Image();
      if (logoUrl.startsWith('http') && !logoUrl.startsWith('blob:')) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        if (img.naturalWidth > 0) {
          globalImageCache.set(logoUrl, img);
          logoImgRef.current = img;
        }
      };
      img.onerror = () => {
        const fallback = new Image();
        fallback.onload = () => {
          if (fallback.naturalWidth > 0) {
            globalImageCache.set(logoUrl, fallback);
            logoImgRef.current = fallback;
          }
        };
        fallback.src = logoUrl;
      };
      img.src = logoUrl;
      if (img.complete && img.naturalWidth > 0) {
        globalImageCache.set(logoUrl, img);
        logoImgRef.current = img;
      }
    } else {
      logoImgRef.current = null;
    }
  }, [logoUrl]);

  // On-demand lazy load fonts used by lyrics and custom texts
  useEffect(() => {
    if (fontFamily) {
      lazyLoadGoogleFont(fontFamily);
    }
    customTexts?.forEach(t => {
      if (t.visible && t.fontFamily) {
        lazyLoadGoogleFont(t.fontFamily);
      }
    });
  }, [fontFamily, customTexts]);

  useEffect(() => {
    const particles: Particle[] = [];
    const count = (particleEffect === 'bokeh' || particleEffect === 'fireflies') ? 40 : 
                  (particleEffect === 'ambient_dust' || particleEffect === 'ambient_sparks') ? 120 : 
                  (particleEffect === 'glitter') ? 70 :
                  (particleEffect === 'petals') ? 35 :
                  (particleEffect === 'aurora' || particleEffect === 'light_leaks') ? 8 :
                  (particleEffect === 'laser' || particleEffect === 'cinematic_flare') ? 15 :
                  (particleEffect === 'digital_matrix') ? 80 :
                  (particleEffect === 'rising_bubbles') ? 60 : 100;
    for (let i = 0; i < count; i++) {
      const isSpark = particleEffect === 'ambient_sparks';
      const isDust = particleEffect === 'ambient_dust';
      const isBubble = particleEffect === 'rising_bubbles';
      const isPetal = particleEffect === 'petals';
      const isGlitter = particleEffect === 'glitter';
      
      const alpha = isSpark ? (Math.random() * 0.22 + 0.08) : (Math.random() * 0.4 + 0.1);
      let pSize = Math.random() * 3 + 1;
      if (particleEffect === 'bokeh') pSize = Math.random() * 80 + 30;
      else if (particleEffect === 'fireflies') pSize = Math.random() * 5 + 2;
      else if (particleEffect === 'glitter') pSize = Math.random() * 5 + 3;
      else if (particleEffect === 'petals') pSize = Math.random() * 8 + 7;
      else if (particleEffect === 'aurora' || particleEffect === 'light_leaks') pSize = Math.random() * 250 + 150;
      else if (particleEffect === 'laser' || particleEffect === 'cinematic_flare') pSize = Math.random() * 200 + 100;
      else if (isDust) pSize = Math.random() * 3 + 1;
      else if (isSpark) pSize = Math.random() * 1.5 + 0.5;
      else if (isBubble) pSize = Math.random() * 8 + 3;

      particles.push({
        x: Math.random() * TIKTOK_WIDTH,
        y: Math.random() * TIKTOK_HEIGHT,
        vx: (Math.random() - 0.5) * (isSpark ? 1.5 : isDust ? 0.8 : isBubble ? 0.5 : isPetal ? 1.2 : 1.5),
        vy: (Math.random() - 0.5) * (isSpark ? 1.5 : isDust ? 0.8 : isBubble ? 0 : 1.5) + (particleEffect === 'rain' ? 10 : isSpark ? -1.8 : isDust ? -0.5 : isBubble ? -1.5 : isPetal ? 1.5 : isGlitter ? 1 : 0),
        size: pSize,
        alpha: alpha,
        baseAlpha: alpha
      });
    }
    particlesRef.current = particles;
  }, [particleEffect, exportRatio]);

  // Handle visualizer source setup
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!audioCtxRef.current) {
          const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
          audioCtxRef.current = new AudioCtx();
          analyserRef.current = audioCtxRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
        
        const audioEl = audioRef.current;
        // The audioEl changes when the key changes. We need to check if we are already connected to THIS specific element.
        if (audioEl && audioEl.src && !audioEl.src.endsWith('undefined') && audioEl.src !== "") {
          if (!sourceNodeRef.current || sourceNodeRef.current.mediaElement !== audioEl) {
              console.log("Connecting visualizer to new audio element instance");
              try {
                  if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
                  if (analyserRef.current) analyserRef.current.disconnect();
                  if (delayNodeRef.current) delayNodeRef.current.disconnect();
                  
                  sourceNodeRef.current = audioCtxRef.current!.createMediaElementSource(audioEl);
                  delayNodeRef.current = audioCtxRef.current!.createDelay(2.0);
                  
                  sourceNodeRef.current.connect(analyserRef.current!);
                  sourceNodeRef.current.connect(delayNodeRef.current);
                  delayNodeRef.current.connect(audioCtxRef.current!.destination);
                  
                  if (!mediaStreamDestRef.current) {
                    mediaStreamDestRef.current = audioCtxRef.current!.createMediaStreamDestination();
                  }
                  delayNodeRef.current.connect(mediaStreamDestRef.current);
                  (window as any).__karaokeAudioStream = mediaStreamDestRef.current.stream;
                  (window as any).__audioCtx = audioCtxRef.current;
                  
                  visualizerActiveRef.current = true;
              } catch (e) {
                  console.debug("Visualizer setup failed (CORS?):", e);
                  visualizerActiveRef.current = false;
              }
          }
        }
        
        if (delayNodeRef.current) {
          delayNodeRef.current.delayTime.value = leadMs / 1000.0;
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
      } catch (err) {
        console.warn("Failed to initialize AudioContext visualizer:", err);
        visualizerActiveRef.current = false;
      }
    };

    // Use interaction or readyState to trigger init
    window.addEventListener('mousedown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    
    // Always check on prop change
    initAudio();
    
    return () => {
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, [audioRef.current]);

  useEffect(() => {
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = leadMs / 1000.0;
    }
  }, [leadMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabHidden = false;

    // Cache gradient patterns to avoid GC pressure
    let cachedBgGrad: CanvasGradient | null = null;
    let cachedSpotGrad: CanvasGradient | null = null;
    let cachedGradW = 0;
    let cachedGradH = 0;

    const onVisibilityChange = () => {
      isTabHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const renderFrame = (exactTime?: number, exactFreqData?: Uint8Array) => {
      const isCustomRender = typeof exactTime === 'number';
      const {
        audioRef, 
        backgroundImageUrl, 
        backgroundType,
        isPlaying, exportEngine, isExporting,
        lrcLines, 
        showLyrics,
        currentTime,
        fontSize,
        overlayOpacity,
        fontFamily,
        textColor,
        lyricIsBold,
        lyricIsItalic,
        lyricIsUnderline,
        outlineColor,
        outlineWidth,
        enableHighlight,
        karaokeHighlightColor,
        textShadowColor,
        textShadowBlur,
        lyricPosition,
        lyricX,
        lyricAnimation,
        letterSpacing,
        textTransform,
        enableLyricBeatPulse,
        lyricBeatIntensity,
        lyricLineSpacing,
        inactiveLinesOpacity,
        inactiveLinesBlur,
        enableLyricBox,
        lyricBoxColor,
        animationSpeed,
        lyricLinesCount,
        bgAnimationType,
        bgAnimationSpeed,
        enablePan,
        particleEffect,
        showLogo,
        logoUrl,
        logoOpacity,
        logoSize,
        logoX,
        logoY,
        showWaveform,
        waveformStyle,
        waveformColor,
        waveformOpacity,
        waveformSize,
        waveformPosition,
        waveformX,
        waveformWidth,
          visualizerScale,
        customVisualizerJs,
        customTexts,
        showMusicPlayer,
        musicPlayerStyle,
        musicPlayerTitle,
        musicPlayerArtist,
        musicPlayerX,
        musicPlayerY,
        musicPlayerScale,
        musicPlayerOpacity,
        musicPlayerTheme,
        showPlayerButtons,
        showPlayerTimer,
        showPlayerProgress,
        showPlayerCover,
        showPlayerWaveform,
        duration,
        enableBeatZoom,
        beatZoomMode = 'sub_bass_pulse',
        beatZoomTarget = 'bg_only',
        beatZoomSpring = 0.65,
        enableBeatFlash = true,
        enableBeatShake = false,
        zoomMin,
        zoomMax,
        sensitivity,
        smoothness,
        exportRatio,
        exportFps,
        leadMs,
        lyricLeadTime,
        enableTrim,
        trimStart,
        trimEnd,
        enableFadeIn,
        fadeInDuration,
        enableFadeOut,
        fadeOutDuration,
        postProcessingVfx,
        vfxIntensity,
        timelineSegments,
        smartIntroCard,
        smartOutroCard
      } = propsRef.current;

      const audioEl = audioRef.current;
      const isAudioActuallyPlaying = Boolean(
        audioEl && !audioEl.paused && !audioEl.ended && audioEl.readyState >= 2
      );
      const activePlaying = isCustomRender || isPlaying || isAudioActuallyPlaying;
      const activeCurrentTime = isCustomRender ? exactTime : (isAudioActuallyPlaying ? audioEl!.currentTime : currentTime);
      
      const globalTimeMs = isCustomRender ? (exactTime * 1000) : Date.now();

      try {
        const now = isCustomRender ? (exactTime * 1000) : performance.now();
        let dtMs = now - lastTimeRef.current;
        if (isCustomRender) {
          dtMs = 1000 / (propsRef.current.exportFps || 60);
        }
        lastTimeRef.current = now;
        dtMs = Math.max(1, Math.min(dtMs, 250));
        
        const dt = dtMs / 16.67;

        let targetEnergy = 0;
        let hasFrequencyData = false;
        let bassSum = 0;
        let midSum = 0;
        let highSum = 0;
        let bufferLength = 128;

        if ((exactFreqData && exactFreqData.length > 0) || (visualizerActiveRef.current && analyserRef.current && dataArrayRef.current && activePlaying)) {
          if (exactFreqData && exactFreqData.length > 0) {
            dataArrayRef.current.set(exactFreqData);
            hasFrequencyData = true;
            bufferLength = dataArrayRef.current.length;
          } else {
            analyserRef.current!.getByteFrequencyData(dataArrayRef.current);
            hasFrequencyData = true;
            bufferLength = analyserRef.current!.frequencyBinCount;
          }
          const bassCutoff = Math.floor(bufferLength * 0.15);
        const midCutoff = Math.floor(bufferLength * 0.65);
        
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArrayRef.current[i];
          if (i < bassCutoff) {
            bassSum += val;
          } else if (i < midCutoff) {
            midSum += val;
          } else {
            highSum += val;
          }
        }
        
        // Isolate kick & sub-bass bins
        let subBassVal = 0;
        let punchVal = 0;
        const subBins = Math.min(3, bufferLength);
        const punchBins = Math.min(8, bufferLength);
        for (let i = 0; i < subBins; i++) {
          if (dataArrayRef.current[i] > subBassVal) subBassVal = dataArrayRef.current[i];
        }
        for (let i = subBins; i < punchBins; i++) {
          if (dataArrayRef.current[i] > punchVal) punchVal = dataArrayRef.current[i];
        }

        const normSub = subBassVal / 255;
        const normPunch = punchVal / 255;
        const weightedBass = (normSub * 0.65 + normPunch * 0.35) * sensitivity;

        // SPECTRA Transient Flux & Dynamic Onset Detection
        const flux = Math.max(0, weightedBass - prevBassEnergyRef.current);
        prevBassEnergyRef.current = weightedBass;
        
        runningBassAvgRef.current = runningBassAvgRef.current * 0.94 + weightedBass * 0.06;
        
        const effectiveSens = Math.max(0.2, sensitivity);
        // Lowered threshold and flux requirements to make it much easier to detect kicks
        const threshold = Math.max(0.06 / effectiveSens, runningBassAvgRef.current * (1.05 / Math.min(1.4, effectiveSens)));
        const isKickOnset = (weightedBass > threshold) &&
                            (flux > 0.02 / Math.min(1.4, effectiveSens)) &&
                            (now - lastBeatTimeRef.current > 120);

        if (isKickOnset) {
          lastBeatTimeRef.current = now;
          const kickStrength = Math.min(1.8, Math.max(0.25, (weightedBass - runningBassAvgRef.current * 0.75) * 2.5 * effectiveSens));
          
          if (beatZoomMode === 'sub_bass_pulse') {
            // Smooth swell handled via equilibrium target
          } else if (beatZoomMode === 'inverted_dip') {
            // Suction dip then spring snap
            springVelocityRef.current -= kickStrength * (9.0 + (beatZoomSpring || 0.65) * 8.0);
          } else {
            // spectra_punch, drop_impact, rotational_kick
            // Explosive elastic velocity
            const impulsePower = 15.0 + ((beatZoomSpring || 0.65) * 14.0);
            springVelocityRef.current += kickStrength * impulsePower;
          }

          if (enableBeatFlash) {
            beatImpulseRef.current = Math.min(1.0, beatImpulseRef.current + kickStrength * 0.75);
          }

          if (enableBeatShake || beatZoomMode === 'drop_impact') {
            const shakeMag = (beatZoomMode === 'drop_impact' ? 14 : 7) * kickStrength;
            shakeImpulseRef.current = {
              x: (Math.random() - 0.5) * shakeMag,
              y: (Math.random() - 0.5) * shakeMag
            };
          }

          if (beatZoomMode === 'rotational_kick') {
            const dir = (beatCounterRef.current % 2 === 0 ? 1 : -1);
            beatCounterRef.current++;
            tiltImpulseRef.current = dir * (0.018 + kickStrength * 0.014);
          }
        }

        targetEnergy = Math.pow(Math.max(normSub, normPunch), 1.5) * sensitivity;
      } else {
        // PREVIEW / IDLE MODE: Synthesize smooth dynamic waves and periodic beat kicks (120 BPM)
        hasFrequencyData = true;
        const arr = dataArrayRef.current;
        bufferLength = arr.length;
        const t = now * 0.0025;
        for (let i = 0; i < bufferLength; i++) {
          const norm = i / bufferLength;
          const wave = Math.sin(norm * 8 - t * 2.5) * 0.35 + Math.sin(norm * 14 + t * 4) * 0.25 + 0.38;
          const bassBoost = norm < 0.25 ? (Math.sin(t * 5) * 0.25 + 0.35) : 0;
          arr[i] = Math.max(8, Math.min(255, Math.floor((wave + bassBoost) * 190)));
          if (i < bufferLength * 0.15) bassSum += arr[i];
          else if (i < bufferLength * 0.65) midSum += arr[i];
          else highSum += arr[i];
        }
        targetEnergy = Math.max(0, Math.min(1, (Math.sin(t * 5) * 0.5 + 0.5) * 0.45 * sensitivity));

        // Rhythmic kick trigger in preview mode (every ~500ms)
        const isSimBeat = Math.sin(t * 6.28) > 0.92;
        if (isSimBeat && (now - lastBeatTimeRef.current > 360)) {
          lastBeatTimeRef.current = now;
          const kickStrength = 0.8 * sensitivity;
          if (beatZoomMode === 'inverted_dip') {
            springVelocityRef.current -= kickStrength * 8.0;
          } else {
            springVelocityRef.current += kickStrength * (14.0 + (beatZoomSpring || 0.65) * 10.0);
          }
          if (enableBeatFlash) beatImpulseRef.current = 0.65;
          if (beatZoomMode === 'rotational_kick') {
            const dir = (beatCounterRef.current % 2 === 0 ? 1 : -1);
            beatCounterRef.current++;
            tiltImpulseRef.current = dir * 0.02;
          }
        }
      }

      // Spring physics integration (Damped Harmonic Oscillator)
      const dtSec = Math.min(0.04, Math.max(0.005, dtMs / 1000));
      const springK = 180 + ((beatZoomSpring || 0.65) * 160);
      const dampingC = 14 + (smoothness * 22);

      let targetEq = 0;
      if (beatZoomMode === 'sub_bass_pulse') {
        targetEq = Math.min(1.2, targetEnergy * 1.1);
      } else {
        // Add a gentle baseline swell even for punchy modes so they don't feel dead when kicks are missed
        targetEq = Math.min(0.6, targetEnergy * 0.4);
      }

      const displacement = springPosRef.current - targetEq;
      const springForce = -springK * displacement - dampingC * springVelocityRef.current;
      springVelocityRef.current += springForce * dtSec;
      springPosRef.current += springVelocityRef.current * dtSec;

      // Smooth decay of impulse effects
      beatImpulseRef.current *= Math.pow(0.82, dt);
      shakeImpulseRef.current.x *= Math.pow(0.72, dt);
      shakeImpulseRef.current.y *= Math.pow(0.72, dt);
      tiltImpulseRef.current *= Math.pow(0.85, dt);

      let smoothFactor = Math.pow(smoothness, dt);
      
      // Fast attack, slow decay for waveform visualizers
      if (targetEnergy > smoothedEnergyRef.current) {
         smoothFactor = 0.2;
      }
      
      smoothedEnergyRef.current += (targetEnergy - smoothedEnergyRef.current) * (1 - smoothFactor);
      
      const bassCutoff = Math.floor(bufferLength * 0.15);
      const midCutoff = Math.floor(bufferLength * 0.65);
      const bassVol = bassSum / (bassCutoff || 1) / 255;
      const midVol = midSum / (midCutoff - bassCutoff || 1) / 255;
      const highVol = highSum / (bufferLength - midCutoff || 1) / 255;
      
      smoothedBassRef.current = smoothedBassRef.current * 0.82 + bassVol * 0.18;
      smoothedMidRef.current = smoothedMidRef.current * 0.82 + midVol * 0.18;
      smoothedHighRef.current = smoothedHighRef.current * 0.82 + highVol * 0.18;
      rotationAngleRef.current += 0.0055 + (smoothedBassRef.current * 0.015);

      let beatScale = zoomMin;
      if (enableBeatZoom) {
        if (beatZoomMode === 'inverted_dip') {
          beatScale = zoomMin + (zoomMax - zoomMin) * Math.max(-0.4, springPosRef.current);
        } else if (beatZoomMode === 'sub_bass_pulse') {
          beatScale = zoomMin + (zoomMax - zoomMin) * Math.max(0, Math.min(1.5, springPosRef.current));
        } else {
          // spectra_punch, drop_impact, rotational_kick
          beatScale = zoomMin + (zoomMax - zoomMin) * Math.max(0, springPosRef.current);
        }
      }

      // Dynamic background fallback with ambient concert stage glow (cached gradient)
      if (!cachedBgGrad || cachedGradW !== TIKTOK_WIDTH || cachedGradH !== TIKTOK_HEIGHT) {
        cachedBgGrad = ctx.createLinearGradient(0, 0, 0, TIKTOK_HEIGHT);
        cachedBgGrad.addColorStop(0, '#0f172a');
        cachedBgGrad.addColorStop(0.4, '#1e1b4b');
        cachedBgGrad.addColorStop(1, '#020617');

        cachedSpotGrad = ctx.createRadialGradient(TIKTOK_WIDTH / 2, TIKTOK_HEIGHT * 0.45, 50, TIKTOK_WIDTH / 2, TIKTOK_HEIGHT * 0.45, TIKTOK_WIDTH * 0.7);
        cachedSpotGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        cachedSpotGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.1)');
        cachedSpotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        cachedGradW = TIKTOK_WIDTH;
        cachedGradH = TIKTOK_HEIGHT;
      }
      ctx.fillStyle = cachedBgGrad;
      ctx.fillRect(0, 0, TIKTOK_WIDTH, TIKTOK_HEIGHT);

      if (cachedSpotGrad) {
        ctx.fillStyle = cachedSpotGrad;
        ctx.fillRect(0, 0, TIKTOK_WIDTH, TIKTOK_HEIGHT);
      }

      // 0. TIMELINE MULTI-TRACK SCENE / SEGMENT SELECTION
      let segmentMediaSource: HTMLImageElement | null = null;
      let prevSegmentMediaSource: HTMLImageElement | null = null;
      let currentSegTransition: SceneTransitionType = 'none';
      let segTransitionProgress = 1;

      if (timelineSegments && timelineSegments.length > 0) {
        const segIdx = timelineSegments.findIndex(s => activeCurrentTime >= s.startTime && activeCurrentTime <= s.endTime);
        const activeSeg = segIdx !== -1 ? timelineSegments[segIdx] : timelineSegments[0];

        if (activeSeg && activeSeg.backgroundImageUrl) {
          if (globalImageCache.has(activeSeg.backgroundImageUrl)) {
            const cached = globalImageCache.get(activeSeg.backgroundImageUrl)!;
            if (cached.complete && cached.naturalWidth > 0) segmentMediaSource = cached;
          } else {
            preloadImage(activeSeg.backgroundImageUrl).catch(() => {});
          }
        }

        // Check if currently inside transition window from previous segment
        if (activeSeg && activeSeg.transition && activeSeg.transition !== 'none' && segIdx > 0) {
          const transDur = activeSeg.transitionDuration || 1.0;
          const timeIntoSeg = activeCurrentTime - activeSeg.startTime;
          if (timeIntoSeg >= 0 && timeIntoSeg < transDur) {
            segTransitionProgress = Math.max(0, Math.min(1, timeIntoSeg / transDur));
            currentSegTransition = activeSeg.transition;

            const prevSeg = timelineSegments[segIdx - 1];
            if (prevSeg && prevSeg.backgroundImageUrl && globalImageCache.has(prevSeg.backgroundImageUrl)) {
              const prevCached = globalImageCache.get(prevSeg.backgroundImageUrl)!;
              if (prevCached.complete && prevCached.naturalWidth > 0) prevSegmentMediaSource = prevCached;
            }
          }
        }
      }

      let mediaSource: HTMLImageElement | HTMLVideoElement | null = segmentMediaSource;
      if (!mediaSource) {
        if (bgVideoRef.current && bgVideoRef.current.readyState >= 2) {
          mediaSource = bgVideoRef.current;
        } else if (bgImgRef.current && bgImgRef.current.naturalWidth > 0) {
          mediaSource = bgImgRef.current;
        }
      }

      const drawSingleMedia = (source: HTMLImageElement | HTMLVideoElement, extraScale = 1.0, alpha = 1.0) => {
        const mw = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
        const mh = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
        if (mw <= 0 || mh <= 0) return;

        const aspect = mw / mh;
        const canvasAspect = TIKTOK_WIDTH / TIKTOK_HEIGHT;
        let dW, dH, oX, oY;

        if (aspect > canvasAspect) { dH = TIKTOK_HEIGHT; dW = TIKTOK_HEIGHT * aspect; oX = (TIKTOK_WIDTH - dW) / 2; oY = 0; }
        else { dW = TIKTOK_WIDTH; dH = TIKTOK_WIDTH / aspect; oX = 0; oY = (TIKTOK_HEIGHT - dH) / 2; }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        let animScale = beatScale * extraScale;
        let tiltAngle = 0;
        let shakeX = 0;
        let shakeY = 0;

        if (enableBeatZoom) {
          if (beatZoomMode === 'rotational_kick') {
            tiltAngle += tiltImpulseRef.current;
          }
          if (enableBeatShake || beatZoomMode === 'drop_impact') {
            shakeX = shakeImpulseRef.current.x;
            shakeY = shakeImpulseRef.current.y;
          }
        }
        oX += shakeX;
        oY += shakeY;

        if (bgAnimationType !== 'none') {
          // Tăng buffer lên 30% cho an toàn tuyệt đối với mọi hiệu ứng (không lòi viền)
          animScale *= 1.30;
          
          // Tính thời gian chuẩn (t) - nhân với speed. t = 1.0 sau mỗi giây ở speed 1x.
          const t = globalTimeMs * Math.max(0.01, bgAnimationSpeed) * 0.001;
          
          if (bgAnimationType === 'zoom') {
            animScale *= 1.05 + (Math.sin(t * 0.5) * 0.05);
          } else if (bgAnimationType === 'pan') {
            oX += Math.cos(t * 0.6) * (TIKTOK_WIDTH * 0.1);
            oY += Math.sin(t * 0.4) * (TIKTOK_HEIGHT * 0.1);
          } else if (bgAnimationType === '3d_parallax_tilt') {
            tiltAngle = Math.sin(t * 0.8) * 0.04 * (1 + smoothedBassRef.current * 0.8);
            animScale *= 1.05 + Math.sin(t * 1.2) * 0.04 + smoothedBassRef.current * 0.06;
            oX += Math.sin(t * 1.0) * (TIKTOK_WIDTH * 0.08) * (1 + smoothedBassRef.current * 0.5);
            oY += Math.cos(t * 0.7) * (TIKTOK_HEIGHT * 0.08) * (1 + smoothedBassRef.current * 0.5);
          } else if (bgAnimationType === 'breathe') {
            animScale *= 1.15 + (Math.sin(t * 1.5) * 0.15);
          } else if (bgAnimationType === 'sway') {
            tiltAngle = Math.sin(t * 1.0) * 0.15;
            oX += Math.cos(t * 1.0) * (TIKTOK_WIDTH * 0.05);
          } else if (bgAnimationType === 'spin') {
            animScale *= 1.25; // Cần scale cực đại để bù góc xoay 45 độ
            tiltAngle = t * 0.5;
          } else if (bgAnimationType === 'float') {
            oX += Math.sin(t * 0.7) * (TIKTOK_WIDTH * 0.12);
            oY += Math.sin(t * 1.4) * (TIKTOK_HEIGHT * 0.12);
            tiltAngle = Math.cos(t * 0.5) * 0.03;
          }
        }

        ctx.translate(TIKTOK_WIDTH / 2, TIKTOK_HEIGHT / 2);
        if (tiltAngle !== 0) ctx.rotate(tiltAngle);
        ctx.scale(animScale, animScale);
        ctx.drawImage(source, oX - TIKTOK_WIDTH / 2, oY - TIKTOK_HEIGHT / 2, dW, dH);
        ctx.restore();
      };

      if (mediaSource) {
        if (currentSegTransition !== 'none' && prevSegmentMediaSource && segTransitionProgress < 1) {
          const t = segTransitionProgress;
          if (currentSegTransition === 'crossfade' || currentSegTransition === 'blur_dissolve') {
            drawSingleMedia(prevSegmentMediaSource, 1.0, 1 - t);
            drawSingleMedia(mediaSource, 1.0 + (1 - t) * 0.08, t);
          } else if (currentSegTransition === 'zoom_in') {
            drawSingleMedia(prevSegmentMediaSource, 1.0, 1 - t);
            drawSingleMedia(mediaSource, 1.3 - (0.3 * t), t);
          } else if (currentSegTransition === 'wipe_left') {
            drawSingleMedia(prevSegmentMediaSource, 1.0, 1.0);
            ctx.save();
            ctx.beginPath();
            ctx.rect(TIKTOK_WIDTH * (1 - t), 0, TIKTOK_WIDTH * t, TIKTOK_HEIGHT);
            ctx.clip();
            drawSingleMedia(mediaSource, 1.0, 1.0);
            ctx.restore();
          } else if (currentSegTransition === 'wipe_right') {
            drawSingleMedia(prevSegmentMediaSource, 1.0, 1.0);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, TIKTOK_WIDTH * t, TIKTOK_HEIGHT);
            ctx.clip();
            drawSingleMedia(mediaSource, 1.0, 1.0);
            ctx.restore();
          } else if (currentSegTransition === 'glitch') {
            // Glitch slice transition
            drawSingleMedia(prevSegmentMediaSource, 1.0, 1 - t);
            ctx.save();
            const sliceCount = 8;
            const sliceH = TIKTOK_HEIGHT / sliceCount;
            for (let i = 0; i < sliceCount; i++) {
              if (Math.random() < t * 1.5) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, i * sliceH, TIKTOK_WIDTH, sliceH);
                ctx.clip();
                const glitchOffset = (Math.random() - 0.5) * 40 * (1 - t);
                ctx.translate(glitchOffset, 0);
                drawSingleMedia(mediaSource, 1.0, 1.0);
                ctx.restore();
              }
            }
            ctx.restore();
          } else {
            drawSingleMedia(mediaSource, 1.0, 1.0);
          }
        } else {
          drawSingleMedia(mediaSource, 1.0, 1.0);
        }

        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
        ctx.fillRect(0, 0, TIKTOK_WIDTH, TIKTOK_HEIGHT);
      }

      // SPECTRA Beat Flash & Radial Glow Bloom on Kicks
      if (enableBeatZoom && enableBeatFlash && beatImpulseRef.current > 0.015) {
        ctx.save();
        const flashAlpha = Math.min(0.32, beatImpulseRef.current * 0.28);
        const spotGrad = ctx.createRadialGradient(
          TIKTOK_WIDTH / 2, TIKTOK_HEIGHT * 0.45, 50,
          TIKTOK_WIDTH / 2, TIKTOK_HEIGHT * 0.45, TIKTOK_WIDTH * 0.75
        );
        spotGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.95})`);
        spotGrad.addColorStop(0.35, `rgba(216, 180, 254, ${flashAlpha * 0.6})`);
        spotGrad.addColorStop(0.7, `rgba(168, 85, 247, ${flashAlpha * 0.25})`);
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, TIKTOK_WIDTH, TIKTOK_HEIGHT);
        ctx.restore();
      }

      if (particleEffect !== 'none') {
        particlesRef.current.forEach(p => {
          ctx.globalAlpha = p.alpha;
          if (particleEffect === 'snow' || particleEffect === 'bokeh') {
            ctx.fillStyle = (particleEffect === 'bokeh') ? 'rgba(255,255,255,0.15)' : '#fff';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            p.y += (particleEffect === 'bokeh' ? 0.4 : 1.2);
            p.x += Math.sin(p.y / 150);
          } else if (particleEffect === 'fireflies') {
            ctx.fillStyle = '#bef264';
            ctx.shadowColor = '#bef264';
            ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            p.y += (Math.random() - 0.5) * 2;
            p.x += (Math.random() - 0.5) * 2;
            p.alpha = p.baseAlpha * (0.4 + Math.sin(globalTimeMs / 1000 + p.x) * 0.6);
          } else if (particleEffect === 'ambient_dust') {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 12 * smoothedBassRef.current;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + smoothedBassRef.current), 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            p.y -= (0.5 + Math.random() * 0.5 + smoothedBassRef.current * 1.5);
            p.x += Math.sin(p.y / 80) * (0.5 + smoothedBassRef.current);
            p.alpha = p.baseAlpha * (0.5 + smoothedBassRef.current * 0.8 + Math.sin(globalTimeMs / 800 + p.x) * 0.3);
          } else if (particleEffect === 'ambient_sparks') {
            ctx.globalCompositeOperation = 'screen';
            // Subtle, lower opacity breathing alpha (soft & non-intrusive)
            const flicker = Math.sin(globalTimeMs / 200 + p.x * 0.2);
            const emberAlpha = Math.min(0.45, Math.max(0.05, p.baseAlpha * (0.65 + flicker * 0.35 + smoothedBassRef.current * 0.4)));
            ctx.globalAlpha = emberAlpha;
            
            // Random warm ember tones with soft glow
            const isHotGold = (p.size % 1.2) > 0.6;
            ctx.fillStyle = isHotGold ? '#fef08a' : '#fed7aa'; // light warm gold / peach amber
            ctx.shadowColor = isHotGold ? 'rgba(245, 158, 11, 0.7)' : 'rgba(234, 88, 12, 0.7)';
            ctx.shadowBlur = 4 + smoothedBassRef.current * 4;
            
            // Scaled small radius (delicate embers, ~0.6px - 2.2px)
            const sparkRadius = Math.max(0.5, p.size * (1 + smoothedBassRef.current * 0.35));
            ctx.beginPath();
            ctx.arc(p.x, p.y, sparkRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Organic upward floating with horizontal drift & draft turbulence
            p.y -= (1.2 + (p.size * 0.6) + Math.random() * 0.8 + smoothedBassRef.current * 2.0);
            p.x += Math.sin(p.y * 0.025 + p.size * 8) * 0.7 + (Math.random() - 0.5) * 0.5;
            
            // Seamless continuous looping with random re-distribution across width
            if (p.y < -10 || p.x < -20 || p.x > TIKTOK_WIDTH + 20) {
              p.y = TIKTOK_HEIGHT + Math.random() * 20;
              p.x = Math.random() * TIKTOK_WIDTH;
              p.size = Math.random() * 1.5 + 0.5;
              p.baseAlpha = Math.random() * 0.22 + 0.08;
            }
            ctx.globalCompositeOperation = 'source-over';
          } else if (particleEffect === 'rain') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(p.x, p.y, 1.2, p.size * 10);
            p.y += 22;
          } else if (particleEffect === 'mist') {
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(p.x - 150, p.y, 300, 120);
            p.x += 1;
          } else if (particleEffect === 'stars') {
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = p.alpha * (0.3 + Math.random() * 0.7);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); ctx.fill();
          } else if (particleEffect === 'glitter') {
            ctx.globalCompositeOperation = 'screen';
            const sparkle = (0.3 + Math.sin(globalTimeMs / 200 + p.x) * 0.7) * (1 + smoothedBassRef.current * 1.5);
            ctx.fillStyle = `rgba(255, 240, 180, ${p.alpha * sparkle})`;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            ctx.shadowBlur = 8 * sparkle;
            // Draw 4-point star sparkle
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.size);
            ctx.lineTo(p.x + p.size * 0.3, p.y - p.size * 0.3);
            ctx.lineTo(p.x + p.size, p.y);
            ctx.lineTo(p.x + p.size * 0.3, p.y + p.size * 0.3);
            ctx.lineTo(p.x, p.y + p.size);
            ctx.lineTo(p.x - p.size * 0.3, p.y + p.size * 0.3);
            ctx.lineTo(p.x - p.size, p.y);
            ctx.lineTo(p.x - p.size * 0.3, p.y - p.size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            p.y += (p.vy + smoothedBassRef.current * 0.5);
            p.x += Math.sin(globalTimeMs / 800 + p.y) * 0.5;
            if (p.y > TIKTOK_HEIGHT) { p.y = 0; p.x = Math.random() * TIKTOK_WIDTH; }
            ctx.globalCompositeOperation = 'source-over';
          } else if (particleEffect === 'petals') {
            const angle = Math.sin(globalTimeMs / 1000 + p.x) * 0.6;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(angle);
            ctx.fillStyle = `rgba(255, 182, 193, ${p.alpha * (0.7 + smoothedBassRef.current * 0.5)})`;
            ctx.shadowColor = 'rgba(244, 114, 182, 0.4)';
            ctx.shadowBlur = 4;
            // Draw smooth petal shape
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            p.y += (p.vy + smoothedBassRef.current * 0.8);
            p.x += Math.sin(globalTimeMs / 1200 + p.y) * 1.2;
            if (p.y > TIKTOK_HEIGHT) { p.y = -10; p.x = Math.random() * TIKTOK_WIDTH; }
          } else if (particleEffect === 'aurora' || particleEffect === 'light_leaks') {
            ctx.globalCompositeOperation = 'screen';
            const time = globalTimeMs / 2000;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            const bassFactor = smoothedBassRef.current * 0.8;
            gradient.addColorStop(0, `rgba(16, 185, 129, ${(p.alpha * 0.45) * (1 + bassFactor)})`);
            gradient.addColorStop(0.5, `rgba(6, 182, 212, ${(p.alpha * 0.25) * (1 + bassFactor)})`);
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath(); 
            ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, Math.sin(time + p.x) * 0.4, 0, Math.PI * 2); 
            ctx.fill();
            p.x += Math.sin(time + p.size) * 1.5;
            p.y += Math.cos(time * 0.8 + p.size) * 1.2;
            p.alpha = p.baseAlpha * (0.6 + Math.sin(time * 1.5 + p.x) * 0.4 + smoothedBassRef.current * 0.6);
            ctx.globalCompositeOperation = 'source-over';
          } else if (particleEffect === 'laser' || particleEffect === 'cinematic_flare') {
            ctx.globalCompositeOperation = 'screen';
            const time = globalTimeMs / 600;
            const isCyan = (p.size % 2) > 1;
            const strokeColor = isCyan ? '34, 211, 238' : '244, 114, 182';
            const intensityVal = (0.2 + Math.sin(time + p.x) * 0.3 + smoothedBassRef.current * 0.8) * p.alpha;
            ctx.strokeStyle = `rgba(${strokeColor}, ${intensityVal})`;
            ctx.lineWidth = 2 + smoothedBassRef.current * 4;
            ctx.shadowColor = `rgb(${strokeColor})`;
            ctx.shadowBlur = 10 * (1 + smoothedBassRef.current);
            ctx.beginPath();
            ctx.moveTo(p.x, 0);
            ctx.lineTo(p.x + Math.sin(time + p.y) * 100, TIKTOK_HEIGHT);
            ctx.stroke();
            ctx.shadowBlur = 0;
            p.x += (Math.random() - 0.5) * 3;
            if (p.x < 0) p.x = TIKTOK_WIDTH;
            if (p.x > TIKTOK_WIDTH) p.x = 0;
            ctx.globalCompositeOperation = 'source-over';
          } else if (particleEffect === 'digital_matrix') {
            ctx.fillStyle = '#22c55e'; // green-500
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 5 * smoothedBassRef.current;
            ctx.font = `${Math.floor(p.size * 4)}px monospace`;
            ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), p.x, p.y);
            ctx.shadowBlur = 0;
            p.y += (2 + smoothedBassRef.current * 8);
            p.alpha = p.baseAlpha * (0.3 + Math.random() * 0.7);
          } else if (particleEffect === 'rising_bubbles') {
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * (0.5 + smoothedBassRef.current * 0.5)})`;
            ctx.lineWidth = 1 + smoothedBassRef.current;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + smoothedBassRef.current * 0.3), 0, Math.PI * 2); ctx.stroke();
            
            // tiny highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.beginPath(); ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2); ctx.fill();
            
            p.y -= (1 + Math.random() * 1.5 + smoothedBassRef.current * 3);
            p.x += Math.sin(p.y / 30) * (1 + smoothedBassRef.current);
          } else if (particleEffect === 'prism_crystal') {
            // Rotating diamond/hexagonal crystal facets reflecting holographic lights
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(globalTimeMs * 0.001 + p.x);
            const crystalSize = (p.size * 2.5 + 4) * (1 + smoothedBassRef.current * 0.5);
            ctx.strokeStyle = `rgba(56, 189, 248, ${p.alpha * 0.8})`;
            ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha * 0.25})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -crystalSize);
            ctx.lineTo(crystalSize * 0.7, 0);
            ctx.lineTo(0, crystalSize);
            ctx.lineTo(-crystalSize * 0.7, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            p.y += p.vy * 0.8;
            p.x += Math.sin(p.y * 0.02) * 0.8;
          } else if (particleEffect === 'electric_arcs') {
            // High voltage blue/cyan lightning sparks
            ctx.strokeStyle = '#38bdf8';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 6 * (1 + smoothedBassRef.current);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (Math.random() - 0.5) * 18, p.y + (Math.random() - 0.5) * 18);
            ctx.stroke();
            ctx.shadowBlur = 0;
            p.x += (Math.random() - 0.5) * 4;
            p.y += (Math.random() - 0.5) * 4;
            p.alpha = p.baseAlpha * (0.4 + Math.random() * 0.6);
          } else if (particleEffect === 'floating_runes') {
            // Mystic ancient glowing golden runes
            ctx.save();
            ctx.font = `${Math.floor(p.size * 3.5 + 10)}px serif`;
            ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * (0.6 + smoothedBassRef.current * 0.4)})`;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 8 * (1 + smoothedBassRef.current);
            const runeChar = String.fromCharCode(0x16A0 + (Math.floor(p.x + p.y) % 24));
            ctx.fillText(runeChar, p.x, p.y);
            ctx.restore();
            p.y -= (0.8 + smoothedBassRef.current * 1.5);
            p.x += Math.sin(p.y * 0.03) * 0.6;
          }

          if (particleEffect !== 'ambient_sparks') {
            if (p.y > TIKTOK_HEIGHT + 50) p.y = -100;
            if (p.y < -150) p.y = TIKTOK_HEIGHT + 100;
            if (p.x > TIKTOK_WIDTH + 150) p.x = -150;
            if (p.x < -150) p.x = TIKTOK_WIDTH + 150;
          }
        });
        ctx.globalAlpha = 1.0;
      }

      if (showWaveform && dataArrayRef.current) {
        renderVisualizerEngine({
          ctx,
          canvasWidth: TIKTOK_WIDTH,
          canvasHeight: TIKTOK_HEIGHT,
          dataArray: dataArrayRef.current,
          bufferLength: dataArrayRef.current.length,
          smoothedBass: smoothedBassRef.current,
          smoothedMid: smoothedMidRef.current,
          smoothedHigh: smoothedHighRef.current,
          rotationAngle: rotationAngleRef.current,
          waveformStyle,
          globalTimeMs,
          waveformColor,
          waveformOpacity,
          waveformSize,
          waveformPosition,
          waveformX,
          waveformWidth,
          visualizerScale,
          bgImage: bgImgRef.current,
          logoImage: logoImgRef.current,
          waveformParticlesRef: waveformParticlesRef,
          customVisualizerJs: customVisualizerJs
        });
      }

      customTexts.forEach(ct => {
        if (!ct.visible || !ct.text) return;
        ctx.save();
        ctx.globalAlpha = ct.opacity;
        ctx.fillStyle = ct.color;
        
        let fontStyleStr = '';
        if (ct.isItalic) fontStyleStr += 'italic ';
        if (ct.isBold) fontStyleStr += 'bold ';
        ctx.font = `${fontStyleStr}${ct.fontSize}px "${ct.fontFamily}"`;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const posX = (ct.x / 100) * TIKTOK_WIDTH;
        const posY = (ct.y / 100) * TIKTOK_HEIGHT;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(ct.text, posX, posY);

        if (ct.isUnderline) {
          const metrics = ctx.measureText(ct.text);
          const textWidth = metrics.width;
          ctx.beginPath();
          ctx.lineWidth = Math.max(1, ct.fontSize * 0.08);
          ctx.strokeStyle = ct.color;
          const yOff = ct.fontSize * 0.45;
          ctx.moveTo(posX - textWidth / 2, posY + yOff);
          ctx.lineTo(posX + textWidth / 2, posY + yOff);
          ctx.stroke();
        }
        
        ctx.restore();
      });

      if (showLyrics) {
        // Apply lyricLeadTime (in seconds) so lyrics display earlier if user configured an early appearance offset
        const effectiveLyricTime = activeCurrentTime + lyricLeadTime;
        const currentIndex = lrcLines.findIndex((line, i) => {
          const nextTime = lrcLines[i + 1]?.time || (line.time + 5);
          return effectiveLyricTime >= line.time && effectiveLyricTime < nextTime;
        });

        // 🎵 REAL-TIME AUDIO REACTIVE ENGINE CALCULATIONS
        const bassImpact = smoothedBassRef.current || 0;
        const springBeat = Math.max(0, springPosRef.current || 0);
        const beatReactivePulse = (enableLyricBeatPulse !== false) 
          ? (springBeat * 0.08 + bassImpact * 0.06) * (lyricBeatIntensity ?? 1.0)
          : 0;

        const drawLyricLine = (line: LrcLine, y: number, baseAlpha: number, isMain: boolean, index: number) => {
          const lineStartTime = line.time;
          const nextLineTime = lrcLines[index + 1]?.time || (line.time + 5);
          const timeSinceStart = effectiveLyricTime - lineStartTime;
          const timeUntilEnd = nextLineTime - effectiveLyricTime;
          
          let alpha = baseAlpha;
          let yOff = 0, scale = 1, blur = 0, skewX = 0, rotateZ = 0;
          let textToRender = line.text;

          // 1. Text Transformation
          if (textTransform === "uppercase") textToRender = textToRender.toUpperCase();
          else if (textTransform === "lowercase") textToRender = textToRender.toLowerCase();
          else if (textTransform === "capitalize") {
            textToRender = textToRender.replace(/\b\w/g, c => c.toUpperCase());
          }

          // 2. Audio-Reactive Beat Scale Bounce on Active Line
          if (isMain) {
            scale *= (1 + beatReactivePulse);
          } else if (inactiveLinesBlur > 0) {
            blur += inactiveLinesBlur;
          }

          // 3. Lyric Animation Styles
          if (activePlaying && lyricAnimation !== "none" && timeSinceStart >= 0 && timeSinceStart < animationSpeed) {
            const p = Math.min(1, Math.max(0, timeSinceStart / animationSpeed));
            const eased = -(Math.cos(Math.PI * p) - 1) / 2;

            if (lyricAnimation === "fade") {
              alpha *= eased;
            } else if (lyricAnimation === "slide") {
              yOff = (1 - eased) * (fontSize * 0.4);
              alpha *= eased;
            } else if (lyricAnimation === "scale") {
              scale *= (0.85 + (eased * 0.15));
            } else if (lyricAnimation === "zoom") {
              scale *= (1.15 - (eased * 0.15));
            } else if (lyricAnimation === "blur") {
              blur = (1 - eased) * 14;
              alpha *= eased;
            } else if (lyricAnimation === "elastic_pop") {
              // 3D Elastic spring pop with overshoot (TikTok / Reels Viral Motion)
              const elastic = 1 + Math.sin(p * Math.PI * 3.2) * Math.exp(-p * 4.2) * 0.38;
              scale *= (p < 0.99 ? elastic : 1);
              yOff = (1 - p) * (fontSize * 0.6);
              rotateZ = (1 - p) * -0.05;
              alpha *= Math.min(1, p * 2.2);
            } else if (lyricAnimation === "kinetic_bounce") {
              // Snappy spring bounce overshoot
              const elastic = Math.sin(p * Math.PI * 2.5) * Math.pow(1 - p, 2) * 0.45;
              scale *= (0.7 + (p * 0.3) + elastic);
              yOff = (1 - p) * (fontSize * 0.8);
              alpha *= Math.min(1, p * 1.5);
            } else if (lyricAnimation === "word_karaoke_sweep") {
              scale *= (0.95 + eased * 0.05);
              alpha *= Math.min(1, p * 1.8);
            } else if (lyricAnimation === "cinema_shimmer") {
              scale *= (0.92 + eased * 0.08);
              alpha *= eased;
            } else if (lyricAnimation === "flip_3d") {
              scale *= (0.8 + Math.sin(p * Math.PI * 0.5) * 0.2);
              yOff = (1 - p) * (fontSize * 0.5);
              alpha *= eased;
            } else if (lyricAnimation === "rgb_pulse") {
              scale *= (0.9 + eased * 0.1);
              alpha *= eased;
            } else if (lyricAnimation === "typewriter") {
              const charCount = Math.floor(line.text.length * p);
              textToRender = textToRender.substring(0, Math.max(1, charCount));
              if (p < 0.95 && Math.floor(globalTimeMs / 200) % 2 === 0) {
                textToRender += "|";
              }
            } else if (lyricAnimation === "glitch") {
              if (p < 0.7 && Math.random() < 0.4) {
                yOff += (Math.random() - 0.5) * (fontSize * 0.3);
                skewX = (Math.random() - 0.5) * 0.35;
                alpha *= (0.6 + Math.random() * 0.4);
              }
            } else if (lyricAnimation === "neon_flicker") {
              const flicker = Math.sin(p * 28) > 0 ? 1 : 0.2;
              alpha *= (p * 0.7 + flicker * 0.3);
            } else if (lyricAnimation === "wave_float") {
              yOff = Math.sin(globalTimeMs / 600 + index) * 8;
              rotateZ = Math.cos(globalTimeMs / 800 + index) * 0.03;
            }
          }

          if (activePlaying && lyricAnimation !== "none" && timeUntilEnd >= 0 && timeUntilEnd < animationSpeed) {
            const p = Math.max(0, timeUntilEnd / animationSpeed);
            const eased = -(Math.cos(Math.PI * p) - 1) / 2;
            alpha *= eased;
          }

          ctx.save();
          const posX = (lyricX / 100) * TIKTOK_WIDTH;
          ctx.translate(posX, y + yOff);
          if (rotateZ !== 0) ctx.rotate(rotateZ);
          if (skewX !== 0) ctx.transform(1, 0, skewX, 1, 0, 0);
          ctx.scale(scale, scale);
          if (blur > 0) ctx.filter = `blur(${blur}px)`;
          
          let lyricFontStyleStr = "";
          if (lyricIsItalic) lyricFontStyleStr += "italic ";
          if (lyricIsBold || isMain) lyricFontStyleStr += (lyricIsBold ? "bold " : "800 ");
          else lyricFontStyleStr += "500 ";

          const currentFontSize = isMain ? fontSize : fontSize * 0.7;
          ctx.font = `${lyricFontStyleStr}${currentFontSize}px "${fontFamily}"`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          if (letterSpacing && letterSpacing !== 0) {
            try { (ctx as any).letterSpacing = `${letterSpacing}px`; } catch(e) {}
          }

          // 4. Glassmorphism Backdrop Pill behind active line
          if (isMain && enableLyricBox && textToRender.trim().length > 0) {
            const metrics = ctx.measureText(textToRender);
            const boxW = metrics.width + currentFontSize * 1.3;
            const boxH = currentFontSize * 1.55;
            const boxR = boxH * 0.35;
            ctx.save();
            ctx.fillStyle = lyricBoxColor || "rgba(0, 0, 0, 0.55)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 1.2;
            ctx.shadowColor = "rgba(0,0,0,0.4)";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === "function") {
              (ctx as any).roundRect(-boxW / 2, -boxH / 2, boxW, boxH, boxR);
            } else {
              ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
            }
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }

          // 5. Audio-Reactive Text Glow & Neon Bloom
          const dynamicGlowBlur = (textShadowBlur > 0) 
            ? textShadowBlur * (isMain ? (1 + bassImpact * 0.6 * (lyricBeatIntensity ?? 1.0)) : 0.6) 
            : 0;

          if (dynamicGlowBlur > 0) {
            ctx.shadowColor = textShadowColor;
            ctx.shadowBlur = dynamicGlowBlur;
          }

          // 6. Text Outline Stroke (Viền Chữ Chống Chìm Nền)
          if (outlineWidth > 0) {
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = outlineWidth * (isMain ? 1 : 0.7);
            ctx.globalAlpha = alpha;
            ctx.strokeText(textToRender, 0, 0);
          }

          // 7. Base Text Fill
          ctx.fillStyle = textColor;
          ctx.globalAlpha = alpha;
          ctx.fillText(textToRender, 0, 0);

          // 8. Underline
          if (lyricIsUnderline) {
            const metrics = ctx.measureText(textToRender);
            const textWidth = metrics.width;
            ctx.beginPath();
            ctx.lineWidth = Math.max(1, currentFontSize * 0.08);
            ctx.strokeStyle = textColor;
            const textYOff = currentFontSize * 0.45;
            ctx.moveTo(-textWidth / 2, textYOff);
            ctx.lineTo(textWidth / 2, textYOff);
            ctx.globalAlpha = alpha;
            ctx.stroke();
          }

          // 9. RGB Pulse subtle chromatic split on active line
          if (isMain && lyricAnimation === "rgb_pulse" && (bassImpact > 0.2 || springBeat > 0.2)) {
            const rgbShift = (2 + bassImpact * 4) * (lyricBeatIntensity ?? 1.0);
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = "rgba(255, 40, 80, 0.45)";
            ctx.fillText(textToRender, -rgbShift, 0);
            ctx.fillStyle = "rgba(40, 200, 255, 0.45)";
            ctx.fillText(textToRender, rgbShift, 0);
            ctx.restore();
          }

          // 10. Cinema Shimmer metallic sweep
          if (isMain && lyricAnimation === "cinema_shimmer") {
            const metrics = ctx.measureText(textToRender);
            const tW = metrics.width;
            const sweepCycle = (globalTimeMs * 0.0015) % 2.5;
            if (sweepCycle < 1.0) {
              const shimmerPos = -tW / 2 + tW * sweepCycle;
              const shimmerGrad = ctx.createLinearGradient(shimmerPos - 40, 0, shimmerPos + 40, 0);
              shimmerGrad.addColorStop(0, "rgba(255,255,255,0)");
              shimmerGrad.addColorStop(0.5, "rgba(255,255,255,0.7)");
              shimmerGrad.addColorStop(1, "rgba(255,255,255,0)");
              ctx.save();
              ctx.globalCompositeOperation = "source-atop";
              ctx.fillStyle = shimmerGrad;
              ctx.fillText(textToRender, 0, 0);
              ctx.restore();
            }
          }

          // 11. Karaoke Highlight (Quét màu tiến độ)
          if (isMain && enableHighlight) {
            const duration = nextLineTime - lineStartTime;
            const prog = Math.min(1, Math.max(0, timeSinceStart / duration));
            const tW = ctx.measureText(textToRender).width;
            ctx.save();
            ctx.beginPath(); 
            ctx.rect(-tW/2, -fontSize*0.9, tW * prog, fontSize*1.8); 
            ctx.clip();
            ctx.fillStyle = karaokeHighlightColor; 
            ctx.globalAlpha = alpha;
            ctx.fillText(textToRender, 0, 0);

            // Leading luminous glowing sweep edge for word_karaoke_sweep
            if (lyricAnimation === "word_karaoke_sweep" && prog > 0.02 && prog < 0.98) {
              const leadX = -tW / 2 + tW * prog;
              ctx.fillStyle = "#ffffff";
              ctx.shadowColor = karaokeHighlightColor;
              ctx.shadowBlur = 14;
              ctx.fillRect(leadX - 2, -fontSize * 0.6, 4, fontSize * 1.2);
            }
            
            if (lyricIsUnderline) {
              ctx.beginPath();
              ctx.lineWidth = Math.max(1, fontSize * 0.08);
              ctx.strokeStyle = karaokeHighlightColor;
              const textYOff = fontSize * 0.45;
              ctx.moveTo(-tW / 2, textYOff);
              ctx.lineTo(tW / 2, textYOff);
              ctx.stroke();
            }
            
            ctx.restore();
          }
          ctx.restore();
        };

        if (currentIndex !== -1) {
          const range = Math.floor(lyricLinesCount / 2);
          const yBase = (lyricPosition / 100) * TIKTOK_HEIGHT;
          const spacingMult = lyricLineSpacing ?? 1.8;
          const inactOpacity = inactiveLinesOpacity ?? 0.4;
          for (let i = -range; i <= range; i++) {
            const idx = currentIndex + i;
            if (lrcLines[idx]) {
              const isMain = i === 0;
              const yPos = yBase + (i * fontSize * spacingMult);
              const alpha = isMain ? 1 : inactOpacity / (Math.abs(i) + 0.4);
              drawLyricLine(lrcLines[idx], yPos, alpha, isMain, idx);
            }
          }
        } else if (!activePlaying && lrcLines.length > 0) {
          let previewIdx = lrcLines.findIndex(l => l.time >= effectiveLyricTime);
          if (previewIdx === -1) previewIdx = lrcLines.length - 1;
          if (previewIdx < 0) previewIdx = 0;
          const yBase = (lyricPosition / 100) * TIKTOK_HEIGHT;
          drawLyricLine(lrcLines[previewIdx], yBase, 1.0, true, previewIdx);
        }
      }

      if (showLogo && logoImgRef.current) {
        const logo = logoImgRef.current;
        const lW = logoSize;
        const lH = (logo.height / logo.width) * lW;
        const lX = (logoX / 100) * TIKTOK_WIDTH;
        const lY = (logoY / 100) * TIKTOK_HEIGHT;
        ctx.globalAlpha = logoOpacity;
        ctx.drawImage(logo, lX, lY, lW, lH);
        ctx.globalAlpha = 1.0;
      }

      // Render On-Video Music Player HUD (Glassmorphism, Cassette, Spotify Dock, Vinyl, Timer Badge)
      if (showMusicPlayer) {
        renderOnVideoMusicPlayer({
          ctx,
          canvasWidth: TIKTOK_WIDTH,
          canvasHeight: TIKTOK_HEIGHT,
          currentTime: activeCurrentTime,
          duration: duration || audioRef.current?.duration || 0,
          isPlaying: activePlaying || false,
          style: musicPlayerStyle || ('modern_glass' as MusicPlayerStyle),
          title: musicPlayerTitle || (customTexts && customTexts[0] ? customTexts[0].text : '') || 'SONG TITLE',
          artist: musicPlayerArtist || (customTexts && customTexts[1] ? customTexts[1].text : '') || 'ARTIST NAME',
          x: musicPlayerX || 0,
          y: musicPlayerY || 0,
          scale: musicPlayerScale || 1,
          opacity: musicPlayerOpacity || 1,
          theme: musicPlayerTheme || ('dark_glass' as MusicPlayerTheme),
          showButtons: showPlayerButtons !== false,
          showTimer: showPlayerTimer !== false,
          showProgress: showPlayerProgress !== false,
          showCover: showPlayerCover !== false,
          showWaveform: showPlayerWaveform !== false,
          coverImage: logoImgRef.current || bgImgRef.current,
          dataArray: dataArrayRef.current,
          smoothedBass: smoothedBassRef.current
        });
      }

      // Render Smart Intro Card (Spotify Glass, Apple Music, Cyber Neon, Retro Mixtape)
      if (smartIntroCard && smartIntroCard.enabled) {
        renderSmartIntroCard({
          ctx,
          canvasWidth: TIKTOK_WIDTH,
          canvasHeight: TIKTOK_HEIGHT,
          introCard: smartIntroCard,
          currentTime: activeCurrentTime,
          coverImage: logoImgRef.current || bgImgRef.current
        });
      }

      // Render Smart Outro Card (Ending callout & social banner)
      if (smartOutroCard && smartOutroCard.enabled) {
        renderSmartOutroCard({
          ctx,
          canvasWidth: TIKTOK_WIDTH,
          canvasHeight: TIKTOK_HEIGHT,
          outroCard: smartOutroCard,
          currentTime: activeCurrentTime,
          duration: duration || audioRef.current?.duration || 0
        });
      }

      // Smooth Fade In / Fade Out Black Overlay Mask
      // Only apply fade-in mask during active playback; in idle/paused designer mode, never blackout design preview!
      if ((enableFadeIn || enableFadeOut) && activePlaying) {
        const actualStart = enableTrim ? trimStart : 0;
        const actualEnd = (enableTrim && trimEnd > actualStart) ? trimEnd : (audioRef.current?.duration || 100000);
        
        let fadeAlpha = 0;
        if (enableFadeIn && fadeInDuration > 0) {
          const timeFromStart = activeCurrentTime - actualStart;
          if (timeFromStart >= 0 && timeFromStart < fadeInDuration) {
            fadeAlpha = Math.max(fadeAlpha, 1 - (timeFromStart / fadeInDuration));
          } else if (timeFromStart < 0) {
            fadeAlpha = 1;
          }
        }
        
        if (enableFadeOut && fadeOutDuration > 0) {
          const timeUntilEnd = actualEnd - activeCurrentTime;
          if (timeUntilEnd >= 0 && timeUntilEnd < fadeOutDuration) {
            fadeAlpha = Math.max(fadeAlpha, 1 - (timeUntilEnd / fadeOutDuration));
          } else if (timeUntilEnd < 0) {
            fadeAlpha = 1;
          }
        }

        if (fadeAlpha > 0.001) {
          ctx.save();
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, Math.max(0, fadeAlpha))})`;
          ctx.fillRect(0, 0, TIKTOK_WIDTH, TIKTOK_HEIGHT);
          ctx.restore();
        }
      }

      // Reactive Post-Processing VFX Shaders (Chromatic Aberration, VHS, Lens Flare, Neon Bloom, Vignette, Film Grain)
      if (postProcessingVfx && postProcessingVfx !== 'none') {
        applyPostProcessingVfx({
          ctx,
          canvasWidth: TIKTOK_WIDTH,
          canvasHeight: TIKTOK_HEIGHT,
          effect: postProcessingVfx,
          intensity: vfxIntensity ?? 1.0,
          smoothedBass: smoothedBassRef.current,
          smoothedMid: smoothedMidRef.current,
          smoothedHigh: smoothedHighRef.current,
          isPlaying: activePlaying || false,
          currentTime: activeCurrentTime
        });
      }
      } catch (renderErr) {
        console.error("VideoPreview frame render error (safeguarded):", renderErr);
      }
    };

    const loop = () => {
      const { exportEngine, isExporting } = propsRef.current;
      const isWebCodecsExporting = exportEngine === 'webcodecs' && isExporting;

      if (!isTabHidden && !isWebCodecsExporting) {
        renderFrame(); // Normal preview mode
        if ((window as any).__activeCanvasTrack?.requestFrame) {
          try {
            (window as any).__activeCanvasTrack.requestFrame();
          } catch(e) {}
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    if (canvasRef.current) {
      (canvasRef.current as any).renderExactFrame = (t: number, f?: Uint8Array) => renderFrame(t, f);
    }
    (window as any).__renderExactKaraokeFrame = (t: number, f?: Uint8Array) => renderFrame(t, f);

    loop();
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [exportRatio, exportFps, isFullscreen]);

  const [selectedGizmoElement, setSelectedGizmoElement] = useState<'player' | 'lyrics' | 'waveform' | 'logo' | 'intro'>('player');
  const [isGizmoDragging, setIsGizmoDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gizmoStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  const handleGizmoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableCanvasInteractiveMode || !onUpdateCanvasElement || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Get current values
    let currX = 50;
    let currY = 50;
    if (selectedGizmoElement === 'player') {
      currX = musicPlayerX ?? 50;
      currY = musicPlayerY ?? 78;
    } else if (selectedGizmoElement === 'lyrics') {
      currX = lyricX ?? 50;
      currY = lyricPosition ?? 50;
    } else if (selectedGizmoElement === 'waveform') {
      currX = waveformX ?? 50;
      currY = waveformPosition ?? 85;
    } else if (selectedGizmoElement === 'logo') {
      currX = logoX ?? 50;
      currY = logoY ?? 10;
    } else if (selectedGizmoElement === 'intro') {
      currX = smartIntroCard?.x ?? 50;
      currY = smartIntroCard?.y ?? 20;
    }

    gizmoStartRef.current = {
      startX: clickX,
      startY: clickY,
      initialX: currX,
      initialY: currY
    };

    setIsGizmoDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleGizmoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isGizmoDragging || !enableCanvasInteractiveMode || !onUpdateCanvasElement || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const deltaX = currentX - gizmoStartRef.current.startX;
    const deltaY = currentY - gizmoStartRef.current.startY;

    let targetX = Math.round(gizmoStartRef.current.initialX + deltaX);
    let targetY = Math.round(gizmoStartRef.current.initialY + deltaY);

    // Snap to 50% center if close
    if (Math.abs(targetX - 50) < 3) targetX = 50;
    if (Math.abs(targetY - 50) < 3) targetY = 50;

    targetX = Math.max(0, Math.min(100, targetX));
    targetY = Math.max(0, Math.min(100, targetY));

    if (selectedGizmoElement === 'player') {
      onUpdateCanvasElement({ musicPlayerX: targetX, musicPlayerY: targetY });
    } else if (selectedGizmoElement === 'lyrics') {
      onUpdateCanvasElement({ lyricX: targetX, lyricPosition: targetY });
    } else if (selectedGizmoElement === 'waveform') {
      onUpdateCanvasElement({ waveformX: targetX, waveformPosition: targetY });
    } else if (selectedGizmoElement === 'logo') {
      onUpdateCanvasElement({ logoX: targetX, logoY: targetY });
    } else if (selectedGizmoElement === 'intro') {
      onUpdateCanvasElement({
        smartIntroCard: {
          ...(smartIntroCard || {}),
          x: targetX,
          y: targetY
        }
      });
    }
  };

  const handleGizmoPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isGizmoDragging) {
      setIsGizmoDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  let aspectClass = "aspect-[9/16]";
  if (exportRatio === '16:9') aspectClass = "aspect-video";
  else if (exportRatio === '1:1') aspectClass = "aspect-square";

  // Calculate current active gizmo box position
  let activeGizmoX = 50;
  let activeGizmoY = 50;
  let activeGizmoLabel = 'Music Player';
  if (selectedGizmoElement === 'player') {
    activeGizmoX = musicPlayerX ?? 50;
    activeGizmoY = musicPlayerY ?? 78;
    activeGizmoLabel = '🎵 Music Player HUD';
  } else if (selectedGizmoElement === 'lyrics') {
    activeGizmoX = lyricX ?? 50;
    activeGizmoY = lyricPosition ?? 50;
    activeGizmoLabel = '🎤 Lyric Text';
  } else if (selectedGizmoElement === 'waveform') {
    activeGizmoX = waveformX ?? 50;
    activeGizmoY = waveformPosition ?? 85;
    activeGizmoLabel = '🌊 Waveform Sóng Nhạc';
  } else if (selectedGizmoElement === 'logo') {
    activeGizmoX = logoX ?? 50;
    activeGizmoY = logoY ?? 10;
    activeGizmoLabel = '🏷️ Logo / Sticker';
  } else if (selectedGizmoElement === 'intro') {
    activeGizmoX = smartIntroCard?.x ?? 50;
    activeGizmoY = smartIntroCard?.y ?? 20;
    activeGizmoLabel = '🪪 Smart Intro Card';
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={`group w-full bg-slate-950 rounded-md overflow-hidden shadow-2xl border border-slate-700 flex items-center justify-center transition-all ${
          isFullscreen ? 'fixed inset-0 z-[100] !rounded-none !border-none bg-slate-950/95 backdrop-blur-sm p-4 h-[100dvh]' : `relative ${aspectClass}`
        }`}
      >
        <canvas 
          ref={canvasRef} 
          width={TIKTOK_WIDTH} 
          height={TIKTOK_HEIGHT} 
          className={`max-w-full max-h-full object-contain ${isFullscreen ? 'shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-slate-800 rounded-xl' : ''}`}
        />

        {/* INTERACTIVE DRAG-AND-DROP GIZMO OVERLAY */}
        {enableCanvasInteractiveMode && (
          <div
            onPointerDown={handleGizmoPointerDown}
            onPointerMove={handleGizmoPointerMove}
            onPointerUp={handleGizmoPointerUp}
            className="absolute inset-0 z-30 cursor-move touch-none select-none"
          >
            {/* Top Interactive Switcher Toolbar */}
            <div 
              onPointerDown={(e) => e.stopPropagation()} 
              className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-lg border border-cyan-500/50 shadow-2xl z-40"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 pl-1">
                <i className="fa-solid fa-arrows-up-down-left-right animate-pulse"></i>
                <span className="hidden sm:inline">Kéo Thả:</span>
              </div>

              <div className="flex items-center gap-1">
                {(['player', 'lyrics', 'waveform', 'logo', 'intro'] as const).map(elem => {
                  const isSel = selectedGizmoElement === elem;
                  const labels = {
                    player: 'Player',
                    lyrics: 'Lyric',
                    waveform: 'Sóng',
                    logo: 'Logo',
                    intro: 'Intro Card'
                  };
                  return (
                    <button
                      key={elem}
                      type="button"
                      onClick={() => setSelectedGizmoElement(elem)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                        isSel
                          ? 'bg-cyan-500 text-slate-950 shadow font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {labels[elem]}
                    </button>
                  );
                })}
              </div>

              <div className="text-[9px] font-mono text-cyan-300 pr-1">
                X:{activeGizmoX}% Y:{activeGizmoY}%
              </div>
            </div>

            {/* Center Snap Guide Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-cyan-500/30 pointer-events-none"></div>
            <div className="absolute left-0 right-0 top-1/2 h-px border-t border-dashed border-cyan-500/30 pointer-events-none"></div>

            {/* Active Element Bounding Box Target */}
            <div
              style={{
                left: `${activeGizmoX}%`,
                top: `${activeGizmoY}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute pointer-events-none"
            >
              <div className={`p-3 rounded-lg border-2 ${isGizmoDragging ? 'border-amber-400 bg-amber-500/15 ring-4 ring-amber-400/30' : 'border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/40'} shadow-2xl transition-all`}>
                <div className="flex items-center gap-1.5 whitespace-nowrap bg-slate-950/90 text-cyan-300 border border-cyan-500/60 px-2 py-0.5 rounded-full text-[9px] font-black shadow">
                  <span>{activeGizmoLabel}</span>
                  <span className="font-mono text-[8px] text-amber-300">({activeGizmoX}%, {activeGizmoY}%)</span>
                </div>

                {/* Neon Corner Grips */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-cyan-400 border border-white rounded-full shadow"></div>
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-white rounded-full shadow"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-cyan-400 border border-white rounded-full shadow"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-white rounded-full shadow"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Fullscreen Expansion Button */}
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`absolute bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition-all border border-slate-700/50 shadow-lg flex items-center justify-center
            ${isFullscreen 
              ? 'top-6 right-6 p-4 w-14 h-14 z-[101] opacity-100 ring-2 ring-slate-500 hover:scale-110' 
              : 'bottom-4 right-4 p-2.5 w-11 h-11 opacity-0 group-hover:opacity-100'
            }`}
          title={isFullscreen ? "Đóng chế độ xem lớn" : "Bật chế độ xem toàn màn hình / Mở rộng"}
        >
          <i className={`fa-solid ${isFullscreen ? 'fa-compress text-xl' : 'fa-expand'}`}></i>
        </button>
      </div>
      
      {/* Invisible placeholder to prevent layout shift when entering fullscreen */}
      {isFullscreen && (
        <div className={`relative w-full ${aspectClass} rounded-md border border-dashed border-slate-700/50 flex items-center justify-center`}>
          <span className="text-slate-500 font-medium"><i className="fa-solid fa-expand mr-2"></i> Đang xem lớn</span>
        </div>
      )}
    </>
  );
});

export default VideoPreview;
