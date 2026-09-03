
export interface LrcLine {
  time: number; // seconds
  text: string;
}

export interface CustomTextLine {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  opacity: number;
  visible: boolean;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

export type ParticleType = 
  | 'none' 
  | 'snow' 
  | 'stars' 
  | 'rain' 
  | 'bokeh' 
  | 'mist' 
  | 'fireflies' 
  | 'ambient_dust' 
  | 'ambient_sparks' 
  | 'glitter' 
  | 'petals' 
  | 'aurora' 
  | 'laser' 
  | 'light_leaks' 
  | 'cinematic_flare' 
  | 'digital_matrix' 
  | 'rising_bubbles'
  | 'prism_crystal'
  | 'electric_arcs'
  | 'floating_runes';

export type PostProcessingVfx = 
  | 'none'
  | 'chromatic_aberration'
  | 'vhs_retro'
  | 'film_grain'
  | 'anamorphic_lens_flare'
  | 'neon_glow_bloom'
  | 'vignette_focus'
  | 'glitch_cyberpunk'
  | 'light_leak_vintage'
  | 'radial_zoom_blur'
  | 'scanline_crt'
  | 'golden_bokeh';

export type MusicPlayerStyle = 
  | 'modern_glass' 
  | 'lofi_cassette' 
  | 'spotify_bar' 
  | 'retro_vinyl_card' 
  | 'minimal_timer_badge'
  | 'cyber_hologram'
  | 'neon_synthwave'
  | 'apple_dynamic_island'
  | 'vintage_ipod'
  | 'glow_cd_case';
export type MusicPlayerTheme = 'dark_glass' | 'lofi_pastel' | 'cyberpunk' | 'warm_amber' | 'clean_white';

export type WaveformStyle = 
  | 'lofi_vibes'
  | 'parallax_waves'
  | 'trap_bass_ring'
  | 'cyber_mirrored_bars'
  | 'tunnel_vortex'
  | 'quantum_ribbon'
  | 'vinyl_groove'
  | 'solar_flare'
  | 'glass_pillars'
  | 'neon_heartbeat'
  | 'liquid_gold'
  | 'stardust_orbit'
  | 'audio_ring'
  | 'cosmic_mandala'
  | 'aurora'
  | 'cyber_matrix'
  | 'dna_helix'
  | 'neon_perspective'
  | 'bars'
  | 'reflected'
  | 'pulse'
  | 'circles'
  | 'neon_lines'
  | 'custom_js';
export type AnimationType = 
  | 'none' 
  | 'fade' 
  | 'slide' 
  | 'scale' 
  | 'zoom' 
  | 'blur'
  | 'kinetic_bounce'
  | 'typewriter'
  | 'glitch'
  | 'neon_flicker'
  | 'wave_float'
  | 'elastic_pop'
  | 'word_karaoke_sweep'
  | 'cinema_shimmer'
  | 'flip_3d'
  | 'rgb_pulse';
export type TextTransformType = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type BgAnimationType = 'none' | 'zoom' | 'pan' | '3d_parallax_tilt' | 'breathe' | 'sway' | 'spin' | 'float';
export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type BeatZoomMode = 'spectra_punch' | 'sub_bass_pulse' | 'drop_impact' | 'rotational_kick' | 'inverted_dip';
export type BeatZoomTarget = 'bg_only' | 'all';

export interface KaraokeState {
  audioUrl: string | null;
  lrcLines: LrcLine[];
  backgroundImageUrl: string | null;
  backgroundType: 'image' | 'video';
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  // Text Styling
  showLyrics: boolean;
  fontSize: number;
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
  overlayOpacity: number;
  lyricPosition: number; // 0 to 100 (vertical)
  lyricX: number; // 0 to 100 (horizontal)
  // Animation
  lyricAnimation: AnimationType;
  animationSpeed: number; // in seconds
  lyricLinesCount: number; // 1, 3, or 5
  lyricLeadTime?: number; // Early appearance offset in seconds (e.g. 0 to 3s or custom)
  letterSpacing?: number; // -2 to 24px
  textTransform?: TextTransformType;
  enableLyricBeatPulse?: boolean; // Real-time bass bounce & scale reaction
  lyricBeatIntensity?: number; // 0.0 to 2.0 (default 1.0)
  lyricLineSpacing?: number; // Multiplier 1.2 to 2.6 (default 1.8)
  inactiveLinesOpacity?: number; // 0.1 to 0.8 (default 0.4)
  inactiveLinesBlur?: number; // 0 to 10px (default 0)
  enableLyricBox?: boolean; // Glassmorphism backdrop pill behind active lyric
  lyricBoxColor?: string; // Backdrop color
  // Background Effects
  enablePan: boolean;
  bgAnimationType: BgAnimationType;
  bgAnimationSpeed: number;
  particleEffect: ParticleType;
  // Cinematic Post-Processing & Reactive VFX Shaders
  postProcessingVfx?: PostProcessingVfx;
  vfxIntensity?: number; // 0.0 to 2.0 (default 1.0)
  // Logo Overlay
  showLogo?: boolean;
  logoUrl: string | null;
  logoOpacity: number;
  logoSize: number;
  logoX: number; // 0 to 100 (horizontal)
  logoY: number; // 0 to 100 (vertical)
  // Waveform Visualization
  showWaveform: boolean;
  waveformStyle: WaveformStyle;
  waveformColor: string;
  waveformOpacity: number;
  waveformSize: number;
  waveformPosition: number; // vertical
  waveformX: number; // horizontal center
  waveformWidth: number; // percentage of screen width
  visualizerScale: number;
  customVisualizerJs?: string;
  // Custom Text Overlays
  customTexts: CustomTextLine[];
  // On-Video Music Player HUD Widget
  showMusicPlayer: boolean;
  musicPlayerStyle: MusicPlayerStyle;
  musicPlayerTitle: string;
  musicPlayerArtist: string;
  musicPlayerX: number; // 0 to 100 (%)
  musicPlayerY: number; // 0 to 100 (%)
  musicPlayerScale: number; // 0.5 to 2.0
  musicPlayerOpacity: number; // 0.1 to 1.0
  musicPlayerTheme: MusicPlayerTheme;
  showPlayerButtons: boolean;
  showPlayerTimer: boolean;
  showPlayerProgress: boolean;
  showPlayerCover: boolean;
  showPlayerWaveform: boolean;
  // Beat Zoom (SPECTRA Pro Engine)
  enableBeatZoom: boolean;
  beatZoomMode?: BeatZoomMode;
  beatZoomTarget?: BeatZoomTarget;
  zoomMin: number;
  zoomMax: number;
  sensitivity: number;
  smoothness: number;
  leadMs: number;
  beatZoomSpring?: number; // 0.1 to 1.0 (Spring recoil bounce)
  enableBeatFlash?: boolean; // Radial glow bloom on kicks
  enableBeatShake?: boolean; // Micro-camera impact shake on heavy drops
  // Trim & Fade Export Settings
  enableTrim: boolean;
  trimStart: number; // in seconds
  trimEnd: number; // in seconds (0 = end of audio)
  enableFadeIn: boolean;
  fadeInDuration: number; // in seconds (0 to 5)
  enableFadeOut: boolean;
  fadeOutDuration: number; // in seconds (0 to 5)
  // Section 3: Timeline & Multi-Track Video Editor
  enableTimelineEditor?: boolean;
  timelineSegments?: TimelineSegment[];
  smartIntroCard?: SmartIntroCard;
  smartOutroCard?: SmartOutroCard;
  enableCanvasInteractiveMode?: boolean;
  selectedCanvasElement?: 'lyric' | 'waveform' | 'logo' | 'music_player' | 'intro_card' | null;
  elementRotations?: {
    logo?: number;
    waveform?: number;
    lyric?: number;
    musicPlayer?: number;
  };
  // Export Settings
  exportRatio: '9:16' | '16:9' | '1:1';
  exportQuality: 'ultra' | 'high' | 'medium' | 'low';
  exportFps: 30 | 60;
  exportCodec: 'auto' | 'mp4' | 'webm_vp8' | 'webm_vp9';
  exportEngine?: 'webcodecs' | 'realtime';
}

export type ExportEngine = 'webcodecs' | 'realtime';

export type SceneTransitionType = 
  | 'crossfade' 
  | 'zoom_in' 
  | 'wipe_left' 
  | 'wipe_right' 
  | 'glitch' 
  | 'blur_dissolve' 
  | 'none';

export interface TimelineSegment {
  id: string;
  name: string; // e.g. "Intro", "Verse 1", "Chorus", "Verse 2", "Outro"
  startTime: number; // in seconds
  endTime: number; // in seconds
  backgroundImageUrl: string;
  backgroundType: 'image' | 'video';
  transition: SceneTransitionType;
  transitionDuration: number; // in seconds (e.g. 0.8s)
}

export type IntroCardStyle = 
  | 'spotify_glass' 
  | 'apple_music_minimal' 
  | 'neon_billboard' 
  | 'retro_mixtape';

export interface SmartIntroCard {
  enabled: boolean;
  style: IntroCardStyle;
  startTime: number; // usually 0s
  duration: number; // in seconds (e.g. 4.5s)
  title: string;
  artist: string;
  composer?: string;
  coverBy?: string;
  albumOrTag?: string;
  coverUrl?: string | null;
  animation: 'slide_glass' | 'fade_scale' | 'curtain_wipe';
  x?: number; // 0 to 100
  y?: number; // 0 to 100
  scale?: number; // 0.5 to 2.0
}

export interface SmartOutroCard {
  enabled: boolean;
  duration: number; // in seconds before end (e.g. 5s)
  mainText: string;
  subText: string;
  socialHandle?: string;
  animation: 'fade_rise' | 'neon_pulse' | 'cinematic_letterbox';
}

export interface KaraokeTemplate {
  name: string;
  id: string;
  settings: Partial<KaraokeState>;
}

export enum ExportStatus {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  RECORDING = 'RECORDING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}
