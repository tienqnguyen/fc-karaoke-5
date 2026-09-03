
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KaraokeState, LrcLine, ExportStatus, ParticleType, WaveformStyle, AnimationType, KaraokeTemplate, BgAnimationType, LogoPosition, CustomTextLine, PostProcessingVfx } from './types';
import { parseLrc, isSrt, linesToLrcString, removeSectionLabels, addPrefixSuffixToLines } from './utils/lrcParser';
import { generateBackgroundImage } from './services/geminiService';
import VideoPreview, { preloadImage } from './components/VideoPreview';
import FontSelector from './components/FontSelector';
import AudioTimelineTrimmer from './components/AudioTimelineTrimmer';
import TimelineEditor from './components/TimelineEditor';
import { VISUALIZER_ENGINES } from './utils/visualizerEngines';
import { AI_VISUALIZER_PROMPT_TEMPLATE, CUSTOM_JS_PRESETS, cleanCustomJsCode } from './utils/customVisualizerPresets';
import { CommunityVisualizerGalleryModal } from './components/CommunityVisualizerGalleryModal';
import { 
  DEFAULT_BG_IMAGE, 
  CURATED_BACKGROUNDS, 
  getRandomBackgroundUrl, 
  getRandomPicsumUrl, 
  getRandomUnsplashUrl 
} from './utils/backgroundPresets';
import { 
  FontOption, 
  CURATED_VIETNAMESE_FONTS, 
  lazyLoadGoogleFont, 
  loadGoogleFontUrl, 
  extractFamiliesFromUrl 
} from './utils/fontLoader';
import { cropImageToCenterSquare, CropResult } from './utils/imageCropper';
import { exportWithWebCodecs, isWebCodecsSupported } from './services/webcodecsExporter';
import { PWAInstallButton } from './components/PWAInstallButton';

export const loadGoogleFont = lazyLoadGoogleFont;
export { loadGoogleFontUrl, extractFamiliesFromUrl };

const PARTICLE_OPTIONS: { name: string; value: ParticleType }[] = [
  { name: 'Tắt', value: 'none' },
  { name: 'Tuyết', value: 'snow' },
  { name: 'Mưa', value: 'rain' },
  { name: 'Sao', value: 'stars' },
  { name: 'Bokeh', value: 'bokeh' },
  { name: 'Sương', value: 'mist' },
  { name: 'Đom Đóm', value: 'fireflies' },
  { name: 'Bụi Sáng', value: 'ambient_dust' },
  { name: 'Tia Lửa', value: 'ambient_sparks' },
  { name: 'Kim Tuyến', value: 'glitter' },
  { name: 'Cánh Hoa', value: 'petals' },
  { name: 'Ma Trận', value: 'digital_matrix' },
  { name: 'Bong Bóng', value: 'rising_bubbles' },
  { name: 'Pha Lê Prism', value: 'prism_crystal' },
  { name: 'Tia Sét Arc', value: 'electric_arcs' },
  { name: 'Ký Tự Cổ', value: 'floating_runes' },
];

const ANIMATION_OPTIONS: { name: string; value: AnimationType; badge?: string }[] = [
  { name: 'Fade In/Out (Mặc Định Cũ - Cổ Điển)', value: 'fade' }, 
  { name: 'Elastic Pop (Nẩy 3D TikTok/Reels)', value: 'elastic_pop' },
  { name: 'Kinetic Bounce (Nhún Nhảy Nhịp Điệu)', value: 'kinetic_bounce' },
  { name: 'Karaoke Word Sweep (Quét Mượt Từng Chữ)', value: 'word_karaoke_sweep' },
  { name: 'Cinema Shimmer (Ánh Kim Điện Ảnh)', value: 'cinema_shimmer' },
  { name: 'RGB Pulse (Nhịp Xung Beat)', value: 'rgb_pulse' },
  { name: 'Flip 3D (Lật Chữ Không Gian 3D)', value: 'flip_3d' },
  { name: 'Wave Float (Lượn Sóng Bồng Bềnh)', value: 'wave_float' },
  { name: 'Typewriter (Gõ Chữ Máy Tính)', value: 'typewriter' },
  { name: 'RGB Glitch (Nhiễu Kỹ Thuật Số)', value: 'glitch' },
  { name: 'Neon Flicker (Chớp Đèn Neon)', value: 'neon_flicker' },
  { name: 'Slide Trượt Mượt Mà', value: 'slide' },
  { name: 'Scale Phóng To Nở Hoa', value: 'scale' }, 
  { name: 'Zoom Nhẹ Điện Ảnh', value: 'zoom' }, 
  { name: 'Blur Mờ Ảo Nghệ Thuật', value: 'blur' },
  { name: 'None (Tĩnh)', value: 'none' }, 
];

const BG_ANIM_OPTIONS: { name: string; value: BgAnimationType }[] = [
  { name: 'Static', value: 'none' }, 
  { name: 'Slow Zoom', value: 'zoom' }, 
  { name: 'Shift Pan', value: 'pan' },
  { name: '3D Tilt', value: '3d_parallax_tilt' },
  { name: 'Breathe', value: 'breathe' },
  { name: 'Sway', value: 'sway' },
  { name: 'Spin', value: 'spin' },
  { name: 'Float', value: 'float' }
];

const POST_PROCESSING_VFX_OPTIONS: { name: string; value: PostProcessingVfx; icon: string; desc: string; badge?: string }[] = [
  { name: 'Tắt VFX', value: 'none', icon: 'fa-ban', desc: 'Không áp dụng hậu kỳ' },
  { name: 'Chromatic Aberration', value: 'chromatic_aberration', icon: 'fa-eye', desc: 'Tách kênh màu RGB & quang sai theo Bass', badge: 'PRO' },
  { name: 'VHS Retro 90s', value: 'vhs_retro', icon: 'fa-tape', desc: 'Băng từ analog, scanlines & tracking glitch', badge: 'CINEMA' },
  { name: 'Film Grain 35mm', value: 'film_grain', icon: 'fa-film', desc: 'Màng phim điện ảnh Kodak 35mm & halation', badge: '4K' },
  { name: 'Anamorphic Lens Flare', value: 'anamorphic_lens_flare', icon: 'fa-sun', desc: 'Vệt tia sáng ống kính Hollywood & iris ghosts', badge: 'OPTIC' },
  { name: 'Neon Glow Bloom', value: 'neon_glow_bloom', icon: 'fa-wand-magic-sparkles', desc: 'Khuếch tán phát quang đa lớp Cyberpunk', badge: 'GLOW' },
  { name: 'Vignette Focus', value: 'vignette_focus', icon: 'fa-circle-dot', desc: 'Bo viền tối điện ảnh làm nổi bật ca sĩ & lời' },
  { name: 'Cyberpunk Glitch', value: 'glitch_cyberpunk', icon: 'fa-bolt', desc: 'Cắt lát ma trận số & grid neon theo nhịp', badge: 'BEAT' },
  { name: 'Vintage Light Leak', value: 'light_leak_vintage', icon: 'fa-sun-plant-wilt', desc: 'Vệt lọt sáng hoàng hôn ấm áp lãng mạn', badge: 'DREAM' },
  { name: 'Radial Zoom Blur', value: 'radial_zoom_blur', icon: 'fa-gauge-high', desc: 'Tăng tốc không gian warp theo cú nện Kick', badge: 'BASS' },
  { name: 'Retro CRT Arcade', value: 'scanline_crt', icon: 'fa-tv', desc: 'Màn hình máy game thùng CRT cổ điển', badge: 'RETRO' },
  { name: 'Golden Bokeh Dust', value: 'golden_bokeh', icon: 'fa-crown', desc: 'Đốm sáng Bokeh vàng kim & bụi hạt điện ảnh sang trọng', badge: 'LUXURY' },
];

const WAVEFORM_STYLES: { name: string; value: WaveformStyle }[] = [
  { name: 'Bars', value: 'bars' }, { name: 'Reflected', value: 'reflected' }, { name: 'Pulse', value: 'pulse' }, { name: 'Circles', value: 'circles' },
  { name: 'Liquid Gold', value: 'liquid_gold' }, { name: 'Stardust Orbit', value: 'stardust_orbit' }, 
  { name: 'Neon Perspective', value: 'neon_perspective' }, { name: 'Audio Ring', value: 'audio_ring' }, 
  { name: 'Cosmic Mandala', value: 'cosmic_mandala' }, { name: 'Aurora', value: 'aurora' }, 
  { name: 'Cyber Matrix', value: 'cyber_matrix' }, { name: 'DNA Helix', value: 'dna_helix' }, { name: 'Neon Lines', value: 'neon_lines' }
];

export const OPENROUTER_MODELS = [
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'nvidia/nemotron-3.5-lightning:free', tag: 'Fast' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'nvidia/nemotron-3-ultra-550b-a55b:free', tag: 'Ultra 550B' },
  { id: 'minimax/minimax-m3:free', name: 'minimax/minimax-m3:free', tag: 'Creative M3' },
  { id: 'openrouter/free', name: 'openrouter/free', tag: 'Auto Free' },
];

const DEFAULT_LRC = `[00:28.00] Gặp em trong chiều mưa bay lất phất,
[00:33.97] Nhìn nhau thôi… mà tim anh sao bối rối ……
[00:41.86] Tình đầu đến nhẹ như một cánh lá rơi,
[00:47.29] Chạm vào anh — rồi làm anh biết yêu … lần đầu...`;

const DEFAULT_CUSTOM_TEXT: CustomTextLine = {
  text: '',
  fontFamily: 'Inter',
  fontSize: 40,
  color: '#ffffff',
  x: 50,
  y: 80,
  opacity: 1.0,
  visible: false
};

const DEFAULT_WAVEFORM_SETTINGS = {
  showWaveform: true,
  waveformStyle: 'lofi_vibes' as WaveformStyle,
  waveformColor: '#ffffff',
  waveformOpacity: 0.3,
  waveformSize: 0.8,
  waveformPosition: 85,
  waveformX: 50,
  waveformWidth: 100,
  visualizerScale: 1.0,
  particleEffect: 'snow' as ParticleType,
};

const App: React.FC = () => {
  const [fontOptions, setFontOptions] = useState<FontOption[]>(CURATED_VIETNAMESE_FONTS);

  // Lazy load only the few initial active fonts without blocking site initialization
  useEffect(() => {
    lazyLoadGoogleFont('Playfair Display');
    lazyLoadGoogleFont('Satisfy');
    lazyLoadGoogleFont('Montserrat');
    lazyLoadGoogleFont('Inter');
  }, []);

  const handleAddCustomFont = (input: string) => {
    let cleanInput = input.trim();
    if (!cleanInput) return;
    
    if (cleanInput.startsWith('ttps://')) cleanInput = 'h' + cleanInput;

    if (cleanInput.includes('fonts.googleapis.com') || cleanInput.includes('fonts.google.com')) {
      loadGoogleFontUrl(cleanInput);
      const extracted = extractFamiliesFromUrl(cleanInput);
      if (extracted.length > 0) {
        const newOptions: FontOption[] = extracted.map(f => ({ 
          name: `${f} (Imported)`, 
          value: f,
          category: 'sans',
          categoryLabel: 'Font nhập tùy biến'
        }));
        setFontOptions(prev => {
          const filtered = newOptions.filter(no => !prev.some(p => p.value.toLowerCase() === no.value.toLowerCase()));
          return [...prev, ...filtered];
        });
        setState(s => ({ ...s, fontFamily: extracted[0] }));
        return;
      }
    }
    
    // Single font name or comma separated font names
    const names = cleanInput.split(',').map(n => n.trim()).filter(Boolean);
    names.forEach(name => {
      lazyLoadGoogleFont(name);
      setFontOptions(prev => {
        if (!prev.some(o => o.value.toLowerCase() === name.toLowerCase())) {
          return [...prev, { 
            name: `${name} (Custom)`, 
            value: name,
            category: 'sans',
            categoryLabel: 'Font tùy chỉnh'
          }];
        }
        return prev;
      });
    });
    if (names.length > 0) {
      setState(s => ({ ...s, fontFamily: names[0] }));
    }
  };

  const [state, setState] = useState<KaraokeState>({
    audioUrl: null, 
    lrcLines: parseLrc(DEFAULT_LRC), 
    backgroundImageUrl: DEFAULT_BG_IMAGE, 
    backgroundType: 'image',
    isPlaying: false, 
    currentTime: 0, 
    duration: 0,
    showLyrics: true,
    fontSize: 30, fontFamily: 'Playfair Display', textColor: '#ffffff', outlineColor: '#000000', outlineWidth: 2, 
    enableHighlight: false, karaokeHighlightColor: '#facc15', textShadowColor: 'rgba(0,0,0,0.8)', textShadowBlur: 12,
    overlayOpacity: 0.35, lyricPosition: 50, lyricX: 50,
    lyricAnimation: 'fade', animationSpeed: 1.2, lyricLinesCount: 1, lyricLeadTime: 0,
    letterSpacing: 0,
    textTransform: 'none',
    enableLyricBeatPulse: false,
    lyricBeatIntensity: 1.0,
    lyricLineSpacing: 1.8,
    inactiveLinesOpacity: 0.4,
    inactiveLinesBlur: 0,
    enableLyricBox: false,
    lyricBoxColor: 'rgba(0, 0, 0, 0.55)',
    enablePan: true, bgAnimationType: 'zoom', bgAnimationSpeed: 0.1, particleEffect: 'snow',
    postProcessingVfx: 'none', vfxIntensity: 0.2,
    showLogo: true, logoUrl: null, logoOpacity: 0.85, logoSize: 180, logoX: 85, logoY: 5,
    showWaveform: true, waveformStyle: 'lofi_vibes', waveformColor: '#ffffff', waveformOpacity: 0.3, waveformSize: 0.8, waveformPosition: 85, waveformX: 50, waveformWidth: 100, visualizerScale: 1.0,
    customVisualizerJs: CUSTOM_JS_PRESETS.find(p => p.id === 'lofi_vibes_widescreen')?.code || '',
    customTexts: [
      { ...DEFAULT_CUSTOM_TEXT, text: 'Custom Title', visible: true, y: 15, fontSize: 35, fontFamily: 'Satisfy' },
      { ...DEFAULT_CUSTOM_TEXT, text: 'KARAOKE STUDIO MASTER', visible: true, y: 8, fontSize: 20, opacity: 0.5, fontFamily: 'Montserrat' },
      { ...DEFAULT_CUSTOM_TEXT }
    ],
    zoomMin: 1.0, zoomMax: 1.18, sensitivity: 1.0, smoothness: 0.55, leadMs: 300, enableBeatZoom: false,
    beatZoomMode: 'sub_bass_pulse',
    beatZoomTarget: 'bg_only',
    beatZoomSpring: 0.65,
    enableBeatFlash: true,
    enableBeatShake: false,
    // Trim & Fade Export Settings
    enableTrim: false,
    trimStart: 0,
    trimEnd: 0,
    enableFadeIn: true,
    fadeInDuration: 1.5,
    enableFadeOut: true,
    fadeOutDuration: 2.0,
    exportRatio: '9:16', 
    exportQuality: 'high',
    exportFps: 30,
    exportCodec: 'auto',
    exportEngine: 'realtime',
    // Timeline & Multi-track Editor (Hidden by default for instant performance)
    enableTimelineEditor: false,
    enableCanvasInteractiveMode: false,
    timelineSegments: [],
    smartIntroCard: {
      enabled: false,
      style: 'spotify_glass',
      startTime: 0,
      duration: 4.5,
      title: 'TÊN BÀI HÁT',
      artist: 'Tên Ca Sĩ',
      composer: 'Nhạc Sĩ',
      coverBy: '',
      albumOrTag: 'OFFICIAL AUDIO MASTER',
      coverUrl: null,
      animation: 'slide_glass',
      x: 50,
      y: 20,
      scale: 1.0
    },
    smartOutroCard: {
      enabled: false,
      duration: 5.0,
      mainText: 'CẢM ƠN BẠN ĐÃ LẮNG NGHE!',
      subText: 'Đăng ký kênh & Bật chuông để không bỏ lỡ video mới',
      socialHandle: '@MusicChannel',
      animation: 'fade_rise'
    }
  });

  const [audioInputUrl, setAudioInputUrl] = useState(state.audioUrl || '');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aiTheme, setAiTheme] = useState('cinematic and atmospheric');
  const [aiTypography, setAiTypography] = useState('glowing gold or vibrant white');
  const [aiFontSize, setAiFontSize] = useState('largest focal point');
  const [promptProvider, setPromptProvider] = useState<'openrouter' | 'gemini'>('openrouter');
  const [openRouterModel, setOpenRouterModel] = useState<string>('nvidia/nemotron-3.5-lightning:free');
  const [openRouterKey, setOpenRouterKey] = useState<string>(() => localStorage.getItem('karaoke_openrouter_key') || '');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [promptFeedback, setPromptFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [pastedLyrics, setPastedLyrics] = useState(DEFAULT_LRC);
  const [lrcFileInfo, setLrcFileInfo] = useState<{
    fileName: string;
    lineCount: number;
    hasTimestamps: boolean;
    firstLine?: { time: number; text: string };
    lastLine?: { time: number; text: string };
    loadedAt: number;
  } | null>({
    fileName: 'Default_Song_Demo.lrc',
    lineCount: 4,
    hasTimestamps: true,
    firstLine: { time: 28, text: 'Gặp em trong chiều mưa bay lất phất,' },
    lastLine: { time: 47.29, text: 'Chạm vào anh — rồi làm anh biết yêu … lần đầu...' },
    loadedAt: Date.now()
  });
  const [showPrefixSuffixTool, setShowPrefixSuffixTool] = useState<boolean>(false);
  const [isVfxSectionExpanded, setIsVfxSectionExpanded] = useState<boolean>(true);
  const [isTypographyExpanded, setIsTypographyExpanded] = useState<boolean>(true);
  const [linePrefix, setLinePrefix] = useState<string>('♪ ');
  const [lineSuffix, setLineSuffix] = useState<string>(' ♪');
  const [skipEmptyLines, setSkipEmptyLines] = useState<boolean>(true);
  const [lyricsUndoStack, setLyricsUndoStack] = useState<string | null>(null);
  const [lyricsToolFeedback, setLyricsToolFeedback] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [lyricInputMode, setLyricInputMode] = useState<'upload' | 'paste'>('paste');
  const [exportStatus, setExportStatus] = useState<ExportStatus>(ExportStatus.IDLE);
  const [exportProgress, setExportProgress] = useState(0);
  const [templates, setTemplates] = useState<KaraokeTemplate[]>([]);
  const [isSavedPreset, setIsSavedPreset] = useState<boolean>(false);
  const [savedPresetName, setSavedPresetName] = useState<string>('');
  const [isCopiedPrompt, setIsCopiedPrompt] = useState<boolean>(false);
  const [isCopiedVisPrompt, setIsCopiedVisPrompt] = useState<boolean>(false);
  const [isCopiedVisCode, setIsCopiedVisCode] = useState<boolean>(false);
  const [isAutoFixedCode, setIsAutoFixedCode] = useState<boolean>(false);
  const [showVisPromptGuide, setShowVisPromptGuide] = useState<boolean>(true);
  const [activeVisPreset, setActiveVisPreset] = useState<string>('lofi_vibes_widescreen');
  const [isVisGalleryOpen, setIsVisGalleryOpen] = useState<boolean>(false);
  const [importedVisName, setImportedVisName] = useState<string | null>(null);
  const [isResetWaveform, setIsResetWaveform] = useState<boolean>(false);
  const [scrubHoverTime, setScrubHoverTime] = useState<number | null>(null);
  const [scrubHoverPos, setScrubHoverPos] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isPlayingTrimOnly, setIsPlayingTrimOnly] = useState<boolean>(false);
  const [isCroppingLogo, setIsCroppingLogo] = useState<boolean>(false);
  const [logoCropDetails, setLogoCropDetails] = useState<CropResult | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleProcessLogoFile = async (file: File) => {
    setIsCroppingLogo(true);
    try {
      const result = await cropImageToCenterSquare(file);
      setState(s => ({ ...s, logoUrl: result.url }));
      setLogoCropDetails(result);
    } catch (err) {
      console.warn("Logo crop to center square error:", err);
      setState(s => ({ ...s, logoUrl: URL.createObjectURL(file) }));
    } finally {
      setIsCroppingLogo(false);
    }
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Preload default and top curated backgrounds on mount, load saved presets
  useEffect(() => {
    preloadImage(DEFAULT_BG_IMAGE).catch(() => {});
    CURATED_BACKGROUNDS.slice(0, 8).forEach(preset => {
      preloadImage(preset.url).catch(() => {});
    });

    try {
      const saved = localStorage.getItem('karaoke_templates_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTemplates(parsed);
      }
    } catch (e) {
      console.warn("Could not load templates:", e);
    }
  }, []);

  useEffect(() => {
    if (state.audioUrl) setAudioInputUrl(state.audioUrl);
  }, [state.audioUrl]);

  const handleSaveOpenRouterKey = (key: string) => {
    setOpenRouterKey(key);
    localStorage.setItem('karaoke_openrouter_key', key);
  };

  const commitAudioUrl = () => {
    if (audioInputUrl && audioInputUrl !== state.audioUrl) {
      console.log("Committing new audio URL:", audioInputUrl);
      setAudioError(null);
      setState(s => ({ ...s, audioUrl: audioInputUrl, isPlaying: false, currentTime: 0, duration: 0 }));
    }
  };

  const handleRandomBackground = (source: 'unsplash' | 'picsum' | 'any' = 'any') => {
    const randomUrl = getRandomBackgroundUrl(source);
    preloadImage(randomUrl).catch(() => {});
    setState(s => ({ ...s, backgroundImageUrl: randomUrl, backgroundType: 'image' }));
  };

  const handleSelectPresetBg = (presetUrl: string) => {
    preloadImage(presetUrl).catch(() => {});
    const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(presetUrl) || presetUrl.includes('.mp4') || presetUrl.includes('.webm');
    const type = isVideo ? 'video' : 'image';
    setState(s => ({ ...s, backgroundImageUrl: presetUrl, backgroundType: type }));
  };

  const handleResetDefaultBg = () => {
    preloadImage(DEFAULT_BG_IMAGE).catch(() => {});
    setState(s => ({ ...s, backgroundImageUrl: DEFAULT_BG_IMAGE, backgroundType: 'image' }));
  };

  const handleGeneratePromptOnly = async () => {
    setIsGeneratingPrompt(true);
    setPromptFeedback(null);
    try {
      const title = state.customTexts.find(t => t.visible && t.text)?.text || "Song Title";
      const lyric = state.lrcLines.find(l => l.text.trim().length > 0)?.text || "";

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          lyric, 
          theme: aiTheme, 
          typography: aiTypography, 
          fontSize: aiFontSize,
          provider: promptProvider,
          model: openRouterModel,
          openRouterKey: openRouterKey || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptFeedback({
          type: 'success',
          message: `Prompt đã tạo với ${data.provider === 'openrouter' ? openRouterModel : 'Gemini'}`
        });
      }
    } catch (err: any) {
      console.error("Prompt generation failed:", err);
      setPromptFeedback({
        type: 'error',
        message: err.message || "Không thể tạo prompt. Vui lòng kiểm tra API Key."
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateAIBackground = async () => {
    setExportStatus(ExportStatus.GENERATING_IMAGE);
    setPromptFeedback(null);
    try {
      let finalPrompt = prompt;
      if (!finalPrompt || finalPrompt.trim().length < 10) {
        const title = state.customTexts.find(t => t.visible && t.text)?.text || "Song Title";
        const lyric = state.lrcLines.find(l => l.text.trim().length > 0)?.text || "";
        
        let generatedDynamicPrompt = null;
        try {
          // Fetch dynamically generated prompt from our Express backend
          const response = await fetch('/api/generate-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title, 
              lyric, 
              theme: aiTheme, 
              typography: aiTypography, 
              fontSize: aiFontSize,
              provider: promptProvider,
              model: openRouterModel,
              openRouterKey: openRouterKey || undefined
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            generatedDynamicPrompt = data.prompt;
          }
        } catch (genErr) {
          console.warn("Failed to generate dynamic prompt via AI backend", genErr);
        }
        
        if (generatedDynamicPrompt && generatedDynamicPrompt.length > 20) {
          finalPrompt = generatedDynamicPrompt;
        } else {
          // Fallback if AI generation fails
          finalPrompt = `A ${aiTheme} music poster background. Typography layout overlay: The song title "${title}" as the ${aiFontSize}, highly stylized artistic font, ${aiTypography}. ${lyric ? `Below it, the lyrics quote "${lyric}" in a clean, elegant, thin, semi-transparent font.` : ''} Place all text neatly in the empty negative space, ensuring it never blocks the main subject. NO RANDOM TEXT or fake production credits. --ar 16:9`;
        }
        setPrompt(finalPrompt);
      }
      
      const url = await generateBackgroundImage(finalPrompt);
      setState(s => ({ ...s, backgroundImageUrl: url, backgroundType: 'image' }));
    } catch (error: any) {
      console.error("AI Generation failed:", error);
    } finally {
      setExportStatus(ExportStatus.IDLE);
    }
  };

  const saveTemplate = () => {
    const defaultName = `Preset ${templates.length + 1} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    const name = window.prompt("Tên mẫu thiết kế (Preset Name):", defaultName);
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    const { audioUrl, lrcLines, backgroundImageUrl, logoUrl, isPlaying, currentTime, duration, ...settings } = state;
    const newTemplate: KaraokeTemplate = { id: Date.now().toString(), name: trimmedName, settings };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('karaoke_templates_v4', JSON.stringify(updated));
    setIsSavedPreset(true);
    setSavedPresetName(trimmedName);
    setTimeout(() => {
      setIsSavedPreset(false);
    }, 3000);
  };

  const loadTemplate = (template: KaraokeTemplate) => {
    setState(prev => ({
      ...prev,
      ...template.settings
    }));
    setIsSavedPreset(true);
    setSavedPresetName(`Đã nạp: ${template.name}`);
    setTimeout(() => {
      setIsSavedPreset(false);
    }, 2800);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioInputUrl(url);
      setAudioError(null);
      setState(prev => ({ ...prev, audioUrl: url, isPlaying: false, currentTime: 0, duration: 0 }));
    }
  };

  const handleLrcUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const isSrtInput = file.name.toLowerCase().endsWith('.srt') || isSrt(text);
        const parsed = parseLrc(text, state.duration);
        
        // 1. If user uploads an SRT file, convert it to clean standard [mm:ss.xx] LRC format in the textarea
        // for seamless viewing and inline editing, or if it was already LRC, preserve the text.
        const displayText = isSrtInput ? linesToLrcString(parsed) : text;
        setPastedLyrics(displayText);
        
        // 2. Load into state and ensure showLyrics is true
        setState(prev => ({ 
          ...prev, 
          lrcLines: parsed,
          showLyrics: true 
        }));
        
        // 3. Keep lyricInputMode as 'paste' so user can edit directly
        setLyricInputMode('paste');
        
        // 4. Update file info state for clear feedback
        const hasTimestamps = parsed.some(l => l.time > 0);
        setLrcFileInfo({
          fileName: file.name,
          lineCount: parsed.length,
          hasTimestamps,
          firstLine: parsed[0] ? { time: parsed[0].time, text: parsed[0].text } : undefined,
          lastLine: parsed[parsed.length - 1] ? { time: parsed[parsed.length - 1].time, text: parsed[parsed.length - 1].text } : undefined,
          loadedAt: Date.now()
        });

        // Reset file input value so re-selecting same file works
        e.target.value = '';
      } catch (err) {
        console.error("Lyrics (LRC/SRT) file read error:", err);
      }
    }
  };

  const handleLyricsTextChange = (text: string) => {
    setPastedLyrics(text);
    const parsed = parseLrc(text, state.duration);
    setState(s => ({ ...s, lrcLines: parsed }));
    
    if (text.trim().length === 0) {
      setLrcFileInfo(null);
    } else {
      const hasTimestamps = parsed.some(l => l.time > 0);
      const isSrtText = isSrt(text);
      setLrcFileInfo(prev => ({
        fileName: prev?.fileName || (isSrtText ? 'Phụ đề SRT tùy chỉnh' : 'Lời bài hát tùy chỉnh'),
        lineCount: parsed.length,
        hasTimestamps,
        firstLine: parsed[0] ? { time: parsed[0].time, text: parsed[0].text } : undefined,
        lastLine: parsed[parsed.length - 1] ? { time: parsed[parsed.length - 1].time, text: parsed[parsed.length - 1].text } : undefined,
        loadedAt: Date.now()
      }));
    }
  };

  const handleResetDemoLrc = () => {
    setPastedLyrics(DEFAULT_LRC);
    const parsed = parseLrc(DEFAULT_LRC, state.duration);
    setState(s => ({ ...s, lrcLines: parsed, showLyrics: true }));
    setLrcFileInfo({
      fileName: 'Default_Song_Demo.lrc',
      lineCount: 4,
      hasTimestamps: true,
      firstLine: { time: 28, text: 'Gặp em trong chiều mưa bay lất phất,' },
      lastLine: { time: 47.29, text: 'Chạm vào anh — rồi làm anh biết yêu … lần đầu...' },
      loadedAt: Date.now()
    });
  };

  const handleClearLyrics = () => {
    setPastedLyrics('');
    setState(s => ({ ...s, lrcLines: [] }));
    setLrcFileInfo(null);
  };

  const showLyricsFeedback = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setLyricsToolFeedback({ message, type });
    setTimeout(() => {
      setLyricsToolFeedback(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleRemoveSectionLabels = () => {
    if (!pastedLyrics.trim()) {
      showLyricsFeedback('Chưa có nội dung lời bài hát để xử lý!', 'warn');
      return;
    }

    const { text: newText, removedCount } = removeSectionLabels(pastedLyrics);
    if (removedCount === 0) {
      showLyricsFeedback('Không tìm thấy nhãn đoạn [Verse], [Chorus]... nào để xóa.', 'info');
      return;
    }

    setLyricsUndoStack(pastedLyrics);
    handleLyricsTextChange(newText);
    showLyricsFeedback(`Đã xóa sạch ${removedCount} nhãn đoạn ([Verse], [Chorus], [Bridge]...)!`, 'success');
  };

  const handleApplyPrefixSuffix = () => {
    if (!pastedLyrics.trim()) {
      showLyricsFeedback('Chưa có nội dung lời bài hát để xử lý!', 'warn');
      return;
    }
    if (!linePrefix && !lineSuffix) {
      showLyricsFeedback('Vui lòng nhập ký tự đầu dòng (Tiền tố) hoặc cuối dòng (Hậu tố)!', 'warn');
      return;
    }

    const { text: newText, modifiedCount } = addPrefixSuffixToLines(pastedLyrics, linePrefix, lineSuffix, skipEmptyLines);
    if (modifiedCount === 0) {
      showLyricsFeedback('Không có câu hát nào được thay đổi.', 'info');
      return;
    }

    setLyricsUndoStack(pastedLyrics);
    handleLyricsTextChange(newText);
    showLyricsFeedback(`Đã thêm ký tự vào ${modifiedCount} câu hát thành công!`, 'success');
  };

  const handleUndoLyricsEdit = () => {
    if (lyricsUndoStack !== null) {
      const prev = lyricsUndoStack;
      setLyricsUndoStack(null);
      handleLyricsTextChange(prev);
      showLyricsFeedback('Đã hoàn tác (Undo) lại nội dung lời trước đó.', 'info');
    }
  };

  const updateCustomText = (index: number, updates: Partial<CustomTextLine>) => {
    setState(s => {
      const next = [...s.customTexts];
      next[index] = { ...next[index], ...updates };
      return { ...s, customTexts: next };
    });
  };

  const handleResetWaveform = () => {
    setState(s => ({
      ...s,
      ...DEFAULT_WAVEFORM_SETTINGS
    }));
    setActiveVisPreset('');
    setIsResetWaveform(true);
    setTimeout(() => setIsResetWaveform(false), 2000);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    try {
      if (state.isPlaying) {
        audio.pause();
        setIsPlayingTrimOnly(false);
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        if (!audio.src || audio.src.endsWith('undefined') || audio.src === "") {
          setAudioError("Please provide a valid audio source first.");
          return;
        }
        setIsPlayingTrimOnly(false);
        await audio.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (err: any) { 
      console.error("Playback failed:", err); 
      setAudioError(`Playback Error: ${err.message || "The browser blocked playback. Try clicking 'Play' again or checking the URL."}`);
      setIsPlayingTrimOnly(false);
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const handleReplay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      setIsPlayingTrimOnly(false);
      audio.currentTime = 0;
      await audio.play();
      setState(prev => ({ ...prev, isPlaying: true, currentTime: 0 }));
    } catch (err: any) {
      console.error("Replay failed:", err);
    }
  };

  const handlePlayTrimRange = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (state.isPlaying && isPlayingTrimOnly) {
      audio.pause();
      setIsPlayingTrimOnly(false);
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      const start = state.enableTrim ? Math.max(0, state.trimStart) : 0;
      const end = (state.enableTrim && state.trimEnd > start) ? state.trimEnd : (state.duration || 9999);
      
      // If current time is already outside trim range or at the end, restart from start
      if (audio.currentTime < start || audio.currentTime >= end - 0.2) {
        audio.currentTime = start;
      }
      try {
        setIsPlayingTrimOnly(true);
        await audio.play();
        setState(prev => ({ ...prev, isPlaying: true, currentTime: audio.currentTime }));
      } catch (err: any) {
        console.error("Playback failed", err);
        setIsPlayingTrimOnly(false);
      }
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(time)) {
      const clampedTime = Math.max(0, Math.min(state.duration || 9999, time));
      audio.currentTime = clampedTime;
      setState(prev => ({ ...prev, currentTime: clampedTime }));
    }
  };

  const handleFastForward = (seconds: number) => {
    if (!state.duration) return;
    const newTime = Math.min(state.duration, Math.max(0, state.currentTime + seconds));
    handleSeek(newTime);
  };

  const handleTogglePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const calculateTimeFromScrubberEvent = (clientX: number) => {
    if (!progressBarRef.current || !state.duration) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = rect.width > 0 ? offsetX / rect.width : 0;
    return percentage * state.duration;
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.duration) return;
    setIsScrubbing(true);
    const targetTime = calculateTimeFromScrubberEvent(e.clientX);
    handleSeek(targetTime);
  };

  const handleScrubberTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!state.duration || !e.touches[0]) return;
    setIsScrubbing(true);
    const targetTime = calculateTimeFromScrubberEvent(e.touches[0].clientX);
    handleSeek(targetTime);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !state.duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = rect.width > 0 ? (offsetX / rect.width) * 100 : 0;
    const time = (percentage / 100) * state.duration;
    setScrubHoverPos(percentage);
    setScrubHoverTime(time);
  };

  const handleScrubberMouseLeave = () => {
    setScrubHoverTime(null);
  };

  // Global mouse & touch listeners for smooth continuous scrubbing
  useEffect(() => {
    if (!isScrubbing) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      const targetTime = calculateTimeFromScrubberEvent(e.clientX);
      handleSeek(targetTime);
    };

    const onGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const targetTime = calculateTimeFromScrubberEvent(e.touches[0].clientX);
        handleSeek(targetTime);
      }
    };

    const onGlobalMouseUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
    window.addEventListener('touchmove', onGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', onGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
      window.removeEventListener('touchmove', onGlobalTouchMove as any);
      window.removeEventListener('touchend', onGlobalMouseUp);
    };
  }, [isScrubbing, state.duration]);

  function getExportCodecConfig(
  preferredCodec: 'auto' | 'mp4' | 'webm_vp8' | 'webm_vp9' = 'auto',
  quality: 'ultra' | 'high' | 'medium' | 'low' = 'high',
  fps: number = 30
) {
  const mp4Types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=h264,aac',
    'video/mp4'
  ];
  const webmH264 = ['video/webm;codecs=h264,opus', 'video/webm;codecs=h264'];
  const webmVP8 = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8'];
  const webmVP9 = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9'];
  const webmFallback = ['video/webm'];

  let mimeType = 'video/webm';
  let extension = 'webm';
  let codecLabel = 'WebM (VP8/VP9)';

  if (typeof MediaRecorder !== 'undefined') {
    if (preferredCodec === 'mp4') {
      const found = mp4Types.find(t => MediaRecorder.isTypeSupported(t));
      if (found) {
        return { mimeType: found, extension: 'mp4', codecLabel: 'MP4 (H.264 Hardware)' };
      }
    } else if (preferredCodec === 'webm_vp8') {
      const found = webmVP8.find(t => MediaRecorder.isTypeSupported(t));
      if (found) {
        return { mimeType: found, extension: 'webm', codecLabel: 'WebM (VP8 Smooth)' };
      }
    } else if (preferredCodec === 'webm_vp9') {
      const found = webmVP9.find(t => MediaRecorder.isTypeSupported(t));
      if (found) {
        return { mimeType: found, extension: 'webm', codecLabel: 'WebM (VP9 High Def)' };
      }
    }

    // Auto Mode: Prioritize fast & hardware-accelerated H.264 MP4 -> WebM H.264 -> WebM VP8 (smoother & lighter than VP9) -> WebM VP9
    const autoCandidates = [
      ...mp4Types.map(m => ({ mime: m, ext: 'mp4', label: 'MP4 (H.264 Phần cứng)' })),
      ...webmH264.map(m => ({ mime: m, ext: 'webm', label: 'WebM (H.264 Phần cứng)' })),
      ...webmVP8.map(m => ({ mime: m, ext: 'webm', label: 'WebM (VP8 Siêu mượt)' })),
      ...webmVP9.map(m => ({ mime: m, ext: 'webm', label: 'WebM (VP9)' })),
      ...webmFallback.map(m => ({ mime: m, ext: 'webm', label: 'WebM Tiêu chuẩn' }))
    ];

    for (const c of autoCandidates) {
      if (MediaRecorder.isTypeSupported(c.mime)) {
        mimeType = c.mime;
        extension = c.ext;
        codecLabel = c.label;
        break;
      }
    }
  }

  // Consistent bitrates tailored for silky-smooth export without memory stalls
  let videoBitsPerSecond = 8000000;
  if (quality === 'ultra') videoBitsPerSecond = fps === 60 ? 14000000 : 12000000;
  else if (quality === 'high') videoBitsPerSecond = fps === 60 ? 9000000 : 7500000;
  else if (quality === 'medium') videoBitsPerSecond = 5000000;
  else if (quality === 'low') videoBitsPerSecond = 2500000;

  return { mimeType, extension, codecLabel, videoBitsPerSecond };
}

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastTimeUpdateMsRef = useRef<number>(0);

  const cancelExport = useCallback(() => {
    (window as any).__activeCanvasTrack = null;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {}
      abortControllerRef.current = null;
    }
    if (window.__mediaRecorder && window.__mediaRecorder.state === 'recording') {
      window.__mediaRecorder.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState(prev => ({ ...prev, isPlaying: false }));
    setExportStatus(ExportStatus.IDLE);
    setExportProgress(0);
  }, []);

  const [activeExportInfo, setActiveExportInfo] = useState<string>('');

  const handleExport = useCallback(async () => {
    if (!canvasRef.current || !audioRef.current || !state.audioUrl) return;
    
    const audio = audioRef.current;
    const safeDuration = audio.duration || 1000;
    const effectiveStart = state.enableTrim ? Math.max(0, state.trimStart) : 0;
    const effectiveEnd = (state.enableTrim && state.trimEnd > effectiveStart && state.trimEnd <= safeDuration)
      ? state.trimEnd
      : safeDuration;
    const totalExportDuration = Math.max(0.1, effectiveEnd - effectiveStart);
    const targetFps = state.exportFps || 30;

    // 1. FRAME-BY-FRAME WEBCODECS ENGINE (Zero Drop Frame, Ultra Fast)
    const useWebCodecs = (state.exportEngine !== 'realtime') && isWebCodecsSupported();
    if (useWebCodecs) {
      setExportStatus(ExportStatus.RECORDING);
      setExportProgress(0);
      setActiveExportInfo(`WebCodecs • ${targetFps} FPS • 0% drop frame`);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const width = state.exportRatio === '16:9' ? 1920 : (state.exportRatio === '1:1' ? 1080 : 1080);
        const height = state.exportRatio === '16:9' ? 1080 : (state.exportRatio === '1:1' ? 1080 : 1920);

        const renderFn = (t: number, f?: Uint8Array) => {
          if ((canvasRef.current as any)?.renderExactFrame) {
            (canvasRef.current as any).renderExactFrame(t, f);
          } else if ((window as any).__renderExactKaraokeFrame) {
            (window as any).__renderExactKaraokeFrame(t, f);
          }
        };

        const { blob, filename } = await exportWithWebCodecs({
          canvas: canvasRef.current,
          renderFrame: renderFn,
          audioUrl: state.audioUrl,
          fps: targetFps,
          width,
          height,
          startTime: effectiveStart,
          endTime: effectiveEnd,
          quality: state.exportQuality,
          codecPreference: state.exportCodec || 'auto',
          enableFadeIn: state.enableFadeIn,
          fadeInDuration: state.fadeInDuration,
          enableFadeOut: state.enableFadeOut,
          fadeOutDuration: state.fadeOutDuration,
          onProgress: (percent, currentFrame, totalFrames) => {
            setExportProgress(percent);
            if (percent >= 99) {
              setActiveExportInfo(`Đang đóng gói video... Vui lòng đợi thêm một chút...`);
            } else {
              setActiveExportInfo(`Frame ${currentFrame}/${totalFrames} • 0% rớt frame`);
            }
          },
          signal: abortController.signal
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 60000);

        setExportStatus(ExportStatus.FINISHED);
        return;
      } catch (err: any) {
        if (err?.message === 'Xuất video đã bị hủy' || err?.name === 'AbortError') {
          console.log("WebCodecs export canceled by user");
          setExportStatus(ExportStatus.IDLE);
          return;
        }
        console.warn("WebCodecs export failed, falling back to Realtime MediaRecorder:", err);
      } finally {
        abortControllerRef.current = null;
      }
    }

    // 2. REAL-TIME MEDIARECORDER FALLBACK / LEGACY ENGINE
    setExportStatus(ExportStatus.RECORDING);
    setExportProgress(0);

    const { mimeType, extension, codecLabel, videoBitsPerSecond } = getExportCodecConfig(state.exportCodec, state.exportQuality, targetFps);
    setActiveExportInfo(`${codecLabel} • ${targetFps} FPS • ${Math.round(videoBitsPerSecond / 1000000)} Mbps`);

    audio.currentTime = effectiveStart;
    audio.pause();
    setState(prev => ({ ...prev, isPlaying: true, currentTime: effectiveStart }));

    // Resume Web Audio Context if suspended
    if ((window as any).__audioCtx && (window as any).__audioCtx.state === 'suspended') {
      try {
        await (window as any).__audioCtx.resume();
      } catch (e) {
        console.warn("Could not resume AudioContext:", e);
      }
    }
    
    // Capture canvas stream at precise target FPS
    const canvasStream = (canvasRef.current as any).captureStream(targetFps);
    const videoTrack = canvasStream.getVideoTracks()[0];
    (window as any).__activeCanvasTrack = videoTrack;
    
    // Prioritize clean Web Audio Destination stream to avoid createMediaElementSource conflicts in Chrome
    let audioStream: MediaStream | null = (window as any).__karaokeAudioStream || null;
    if (!audioStream || audioStream.getAudioTracks().length === 0) {
      try {
        if ((audio as any).captureStream) {
          audioStream = (audio as any).captureStream();
        } else if ((audio as any).mozCaptureStream) {
          audioStream = (audio as any).mozCaptureStream();
        }
      } catch (e) {
        console.warn("Could not capture audio stream directly from element:", e);
      }
    }
    
    let finalStream: MediaStream;
    if (audioStream && audioStream.getAudioTracks().length > 0) {
      finalStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
    } else {
      finalStream = canvasStream;
    }

    let recorder: MediaRecorder;
    try {
      recorder = window.__mediaRecorder = new MediaRecorder(finalStream, { 
        mimeType, 
        videoBitsPerSecond 
      });
    } catch (recorderErr) {
      console.warn(`Failed to initialize MediaRecorder with ${mimeType}, falling back to default webm`, recorderErr);
      recorder = window.__mediaRecorder = new MediaRecorder(finalStream, {
        videoBitsPerSecond
      });
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { 
      if (e.data && e.data.size > 0) {
        chunks.push(e.data); 
      }
    };
    
    recorder.onstop = () => {
      (window as any).__activeCanvasTrack = null;
      audio.volume = 1.0;
      setState(prev => ({ ...prev, isPlaying: false }));
      const finalMime = recorder.mimeType || mimeType || 'video/webm';
      const blob = new Blob(chunks, { type: finalMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `karaoke_studio_${targetFps}fps_${Date.now()}.${extension}`; 
      a.click();
      setExportStatus(ExportStatus.FINISHED);
    };

    try {
      audio.currentTime = effectiveStart;
      await audio.play();
      
      // CRITICAL FIX FOR LONG VIDEO LAG:
      // Passing 1000ms timeslice pushes chunks periodically into memory array
      // preventing browser internal buffer overflow, frame drops, and GC freezing after 2+ minutes!
      recorder.start(1000);

      let lastReportedPercent = -1;
      const checkProgress = () => {
        if (recorder.state === 'recording') {
          const curTime = audio.currentTime;
          const progress = Math.min(100, Math.max(0, ((curTime - effectiveStart) / totalExportDuration) * 100));
          const roundedPercent = Math.floor(progress);
          if (roundedPercent !== lastReportedPercent) {
            lastReportedPercent = roundedPercent;
            setExportProgress(roundedPercent);
          }
          
          // Audio Fade In & Fade Out during export
          let vol = 1.0;
          if (state.enableFadeIn && state.fadeInDuration > 0) {
            const dt = curTime - effectiveStart;
            if (dt < state.fadeInDuration) {
              vol = Math.min(vol, Math.max(0, dt / state.fadeInDuration));
            }
          }
          if (state.enableFadeOut && state.fadeOutDuration > 0) {
            const dt = effectiveEnd - curTime;
            if (dt < state.fadeOutDuration) {
              vol = Math.min(vol, Math.max(0, dt / state.fadeOutDuration));
            }
          }
          audio.volume = Math.max(0, Math.min(1, vol));

          if (audio.ended || curTime >= effectiveEnd) {
            (window as any).__activeCanvasTrack = null;
            recorder.stop();
            audio.pause();
            audio.volume = 1.0;
            setState(prev => ({ ...prev, isPlaying: false }));
          } else {
            requestAnimationFrame(checkProgress);
          }
        }
      };
      checkProgress();
    } catch (e) {
      console.error("Export playback failed", e);
      (window as any).__activeCanvasTrack = null;
      audio.volume = 1.0;
      setState(prev => ({ ...prev, isPlaying: false }));
      setExportStatus(ExportStatus.IDLE);
    }
  }, [state]);

  // Handle audio lifecycle and events
  useEffect(() => {
    const audio = audioRef.current; 
    if (!audio) return;

    console.log("Setting up audio element for:", state.audioUrl);

    const onTimeUpdate = () => {
      const curTime = audio.currentTime;

      // If playing trimmed segment only, stop once reached trimEnd
      if (isPlayingTrimOnly && state.enableTrim) {
        const effectiveEnd = (state.trimEnd > state.trimStart) ? state.trimEnd : (audio.duration || 9999);
        if (curTime >= effectiveEnd) {
          audio.pause();
          audio.currentTime = state.trimStart;
          setIsPlayingTrimOnly(false);
          setState(prev => ({ ...prev, isPlaying: false, currentTime: state.trimStart }));
          return;
        }
      }

      // Smooth UI time throttling (~200ms) to prevent excessive React full-tree re-renders during playback
      // The VideoPreview 60 FPS canvas loop reads audio.currentTime continuously with zero latency
      const now = performance.now();
      if (now - lastTimeUpdateMsRef.current >= 200 || Math.abs(curTime - state.currentTime) > 1.5) {
        lastTimeUpdateMsRef.current = now;
        setState(prev => ({ ...prev, currentTime: curTime }));
      }
    };

    const onLoadedMetadata = () => {
      console.log("Audio metadata loaded successfully. Duration:", audio.duration);
      setAudioError(null);
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const onEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    const onError = () => {
      const err = audio.error;
      console.error("HTMLAudioElement Error:", err ? { code: err.code, message: err.message } : 'Unknown error');
      
      // If an external URL fails due to CORS / Media error code 4, attempt fallback through proxy
      if (state.audioUrl && state.audioUrl.startsWith('http') && !state.audioUrl.includes('/api/proxy-audio')) {
        const proxiedUrl = `/api/proxy-audio?url=${encodeURIComponent(state.audioUrl)}`;
        console.log("Attempting fallback to proxied audio stream:", proxiedUrl);
        setState(prev => ({ ...prev, audioUrl: proxiedUrl }));
        return;
      }

      let msg = "Lỗi nạp âm thanh. ";
      if (err) {
        switch (err.code) {
          case 1: msg += "Bị hủy bởi người dùng."; break;
          case 2: msg += "Lỗi kết nối mạng."; break;
          case 3: msg += "Giải mã thất bại (định dạng âm thanh không đúng)."; break;
          case 4: msg += "Không hỗ trợ định dạng hoặc server chặn truy cập trực tiếp. Bạn có thể tải file về và nhấn 'Upload MP3 Track'."; break;
          default: msg += "Đã xảy ra lỗi không xác định.";
        }
      } else {
        msg += "Hãy kiểm tra lại đường dẫn file MP3 trực tiếp hoặc upload file từ máy.";
      }
      setAudioError(msg);
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', onTimeUpdate); 
    audio.addEventListener('loadedmetadata', onLoadedMetadata); 
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // If source exists, try to load it
    if (audio.src && audio.src !== window.location.href) {
      audio.load();
    }

    return () => { 
      audio.removeEventListener('timeupdate', onTimeUpdate); 
      audio.removeEventListener('loadedmetadata', onLoadedMetadata); 
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [state.audioUrl, isPlayingTrimOnly, state.enableTrim, state.trimStart, state.trimEnd]);

  const isReady = !!state.audioUrl;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-2 sm:p-4 md:p-6 flex flex-col items-center select-none font-inter">
      <header className="w-full max-w-[1700px] mb-6 flex flex-col items-center">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            KARAOKE MASTER ENGINE
          </span>
          <a
            href="https://fc-player.onrender.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 hover:bg-indigo-900 transition-all text-[10px] font-bold text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.5)] hover:shadow-[0_0_20px_rgba(99,102,241,0.8)]"
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent pointer-events-none"></div>
            <i className="fa-solid fa-play animate-pulse text-indigo-400"></i>
            <span className="relative z-10 drop-shadow-[0_0_5px_rgba(165,180,252,0.8)]">FC PLAYER</span>
          </a>
          <PWAInstallButton />
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 text-center drop-shadow-sm flex items-center justify-center gap-3">
          <span>KARAOKE STUDIO</span>
          <span className="text-xs sm:text-sm md:text-base font-black px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 uppercase tracking-widest align-middle">
            V4 PRO
          </span>
        </h1>
        <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-center mt-3">
           <p className="text-slate-400 font-medium tracking-normal text-xs md:text-sm text-center flex items-center gap-2">
             <i className="fa-solid fa-sliders text-cyan-400 text-xs"></i>
             <span>Chỉnh sửa Lyric Video chuyên nghiệp &bull; Hiệu ứng Audio Waveform &bull; Xuất 60 FPS</span>
           </p>
           <div className="hidden md:block h-3.5 w-px bg-slate-800"></div>
           <div className="flex flex-wrap gap-2 items-center justify-center">
              <button 
                onClick={saveTemplate} 
                className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-md transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
                  isSavedPreset 
                    ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-300 shadow-emerald-500/20 shadow-md ring-1 ring-emerald-500 scale-105' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500'
                }`}
              >
                <i className={`fa-solid ${isSavedPreset ? 'fa-circle-check text-emerald-400 animate-pulse' : 'fa-bookmark text-amber-400'} text-xs`}></i>
                <span>{isSavedPreset ? `Đã lưu "${savedPresetName}"!` : 'Lưu mẫu thiết kế (Save Preset)'}</span>
              </button>

              {templates.length > 0 && (
                <div className="relative flex items-center">
                  <select
                    onChange={(e) => {
                      const selected = templates.find(t => t.id === e.target.value);
                      if (selected) loadTemplate(selected);
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="bg-slate-900 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-md px-2.5 py-1.5 text-[11px] font-semibold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all"
                  >
                    <option value="" disabled>📂 Tải mẫu đã lưu ({templates.length})...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id} className="bg-slate-950 text-slate-200">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
           </div>
        </div>
      </header>

      <main className="w-full max-w-[1700px] flex flex-col-reverse lg:grid lg:grid-cols-[1.65fr_1fr] xl:grid-cols-[1.85fr_1fr] gap-4 lg:gap-6 items-start">
        <div className="space-y-6 md:space-y-8 bg-slate-900/30 p-3 md:p-5 rounded-md border border-slate-800/60 shadow-3xl overflow-y-auto lg:max-h-[88vh] custom-scrollbar backdrop-blur-xl w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Core Assets</label>
              <div className="space-y-3">
                <input type="file" accept="audio/*, audio/mpeg, audio/mp3, audio/wav, audio/x-m4a, audio/aac, .mp3, .wav, .m4a, .aac, .ogg, .flac" onChange={handleAudioUpload} className="hidden" id="au-v4" />
                <label htmlFor="au-v4" className={`flex items-center justify-between p-4 rounded-md border-2 border-dashed cursor-pointer transition-all text-sm font-bold ${state.audioUrl && state.audioUrl.startsWith('blob:') ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-500'}`}>
                  <span>{state.audioUrl && state.audioUrl.startsWith('blob:') ? 'Custom Track Linked' : 'Upload MP3 Track'}</span> <i className="fa-solid fa-music"></i>
                </label>
                <div className="space-y-1">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Paste Direct Audio URL (.mp3)..." 
                      value={audioInputUrl} 
                      onChange={(e) => setAudioInputUrl(e.target.value)} 
                      onBlur={commitAudioUrl}
                      onKeyDown={(e) => e.key === 'Enter' && commitAudioUrl()}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-md p-3 pr-12 text-[10px] outline-none focus:ring-1 focus:ring-cyan-500/50" 
                    />
                    <button onClick={commitAudioUrl} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-400 transition-colors">
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                  {audioError && <p className="text-[9px] text-red-400 font-bold px-2 py-1 bg-red-950/30 rounded-md animate-pulse"><i className="fa-solid fa-circle-exclamation mr-1"></i> {audioError}</p>}
                </div>
                <div className="space-y-3">
                  {/* Action Buttons: Upload, Random, AI */}
                  <div className="grid grid-cols-3 gap-2">
                    <input type="file" accept="image/*,video/*" onChange={(e) => { 
                      const f = e.target.files?.[0]; 
                      if(f) {
                        const type = f.type.startsWith('video') ? 'video' : 'image';
                        setState(s => ({...s, backgroundImageUrl: URL.createObjectURL(f), backgroundType: type}));
                      } 
                    }} className="hidden" id="bg-v4" />
                    <label htmlFor="bg-v4" className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-800 border border-slate-700 rounded-md cursor-pointer text-[10px] font-black uppercase text-slate-300 hover:bg-slate-700 transition-all text-center">
                      <i className="fa-solid fa-cloud-arrow-up text-indigo-400"></i>
                      <span>Upload BG</span>
                    </label>

                    <button 
                      type="button" 
                      onClick={() => handleRandomBackground('any')} 
                      className="flex items-center justify-center gap-1.5 p-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 rounded-md text-[10px] font-black uppercase hover:from-amber-500/30 hover:to-orange-500/30 active:scale-95 transition-all shadow-md"
                      title="Load Random Unsplash / Picsum Background"
                    >
                      <i className="fa-solid fa-dice text-amber-400"></i>
                      <span>Random BG</span>
                    </button>

                    <button 
                      type="button"
                      onClick={handleGenerateAIBackground} 
                      className="flex items-center justify-center gap-1.5 p-2.5 bg-cyan-600 text-white rounded-md text-[10px] font-black uppercase hover:bg-cyan-500 shadow-lg active:scale-95 transition-all"
                    >
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span>AI Visuals</span>
                    </button>
                  </div>

                  {/* Random Sources Quick Select */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mr-1">Sources:</span>
                    <button 
                      type="button" 
                      onClick={() => handleRandomBackground('unsplash')} 
                      className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded text-[9px] font-bold flex items-center gap-1.5 transition-all"
                      title="Fetch random high-definition Unsplash wallpaper"
                    >
                      <i className="fa-solid fa-camera text-cyan-400"></i> Unsplash HD
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleRandomBackground('picsum')} 
                      className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-fuchsia-500/50 text-slate-300 hover:text-white rounded text-[9px] font-bold flex items-center gap-1.5 transition-all"
                      title="Fetch random Picsum 4K photo"
                    >
                      <i className="fa-solid fa-palette text-fuchsia-400"></i> Picsum 4K
                    </button>
                    <button 
                      type="button" 
                      onClick={handleResetDefaultBg} 
                      className="px-2.5 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-amber-300 rounded text-[9px] font-bold flex items-center gap-1 transition-all ml-auto"
                      title="Reset to default concert background"
                    >
                      <i className="fa-solid fa-rotate-left"></i> Default
                    </button>
                  </div>

                  {/* Curated Background Preset Chips */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <span>Curated HD Wallpapers</span>
                      <span className="text-[8px] lowercase text-slate-500 font-normal">Click to apply</span>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                      {CURATED_BACKGROUNDS.map(preset => {
                        const isActive = state.backgroundImageUrl === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPresetBg(preset.url)}
                            className={`px-2.5 py-1 rounded text-[9px] font-bold whitespace-nowrap border transition-all flex items-center gap-1 shrink-0 ${
                              isActive 
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm' 
                                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <span>{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Style Themes */}
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <select value={aiTheme} onChange={e => setAiTheme(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-md p-2 outline-none text-slate-300">
                      <option value="cinematic and atmospheric">Cinematic</option>
                      <option value="neon cyberpunk">Cyberpunk</option>
                      <option value="vintage retro">Vintage</option>
                      <option value="minimalist and clean">Minimalist</option>
                      <option value="anime style">Anime</option>
                    </select>
                    <select value={aiTypography} onChange={e => setAiTypography(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-md p-2 outline-none text-slate-300">
                      <option value="glowing gold or vibrant white">Glowing</option>
                      <option value="neon pink and blue">Neon</option>
                      <option value="clean modern sans-serif">Clean Sans</option>
                      <option value="elegant thin serif">Serif</option>
                    </select>
                    <select value={aiFontSize} onChange={e => setAiFontSize(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-md p-2 outline-none text-slate-300">
                      <option value="largest focal point">Large</option>
                      <option value="balanced and subdued">Balanced</option>
                      <option value="huge and bold">Huge</option>
                    </select>
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Paste Background Media URL (Unsplash, Pexels, Picsum, MP4)..." 
                      value={state.backgroundImageUrl && state.backgroundImageUrl.startsWith('http') ? state.backgroundImageUrl : ''} 
                      onChange={(e) => {
                        const url = e.target.value.trim();
                        const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(url) || url.includes('.mp4') || url.includes('.webm');
                        const type = isVideo ? 'video' : 'image';
                        setState(s => ({...s, backgroundImageUrl: url, backgroundType: type}));
                      }} 
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-md p-3 pr-12 text-[10px] outline-none focus:ring-1 focus:ring-cyan-500/50" 
                    />
                    {state.backgroundImageUrl && (
                      <button 
                        type="button" 
                        onClick={() => setState(s => ({...s, backgroundImageUrl: '', backgroundType: 'image'}))} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Clear background"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* OpenRouter & Gemini AI Prompt Engine Bar */}
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                          <i className="fa-solid fa-bolt text-xs text-amber-400"></i> AI Prompt Engine:
                        </span>
                        <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[9px] font-bold">
                          <button
                            type="button"
                            onClick={() => setPromptProvider('openrouter')}
                            className={`px-2 py-0.5 rounded transition-all ${promptProvider === 'openrouter' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            OpenRouter
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromptProvider('gemini')}
                            className={`px-2 py-0.5 rounded transition-all ${promptProvider === 'gemini' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            Gemini
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {promptProvider === 'openrouter' && (
                          <button
                            type="button"
                            onClick={() => setShowKeyModal(!showKeyModal)}
                            className={`px-2 py-1 rounded text-[9px] font-bold border transition-all flex items-center gap-1 ${
                              openRouterKey ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                            title="Cấu hình OpenRouter API Key"
                          >
                            <i className="fa-solid fa-key text-[8px]"></i>
                            <span>{openRouterKey ? 'Key Active' : 'Set Key'}</span>
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={handleGeneratePromptOnly}
                          disabled={isGeneratingPrompt}
                          className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-[9.5px] font-black rounded border border-indigo-400/40 shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
                        >
                          {isGeneratingPrompt ? (
                            <><i className="fa-solid fa-spinner fa-spin text-xs"></i> <span>Đang tạo prompt...</span></>
                          ) : (
                            <><i className="fa-solid fa-wand-magic-sparkles text-amber-300 text-xs"></i> <span>Tạo Prompt</span></>
                          )}
                        </button>
                      </div>
                    </div>

                    {promptProvider === 'openrouter' && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-slate-400 font-bold">OpenRouter Model:</span>
                          <span className="text-[8px] text-indigo-300 font-mono">Free Tier Models</span>
                        </div>
                        <select
                          value={openRouterModel}
                          onChange={e => setOpenRouterModel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[10px] font-mono text-cyan-300 outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="nvidia/nemotron-3.5-lightning:free">nvidia/nemotron-3.5-lightning:free</option>
                          <option value="nvidia/nemotron-3-ultra-550b-a55b:free">nvidia/nemotron-3-ultra-550b-a55b:free</option>
                          <option value="minimax/minimax-m3:free">minimax/minimax-m3:free</option>
                          <option value="openrouter/free">openrouter/free</option>
                        </select>

                        {showKeyModal && (
                          <div className="p-2 bg-slate-950 rounded border border-indigo-900/50 space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-300">
                              <span>OpenRouter API Key (sk-or-v1-...)</span>
                              <button onClick={() => setShowKeyModal(false)} className="text-slate-500 hover:text-slate-300"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                            <input
                              type="password"
                              placeholder="Paste OpenRouter API Key (sk-or-...)"
                              value={openRouterKey}
                              onChange={e => handleSaveOpenRouterKey(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-[10px] font-mono text-slate-200 outline-none focus:border-indigo-500"
                            />
                            <p className="text-[8px] text-slate-500">Key được lưu an toàn trong trình duyệt (localStorage). Hoặc cấu hình OPENROUTER_API_KEY trong file .env</p>
                          </div>
                        )}
                      </div>
                    )}

                    {promptFeedback && (
                      <p className={`text-[9px] font-bold px-2 py-1 rounded ${promptFeedback.type === 'error' ? 'bg-red-950/50 text-red-400 border border-red-800/40' : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'}`}>
                        <i className={`fa-solid ${promptFeedback.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} mr-1`}></i>
                        {promptFeedback.message}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <textarea 
                      placeholder="Visual style prompt (Tự động tạo với OpenRouter/Gemini hoặc nhập tùy chỉnh)..." 
                      value={prompt} 
                      onChange={(e) => setPrompt(e.target.value)} 
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-md p-3.5 pr-20 text-[11px] leading-relaxed outline-none focus:ring-1 focus:ring-cyan-500/50 min-h-[105px]" 
                    />
                    {prompt && (
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(prompt);
                          setIsCopiedPrompt(true);
                          setTimeout(() => setIsCopiedPrompt(false), 2500);
                        }} 
                        title={isCopiedPrompt ? "Đã copy vào clipboard!" : "Copy prompt to clipboard"}
                        className={`absolute right-2.5 top-2.5 px-2.5 py-1.5 rounded-md text-[10px] font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                          isCopiedPrompt 
                            ? 'bg-emerald-600 border border-emerald-400 text-white shadow-emerald-500/30 ring-1 ring-emerald-400 scale-105' 
                            : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <i className={`fa-solid ${isCopiedPrompt ? 'fa-check text-white' : 'fa-copy'}`}></i>
                        <span>{isCopiedPrompt ? 'Đã copy!' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 px-2 italic">
                    💡 Copy &amp; paste this prompt into ChatGPT, Gemini, Grok, or Midjourney to generate an image.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 flex flex-col h-full bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Lyrics Sync
                  </label>
                  {state.lrcLines.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Đã nạp {state.lrcLines.length} câu</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600 font-medium">(Chưa có lời)</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept=".lrc,.srt,.txt" 
                    onChange={handleLrcUpload} 
                    className="hidden" 
                    id="lrc-v4" 
                  />
                  <label 
                    htmlFor="lrc-v4" 
                    className="px-3 py-1.5 text-[10px] font-black rounded-md bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
                    title="Nạp file .LRC hoặc .SRT để đồng bộ lời và hiển thị trực tiếp vào ô soạn thảo"
                  >
                    <i className="fa-solid fa-file-arrow-up"></i>
                    <span>Tải file LRC / SRT</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleResetDemoLrc}
                    title="Nạp lại lời bài hát demo mẫu"
                    className="px-2.5 py-1.5 text-[10px] font-bold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60"
                  >
                    Mẫu demo
                  </button>

                  {pastedLyrics && (
                    <button 
                      type="button"
                      onClick={handleClearLyrics} 
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase px-1.5 py-1"
                      title="Xóa toàn bộ lời"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* State feedback banner informing user LRC / SRT is loaded & synced */}
              {lrcFileInfo && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-950/35 border border-emerald-500/30 text-emerald-300 shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <i className="fa-solid fa-circle-check text-emerald-400 text-sm flex-shrink-0"></i>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[11px] text-emerald-200">
                          ĐÃ NẠP {lrcFileInfo.fileName.toLowerCase().endsWith('.srt') ? 'SRT' : 'LRC'} VÀO VIDEO:
                        </span>
                        <span className="font-mono text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px] truncate max-w-[200px]" title={lrcFileInfo.fileName}>
                          {lrcFileInfo.fileName}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-400/80 font-medium truncate">
                        {lrcFileInfo.lineCount} câu hát &bull; {lrcFileInfo.hasTimestamps ? 'Có mốc thời gian tự động đồng bộ' : 'Tự động phân bổ đều'}
                      </p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ĐÃ ĐỒNG BỘ
                  </span>
                </div>
              )}

              {/* Quick lyrics processing toolbar */}
              <div id="lyrics-tools-toolbar" className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800/90 text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mr-0.5">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
                    <span className="hidden sm:inline">Công cụ lời:</span>
                  </span>

                  {/* Remove section labels button */}
                  <button
                    id="btn-remove-section-labels"
                    type="button"
                    onClick={handleRemoveSectionLabels}
                    className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-rose-950/40 text-slate-200 hover:text-rose-200 border border-slate-700/80 hover:border-rose-500/40 transition-all font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 text-[10px]"
                    title="Xóa các nhãn đoạn nhạc như [Verse 1], [Chorus], [Bridge], (Intro), (Outro)... giữ nguyên mốc thời gian"
                  >
                    <i className="fa-solid fa-eraser text-rose-400 text-[10px]"></i>
                    <span>Xóa [Verse], [Chorus]</span>
                  </button>

                  {/* Toggle Prefix/Suffix Tool button */}
                  <button
                    id="btn-toggle-prefix-suffix-tool"
                    type="button"
                    onClick={() => setShowPrefixSuffixTool(prev => !prev)}
                    className={`px-2.5 py-1 rounded border transition-all font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 text-[10px] ${
                      showPrefixSuffixTool
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/20'
                        : 'bg-slate-800/90 hover:bg-indigo-950/50 text-slate-200 hover:text-indigo-200 border-slate-700/80 hover:border-indigo-500/40'
                    }`}
                    title="Thêm ký tự hoặc ký hiệu (như ♪, ~, ngoặc kép) vào đầu dòng và cuối dòng của mỗi câu hát"
                  >
                    <i className="fa-solid fa-quote-left text-amber-400 text-[10px]"></i>
                    <span>Thêm ký tự đầu/cuối</span>
                    <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-200 ${showPrefixSuffixTool ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Undo button if available */}
                  {lyricsUndoStack !== null && (
                    <button
                      id="btn-undo-lyrics"
                      type="button"
                      onClick={handleUndoLyricsEdit}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/40 transition-all font-semibold flex items-center gap-1 text-[10px] active:scale-95"
                      title="Hoàn tác lại nội dung lời bài hát trước khi chỉnh sửa"
                    >
                      <i className="fa-solid fa-rotate-left"></i>
                      <span>Hoàn tác</span>
                    </button>
                  )}
                </div>

                {/* Feedback message banner if present */}
                {lyricsToolFeedback && (
                  <div id="lyrics-feedback-badge" className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1.5 transition-all ${
                    lyricsToolFeedback.type === 'success' 
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                      : lyricsToolFeedback.type === 'warn'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    <i className={`fa-solid ${
                      lyricsToolFeedback.type === 'success' ? 'fa-circle-check text-emerald-400' :
                      lyricsToolFeedback.type === 'warn' ? 'fa-triangle-exclamation text-amber-400' :
                      'fa-circle-info text-indigo-400'
                    } text-[10px]`}></i>
                    <span>{lyricsToolFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Collapsible Prefix / Suffix Panel */}
              {showPrefixSuffixTool && (
                <div id="prefix-suffix-panel" className="p-3 bg-slate-950/85 rounded-lg border border-indigo-500/40 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-pen-fancy text-amber-400"></i>
                      <span>Chèn Ký Tự Vào Đầu Dòng (Tiền Tố) &amp; Cuối Dòng (Hậu Tố)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPrefixSuffixTool(false)}
                      className="text-slate-400 hover:text-white text-xs px-1"
                      title="Đóng công cụ"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    💡 Tự động giữ nguyên mốc thời gian <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">[00:12.34]</code> của file LRC/SRT, chỉ chèn ký tự vào nội dung câu hát.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Prefix Input & Quick Buttons */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-300">
                          Ký tự đầu dòng (Tiền tố):
                        </label>
                        {linePrefix && (
                          <button 
                            type="button" 
                            onClick={() => setLinePrefix('')} 
                            className="text-[9px] text-slate-400 hover:text-rose-300"
                          >
                            Xóa trống
                          </button>
                        )}
                      </div>
                      <input
                        id="input-lyrics-prefix"
                        type="text"
                        value={linePrefix}
                        onChange={(e) => setLinePrefix(e.target.value)}
                        placeholder='Ví dụ: ♪ hoặc ~ hoặc "'
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-[9px] text-slate-500">Mẫu:</span>
                        {[
                          { label: '♪ ', val: '♪ ' },
                          { label: '~ ', val: '~ ' },
                          { label: '"', val: '"' },
                          { label: '- ', val: '- ' },
                          { label: '★ ', val: '★ ' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setLinePrefix(item.val)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/60 transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Suffix Input & Quick Buttons */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-300">
                          Ký tự cuối dòng (Hậu tố):
                        </label>
                        {lineSuffix && (
                          <button 
                            type="button" 
                            onClick={() => setLineSuffix('')} 
                            className="text-[9px] text-slate-400 hover:text-rose-300"
                          >
                            Xóa trống
                          </button>
                        )}
                      </div>
                      <input
                        id="input-lyrics-suffix"
                        type="text"
                        value={lineSuffix}
                        onChange={(e) => setLineSuffix(e.target.value)}
                        placeholder='Ví dụ: ♪ hoặc ~ hoặc ... hoặc "'
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-[9px] text-slate-500">Mẫu:</span>
                        {[
                          { label: ' ♪', val: ' ♪' },
                          { label: ' ~', val: ' ~' },
                          { label: '"', val: '"' },
                          { label: '...', val: '...' },
                          { label: ' ★', val: ' ★' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setLineSuffix(item.val)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/60 transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400 hover:text-slate-200 select-none">
                      <input
                        id="chk-skip-empty-lyrics"
                        type="checkbox"
                        checked={skipEmptyLines}
                        onChange={(e) => setSkipEmptyLines(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span>Bỏ qua dòng trống</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        id="btn-apply-prefix-suffix"
                        type="button"
                        onClick={handleApplyPrefixSuffix}
                        className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-[10px] transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-500/30"
                      >
                        <i className="fa-solid fa-check"></i>
                        <span>Áp dụng vào tất cả câu hát</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <textarea 
                id="lyric-sync-textarea"
                placeholder="Dán hoặc tải file .LRC / .SRT tại đây...&#10;Hỗ trợ cả 2 định dạng:&#10;• LRC: [00:12.34] Lời câu hát...&#10;• SRT: 00:00:12,340 --> 00:00:15,670 Lời câu hát...&#10;Bạn có thể chỉnh sửa thời gian và lời trực tiếp, Video Canvas sẽ cập nhật ngay!"
                value={pastedLyrics} 
                onChange={(e) => handleLyricsTextChange(e.target.value)} 
                className="w-full flex-1 min-h-[175px] bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg p-3.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y font-mono leading-relaxed transition-all shadow-inner custom-scrollbar"
                spellCheck={false}
              />

              <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-pen-to-square text-indigo-400"></i>
                  <span>Có thể chỉnh sửa mốc thời gian &amp; câu chữ trực tiếp trong ô trên</span>
                </span>
                <span className="font-mono text-slate-400 font-bold">
                  {state.lrcLines.length} câu hát đang đồng bộ
                </span>
              </div>
            </section>
          </div>
          
          <div className="bg-indigo-950/20 rounded-md border border-indigo-500/20 p-4 text-[11px] text-slate-400 leading-relaxed shadow-lg flex gap-3 items-start">
            <i className="fa-solid fa-lightbulb text-indigo-400 mt-0.5 text-lg"></i>
            <div>
              <p className="font-bold text-slate-300 mb-1 uppercase tracking-wider text-[10px]">Pro Tip: High-Quality Backgrounds</p>
              <p>Direct links from stock sites are often blocked. For the best experience, <strong className="text-slate-300">download the file to your device</strong> and upload it using the <strong className="text-slate-300">Photo / Video BG</strong> button.</p>
              <div className="mt-2 flex flex-wrap gap-4 font-bold text-[10px]">
                <a href="https://unsplash.com/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors"><i className="fa-solid fa-camera mr-1"></i>Unsplash (Free Photos)</a>
                <a href="https://www.pexels.com/search/videos/loop/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors"><i className="fa-solid fa-video mr-1"></i>Pexels (Loop Videos)</a>
                <a href="https://pixabay.com/videos/search/looping/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors"><i className="fa-solid fa-film mr-1"></i>Pixabay (Loop Videos)</a>
              </div>
            </div>
          </div>

          <section className="bg-slate-950/40 p-4 md:p-5 rounded-md border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-fuchsia-400 flex items-center gap-2">
                <i className="fa-solid fa-pen-nib"></i> Custom Annotations
              </label>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Add titles, artist credits, or watermarks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.customTexts.map((ct, idx) => (
                <div key={idx} className="space-y-4 p-4 md:p-5 bg-slate-900/70 hover:bg-slate-900/90 transition-all rounded-md border border-slate-800 shadow-lg flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></span>
                        Text Line {idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {idx === 1 && (
                          <button
                            type="button"
                            onClick={() => updateCustomText(1, { y: 8 })}
                            className="px-2 py-0.5 text-[8px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1"
                            title="Đặt lại vị trí Y về mặc định 8%"
                          >
                            <i className="fa-solid fa-rotate-left text-[7px] text-fuchsia-400"></i>
                            <span>Y: 8%</span>
                          </button>
                        )}
                        <button onClick={() => updateCustomText(idx, { visible: !ct.visible })} className={`px-2.5 py-1 text-[8px] font-black rounded transition-all ${ct.visible ? 'bg-fuchsia-600 text-white shadow-md' : 'bg-slate-800 text-slate-500 hover:text-slate-400'}`}>
                          {ct.visible ? 'VISIBLE' : 'HIDDEN'}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder={`Text line ${idx + 1}...`} value={ct.text} onChange={e => updateCustomText(idx, { text: e.target.value, visible: true })} className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-md p-2.5 text-xs text-slate-200 outline-none focus:border-fuchsia-500 transition-colors" />
                      <button
                        title="Style (Normal, Bold, Italic, Underline...)"
                        onClick={() => {
                          const styles = [
                            { isBold: false, isItalic: false, isUnderline: false },
                            { isBold: true, isItalic: false, isUnderline: false },
                            { isBold: false, isItalic: true, isUnderline: false },
                            { isBold: false, isItalic: false, isUnderline: true },
                            { isBold: true, isItalic: true, isUnderline: false },
                            { isBold: true, isItalic: false, isUnderline: true },
                            { isBold: false, isItalic: true, isUnderline: true },
                            { isBold: true, isItalic: true, isUnderline: true }
                          ];
                          const curIndex = styles.findIndex(s => !!s.isBold === !!ct.isBold && !!s.isItalic === !!ct.isItalic && !!s.isUnderline === !!ct.isUnderline);
                          const nextStyle = styles[(Math.max(0, curIndex) + 1) % styles.length];
                          updateCustomText(idx, { isBold: nextStyle.isBold, isItalic: nextStyle.isItalic, isUnderline: nextStyle.isUnderline });
                        }}
                        className="shrink-0 h-[38px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-colors text-[13px] flex items-center justify-center font-serif w-[40px] mt-[1px]"
                      >
                        {(() => {
                           if (ct.isBold && ct.isItalic && ct.isUnderline) return <span className="font-bold italic underline">A</span>;
                           if (ct.isBold && ct.isItalic) return <span className="font-bold italic">A</span>;
                           if (ct.isBold && ct.isUnderline) return <span className="font-bold underline">A</span>;
                           if (ct.isItalic && ct.isUnderline) return <span className="italic underline">A</span>;
                           if (ct.isBold) return <span className="font-bold">A</span>;
                           if (ct.isItalic) return <span className="italic">A</span>;
                           if (ct.isUnderline) return <span className="underline">A</span>;
                           return <span>A</span>;
                        })()}
                      </button>
                    </div>
                    <div className="grid grid-cols-[1fr_42px] gap-2">
                      <FontSelector 
                        value={ct.fontFamily} 
                        onChange={val => updateCustomText(idx, { fontFamily: val })} 
                        options={fontOptions} 
                        onAddCustom={handleAddCustomFont} 
                        align={idx === 2 ? 'right' : 'auto'}
                      />
                      <input type="color" value={ct.color} onChange={e => updateCustomText(idx, { color: e.target.value })} title="Text Color" className="w-full h-full min-h-[38px] bg-transparent p-1 border border-slate-800 rounded-md cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase"><span>Size</span><span>{ct.fontSize}px</span></div>
                      <input type="range" min="10" max="150" value={ct.fontSize} onChange={e => updateCustomText(idx, { fontSize: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase"><span>Horizontal Pos (X)</span><span>{ct.x}%</span></div>
                      <input type="range" min="0" max="100" value={ct.x} onChange={e => updateCustomText(idx, { x: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase"><span>Vertical Pos (Y)</span><span>{ct.y}%</span></div>
                      <input type="range" min="0" max="100" value={ct.y} onChange={e => updateCustomText(idx, { y: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="waveform-studio" className="bg-indigo-950/30 p-4 rounded-md border border-indigo-900/40 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                  <i className="fa-solid fa-bolt-lightning text-indigo-400"></i> Waveform Master Studio
                </label>
                <span className="hidden sm:inline-block text-[9px] font-bold text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                  Specterr &amp; Renderforest Engines
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetWaveform}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                    isResetWaveform
                      ? 'bg-emerald-600 border-emerald-400 text-white ring-1 ring-emerald-300 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                  }`}
                  title="Khôi phục toàn bộ thông số Waveform về mặc định ban đầu"
                >
                  <i className={`fa-solid ${isResetWaveform ? 'fa-check text-white' : 'fa-rotate-left text-indigo-400'} text-xs`}></i>
                  <span>{isResetWaveform ? 'ĐÃ VỀ DEFAULT!' : 'RESET VỀ DEFAULT'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVisGalleryOpen(true)}
                  className="text-[10px] font-black px-3.5 py-1.5 rounded-md border border-cyan-400/50 bg-gradient-to-r from-cyan-600/30 via-indigo-600/30 to-fuchsia-600/30 hover:from-cyan-600/50 hover:to-fuchsia-600/50 text-cyan-200 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95"
                  title="Mở Thư Viện Visualizer Firebase để xem, chia sẻ và tải thêm hiệu ứng"
                >
                  <i className="fa-solid fa-cloud-arrow-down text-cyan-400 text-xs"></i>
                  <span>THƯ VIỆN CLOUD FIREBASE</span>
                </button>
                <button onClick={() => setState(s => ({ ...s, showWaveform: !s.showWaveform }))} className={`text-[10px] font-black px-5 py-1.5 rounded-full border transition-all ${state.showWaveform ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {state.showWaveform ? 'WAVEFORM ACTIVE' : 'WAVEFORM HIDDEN'}
                </button>
              </div>
            </div>
            
            {/* Visualizer Engines Grid - 3 Columns */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-sliders text-indigo-400"></i> Visualizer Engine (3 Columns)
                </span>
                <span className="text-[9px] text-slate-500 font-semibold">{VISUALIZER_ENGINES.length} Premium Engines</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {VISUALIZER_ENGINES.map(o => {
                  const isSelected = state.waveformStyle === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => setState(s => ({ ...s, waveformStyle: o.value, showWaveform: true }))}
                      className={`relative p-3 rounded-lg border text-left transition-all group flex flex-col justify-between overflow-hidden ${
                        isSelected 
                          ? 'bg-gradient-to-br from-indigo-900/90 via-indigo-950 to-slate-900 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400' 
                          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 w-full mb-1.5">
                        <div className="flex items-center gap-2">
                          <i className={`fa-solid ${o.icon} text-xs ${isSelected ? 'text-indigo-300' : 'text-slate-500 group-hover:text-indigo-400'}`}></i>
                          <span className={`text-[11px] font-bold tracking-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {o.name}
                          </span>
                        </div>
                        {o.badge && (
                          <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0 ${
                            isSelected 
                              ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40' 
                              : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                          }`}>
                            {o.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[8.5px] leading-tight line-clamp-2 ${isSelected ? 'text-indigo-200/90' : 'text-slate-500'}`}>
                        {o.desc}
                      </p>
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-400 rounded-bl-sm"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visualizer Tuning Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-indigo-900/30">
               <div className="space-y-4">
                 {/* Waveform Color Studio */}
                 <div className="space-y-2.5 p-3 bg-slate-900/80 border border-slate-800/90 rounded-lg">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                       <i className="fa-solid fa-palette text-indigo-400"></i>
                       <span>Waveform Color (Màu Visualizer)</span>
                     </span>
                     <div className="flex items-center gap-1.5">
                       <span className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: state.waveformColor || '#38bdf8' }} />
                       <span className="text-[9px] font-mono font-bold text-slate-400">{state.waveformColor}</span>
                     </div>
                   </div>

                   {/* Quick Color Presets */}
                   <div className="flex flex-wrap gap-1.5 pt-0.5">
                     {[
                       { name: 'Trắng', color: '#ffffff' },
                       { name: 'Cyan Neon', color: '#38bdf8' },
                       { name: 'Tím Neon', color: '#a855f7' },
                       { name: 'Hồng Hot', color: '#f43f5e' },
                       { name: 'Vàng Kim', color: '#f59e0b' },
                       { name: 'Xanh Lá', color: '#10b981' },
                       { name: 'Indigo', color: '#6366f1' },
                       { name: 'San Hô', color: '#fb7185' },
                       { name: 'Laser Lime', color: '#84cc16' },
                       { name: 'Aqua Băng', color: '#06b6d4' },
                       { name: 'Vàng Tươi', color: '#facc15' },
                       { name: 'Đỏ Lửa', color: '#ef4444' }
                     ].map((c) => (
                       <button
                         key={c.color}
                         type="button"
                         title={c.name}
                         onClick={() => setState(s => ({ ...s, waveformColor: c.color }))}
                         className={`w-6 h-6 rounded-md border transition-all duration-150 relative flex items-center justify-center ${
                           (state.waveformColor || '').toLowerCase() === c.color.toLowerCase()
                             ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.6)] ring-1 ring-white/50 z-10'
                             : 'border-slate-700/80 hover:scale-105 hover:border-slate-500'
                         }`}
                         style={{ backgroundColor: c.color }}
                       >
                         {(state.waveformColor || '').toLowerCase() === c.color.toLowerCase() && (
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shadow-sm" />
                         )}
                       </button>
                     ))}
                   </div>

                   {/* Dual Picker: Native Swatch + Any Color String/Code Input */}
                   <div className="grid grid-cols-5 gap-2 pt-1">
                     <div className="col-span-2 relative">
                       <input 
                         type="color" 
                         value={state.waveformColor && state.waveformColor.startsWith('#') && state.waveformColor.length === 7 ? state.waveformColor : '#38bdf8'} 
                         onChange={(e) => setState(s => ({ ...s, waveformColor: e.target.value }))} 
                         className="w-full h-8 bg-slate-950 p-0.5 border border-slate-700 rounded-md cursor-pointer appearance-none" 
                         title="Chọn màu bằng bảng màu"
                       />
                     </div>
                     <div className="col-span-3">
                       <input 
                         type="text" 
                         value={state.waveformColor} 
                         placeholder="HEX, RGB, HSL, hoặc tên màu (vd: cyan, #ff007f)"
                         onChange={(e) => setState(s => ({ ...s, waveformColor: e.target.value }))} 
                         className="w-full h-8 bg-slate-950 px-2 text-[10px] font-mono text-slate-200 border border-slate-700 rounded-md focus:border-indigo-500 focus:outline-none" 
                         title="Nhập bất kỳ mã màu nào (HEX, RGB, HSL, named color)"
                       />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                     <span>Waveform Opacity (Độ mờ)</span>
                     <span>{Math.round(state.waveformOpacity * 100)}%</span>
                   </div>
                   <input type="range" min="0" max="1" step="0.05" value={state.waveformOpacity} onChange={(e) => setState(s => ({ ...s, waveformOpacity: parseFloat(e.target.value) }))} className="w-full h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" />
                 </div>
                 
                 <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Vertical Pos (Y)</span><span>{state.waveformPosition}%</span></div>
                    <input type="range" min="0" max="100" value={state.waveformPosition} onChange={(e) => setState(s => ({ ...s, waveformPosition: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" />
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Horizontal Pos (X)</span><span>{state.waveformX}%</span></div>
                    <input type="range" min="0" max="100" value={state.waveformX} onChange={(e) => setState(s => ({ ...s, waveformX: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" />
                 </div>
               </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Visual Width (Độ rộng / Scale)</span>
                      <span className={state.waveformWidth > 100 ? 'text-indigo-300 font-bold' : ''}>{state.waveformWidth}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      step="1"
                      value={state.waveformWidth} 
                      onChange={(e) => setState(s => ({ ...s, waveformWidth: parseInt(e.target.value) }))} 
                      className="w-full h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" 
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-medium px-0.5">
                      <span>10%</span>
                      <span>50%</span>
                      <span className="text-indigo-400/80 font-bold">100% (Chuẩn)</span>
                      <span className="text-indigo-400 font-bold">120%</span>
                      <span>150%</span>
                      <span>200%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Amplitude Scale</span><span>{state.waveformSize.toFixed(1)}x</span></div>
                    <input type="range" min="0.5" max="4.0" step="0.1" value={state.waveformSize} onChange={(e) => setState(s => ({ ...s, waveformSize: parseFloat(e.target.value) }))} className="w-full h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Global Scale</span><span>{state.visualizerScale.toFixed(2)}x</span></div>
                    <input type="range" min="0.1" max="4.0" step="0.05" value={state.visualizerScale} onChange={(e) => setState(s => ({ ...s, visualizerScale: parseFloat(e.target.value) }))} className="w-full h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" />
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Ambient Atmosphere</span>
                    <div className="flex flex-wrap gap-1.5">
                       {PARTICLE_OPTIONS.map(o => <button key={o.value} onClick={() => setState(s => ({ ...s, particleEffect: o.value }))} className={`px-3 py-1.5 text-[9px] font-black rounded-md border transition-all ${state.particleEffect === o.value ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>{o.name}</button>)}
                    </div>
                  </div>
               </div>
            </div>

            {/* Quick Reset & Status Footer Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/40 text-[9.5px]">
              <div className="flex items-center gap-2 text-slate-400">
                <i className="fa-solid fa-sliders text-indigo-400"></i>
                <span>Waveform hiện tại: <strong className="text-indigo-200 uppercase">{VISUALIZER_ENGINES.find(e => e.value === state.waveformStyle)?.name || state.waveformStyle}</strong> (Vị trí: {state.waveformX}%, {state.waveformPosition}% &bull; Scale: {state.waveformWidth}%)</span>
              </div>
              <button
                type="button"
                onClick={handleResetWaveform}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all font-bold flex items-center gap-1.5 active:scale-95"
                title="Khôi phục màu sắc, kích thước, vị trí và hiệu ứng Waveform về mặc định"
              >
                <i className="fa-solid fa-rotate-left text-indigo-400 text-[10px]"></i>
                <span>Đặt lại thông số mặc định (Default)</span>
              </button>
            </div>

            {/* Visualizer Center Logo / Cover Art Card (Renderforest Parallax Waves, Vinyl, Trap Bass Ring) */}
            <div className="pt-3 border-t border-indigo-900/30">
               <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 p-3.5 rounded-lg border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                     <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-900 border-2 border-indigo-400/80 shrink-0 shadow-md shadow-indigo-500/30 flex items-center justify-center group ring-2 ring-indigo-500/20">
                        {isCroppingLogo ? (
                           <div className="flex flex-col items-center justify-center gap-1">
                              <i className="fa-solid fa-circle-notch fa-spin text-indigo-400 text-lg"></i>
                              <span className="text-[7px] font-black text-indigo-300 uppercase">Crop 1:1</span>
                           </div>
                        ) : state.logoUrl ? (
                           <div className={`w-full h-full relative rounded-full overflow-hidden flex items-center justify-center ${state.isPlaying ? 'animate-[spin_16s_linear_infinite]' : ''}`}>
                              <img src={state.logoUrl} alt="Logo Visualizer" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"></div>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center">
                              <i className="fa-solid fa-compact-disc text-indigo-400 text-xl"></i>
                              <span className="text-[6.5px] font-black text-indigo-300/80 mt-0.5">1:1 ROUND</span>
                           </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-full pointer-events-none"></div>
                     </div>
                     <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                           <span className="text-[11px] font-black text-white tracking-wide">Logo / Cover Art Trung Tâm Visualizer</span>
                           <span className="text-[8px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.5 rounded">Tâm Đĩa 3D</span>
                           <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <i className="fa-solid fa-crop-simple text-[8.5px]"></i> Auto-Crop 1:1 Tâm
                           </span>
                           <span className="text-[8px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <i className="fa-solid fa-circle-check text-[8.5px]"></i> Chuẩn Tròn (Round Logo)
                           </span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-snug">
                           {logoCropDetails ? (
                              <span>
                                 Đã cắt vuông tâm 1:1 từ ảnh gốc <strong className="text-indigo-300">{logoCropDetails.originalWidth}x{logoCropDetails.originalHeight}</strong> (tỷ lệ {logoCropDetails.aspectRatio}) → <strong className="text-emerald-300 font-mono">{logoCropDetails.croppedSize}x{logoCropDetails.croppedSize}px</strong> chuẩn đĩa tròn không bị méo/dẹt.
                              </span>
                           ) : (
                              <span>
                                 Hỗ trợ ảnh chữ nhật (6:9, 9:6, 16:9, 4:3...). Hệ thống tự động crop vuông tâm 1:1 để lồng vào tâm Parallax Waves 3D, Vinyl Disc, Trap Bass Ring chuẩn tròn tuyệt đối.
                              </span>
                           )}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                     <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => { 
                           const f = e.target.files?.[0]; 
                           if (f) handleProcessLogoFile(f); 
                           e.target.value = '';
                        }} 
                        className="hidden" 
                        id="vis-logo-upload" 
                     />
                     <label 
                        htmlFor="vis-logo-upload" 
                        className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-md text-white text-[10.5px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                           isCroppingLogo 
                              ? 'bg-indigo-800 pointer-events-none opacity-80' 
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                        }`}
                     >
                        {isCroppingLogo ? (
                           <>
                              <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                              <span>Đang Cắt Vuông 1:1...</span>
                           </>
                        ) : (
                           <>
                              <i className="fa-solid fa-crop-simple text-xs"></i>
                              <span>{state.logoUrl ? 'Đổi Logo (Tự Cắt 1:1)' : 'Tải Logo (Tự Cắt 1:1)'}</span>
                           </>
                        )}
                     </label>

                     {state.logoUrl && (
                        <button
                           onClick={() => {
                              setState(s => ({ ...s, logoUrl: null }));
                              setLogoCropDetails(null);
                           }}
                           className="px-2.5 py-2 rounded-md bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 border border-slate-700 text-slate-400 text-[10.5px] transition-all"
                           title="Xóa logo, dùng biểu tượng mặc định"
                        >
                           <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Custom JS Visualizer Editor */}
            {state.waveformStyle === 'custom_js' && (
              <div className="pt-4 border-t border-indigo-900/30 space-y-4">
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                      <i className="fa-solid fa-code text-xs"></i>
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase text-indigo-300 tracking-wider">Custom JS Visualizer Engine</span>
                      <span className="ml-2 text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded">Live Realtime</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsVisGalleryOpen(true)}
                      className="px-3 py-1.5 rounded bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white text-[10px] font-black transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 border border-cyan-400/40 active:scale-95"
                      title="Mở Thư Viện Visualizer Firebase để tải thêm hàng chục hiệu ứng cực đẹp từ cộng đồng"
                    >
                      <i className="fa-solid fa-fire text-amber-300 text-xs"></i>
                      <span>THƯ VIỆN CLOUD (NHẬP CODE)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsVisGalleryOpen(true)}
                      className="px-2.5 py-1.5 rounded bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-pink-600/30 active:scale-95"
                      title="Chia sẻ mã visualizer hiện tại của bạn lên cơ sở dữ liệu Firebase"
                    >
                      <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                      <span>CHIA SẺ LÊN FIREBASE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (state.customVisualizerJs) {
                          const cleaned = cleanCustomJsCode(state.customVisualizerJs);
                          setState(s => ({ ...s, customVisualizerJs: cleaned }));
                          setIsAutoFixedCode(true);
                          setTimeout(() => setIsAutoFixedCode(false), 2500);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-700/30 border border-emerald-500/40 active:scale-95"
                      title="Tự động lọc bỏ markdown (```), dấu backticks lỗi, gỡ wrapper hàm và sửa lỗi để code chạy 100%"
                    >
                      <i className={`fa-solid ${isAutoFixedCode ? 'fa-check text-emerald-300' : 'fa-wand-magic-sparkles'} text-xs`}></i>
                      <span>{isAutoFixedCode ? 'ĐÃ CLEAN & SỬA XONG!' : 'TỰ ĐỘNG SỬA LỖI & CLEAN'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(AI_VISUALIZER_PROMPT_TEMPLATE);
                        setIsCopiedVisPrompt(true);
                        setTimeout(() => setIsCopiedVisPrompt(false), 2500);
                      }}
                      className="px-2.5 py-1.5 rounded bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 active:scale-95"
                      title="Sao chép toàn bộ Prompt chuẩn cho ChatGPT / Gemini"
                    >
                      <i className={`fa-solid ${isCopiedVisPrompt ? 'fa-check text-emerald-300' : 'fa-copy'} text-xs`}></i>
                      <span>{isCopiedVisPrompt ? 'ĐÃ COPY PROMPT AI!' : 'COPY PROMPT AI'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (state.customVisualizerJs) {
                          navigator.clipboard.writeText(state.customVisualizerJs);
                          setIsCopiedVisCode(true);
                          setTimeout(() => setIsCopiedVisCode(false), 2000);
                        }
                      }}
                      className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold transition-all flex items-center gap-1"
                      title="Sao chép mã code hiện tại"
                    >
                      <i className={`fa-solid ${isCopiedVisCode ? 'fa-check text-emerald-400' : 'fa-copy'} text-xs`}></i>
                      <span>{isCopiedVisCode ? 'Đã Copy' : 'Copy Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultPreset = CUSTOM_JS_PRESETS[0];
                        if (defaultPreset) {
                          setState(s => ({ ...s, customVisualizerJs: defaultPreset.code, waveformStyle: 'custom_js', showWaveform: true }));
                          setActiveVisPreset(defaultPreset.id);
                        }
                      }}
                      className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-[10px] transition-all flex items-center gap-1"
                      title="Khôi phục mã mẫu mặc định"
                    >
                      <i className="fa-solid fa-rotate-left text-xs"></i>
                      <span>Mặc định</span>
                    </button>
                  </div>
                </div>

                {/* AI Prompt Guide & Strict Rules Box */}
                <div className="bg-slate-950/80 rounded-lg border border-indigo-500/30 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        <i className="fa-solid fa-book-bookmark text-indigo-400"></i>
                        Hướng dẫn tạo Waveform bằng ChatGPT / Gemini
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVisPromptGuide(g => !g)}
                      className="text-[9.5px] font-bold text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <span>{showVisPromptGuide ? 'Thu gọn' : 'Xem chi tiết'}</span>
                      <i className={`fa-solid ${showVisPromptGuide ? 'fa-chevron-up' : 'fa-chevron-down'} text-[9px]`}></i>
                    </button>
                  </div>

                  {showVisPromptGuide && (
                    <div className="space-y-3 pt-2 border-t border-indigo-900/40 text-[9.5px] text-slate-300">
                      {/* Available Variables & Environment */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-slate-900/90 p-2 rounded border border-indigo-500/20">
                          <code className="text-cyan-300 font-mono font-bold block text-[10px]">ctx</code>
                          <span className="text-slate-400 text-[8.5px]">CanvasRenderingContext2D</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-indigo-500/20">
                          <code className="text-cyan-300 font-mono font-bold block text-[10px]">canvas</code>
                          <span className="text-slate-400 text-[8.5px]">canvas.width & height</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-indigo-500/20">
                          <code className="text-cyan-300 font-mono font-bold block text-[10px]">dataArray</code>
                          <span className="text-slate-400 text-[8.5px]">Uint8Array (0-255 FFT)</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-indigo-500/20">
                          <code className="text-cyan-300 font-mono font-bold block text-[10px]">time</code>
                          <span className="text-slate-400 text-[8.5px]">Timestamp âm thanh (s)</span>
                        </div>
                      </div>

                      {/* Strict Rules Summary */}
                      <div className="bg-indigo-950/40 p-2.5 rounded border border-indigo-500/20 space-y-1.5">
                        <div className="font-bold text-indigo-300 text-[10px] flex items-center gap-1.5">
                          <i className="fa-solid fa-triangle-exclamation text-amber-400"></i>
                          3 Quy Tắc Bắt Buộc Khi Nhờ AI Viết Code:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[9px] leading-relaxed">
                          <li><strong>Chỉ lấy mã trong Function Body:</strong> Không nhận markdown <code className="text-indigo-200">```javascript</code>, không bọc thẻ html hay function wrapper.</li>
                          <li><strong>Không gọi vòng lặp thời gian:</strong> Hệ thống tự render 60 FPS; không dùng <code className="text-rose-300">requestAnimationFrame</code> hay <code className="text-rose-300">setInterval</code>.</li>
                          <li><strong>Tự động scale:</strong> Vẽ theo tỉ lệ <code className="text-cyan-300">canvas.width</code> và <code className="text-cyan-300">canvas.height</code> để vừa vặn cả khung dọc 9:16 và ngang 16:9.</li>
                        </ul>
                      </div>

                      {/* AI Prompt Snippet */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-bold text-slate-400">Nội dung Prompt chuẩn (Copy & dán vào ChatGPT / Gemini / Claude):</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(AI_VISUALIZER_PROMPT_TEMPLATE);
                              setIsCopiedVisPrompt(true);
                              setTimeout(() => setIsCopiedVisPrompt(false), 2500);
                            }}
                            className="text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1 text-[9px]"
                          >
                            <i className="fa-solid fa-copy"></i>
                            <span>{isCopiedVisPrompt ? 'Đã chép!' : 'Chép nội dung'}</span>
                          </button>
                        </div>
                        <pre className="p-2.5 rounded bg-slate-900 text-slate-300 font-mono text-[8.5px] max-h-24 overflow-y-auto whitespace-pre-wrap border border-slate-800 leading-relaxed select-all">
                          {AI_VISUALIZER_PROMPT_TEMPLATE}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pre-made Curated Templates Selector (1-Click Apply) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-shapes text-indigo-400"></i>
                      Thư Viện Mẫu Có Sẵn (Click để nạp mã tức thì)
                    </span>
                    <span className="text-[9px] text-slate-500">{CUSTOM_JS_PRESETS.length} Phong cách có sẵn</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {CUSTOM_JS_PRESETS.map((preset) => {
                      const isActive = activeVisPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setState(s => ({ ...s, customVisualizerJs: preset.code, waveformStyle: 'custom_js', showWaveform: true }));
                            setActiveVisPreset(preset.id);
                          }}
                          className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden group ${
                            isActive 
                              ? 'bg-indigo-950/80 border-cyan-400 text-white shadow-md shadow-indigo-600/30 ring-1 ring-cyan-400/50' 
                              : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 text-slate-300 hover:border-indigo-500/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <i className={`fa-solid ${preset.icon} text-xs ${isActive ? 'text-cyan-300' : 'text-indigo-400 group-hover:text-indigo-300'}`}></i>
                            <span className="text-[9.5px] font-bold truncate">{preset.name}</span>
                          </div>
                          <p className="text-[8.5px] text-slate-400 line-clamp-2 leading-tight">
                            {preset.description}
                          </p>
                          {isActive && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Imported from Cloud Banner */}
                {importedVisName && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border border-cyan-500/50 flex items-center justify-between text-xs text-cyan-200 shadow-md shadow-cyan-950/50 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                        <i className="fa-solid fa-cloud-arrow-down text-xs"></i>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Đã nạp từ Thư Viện Firebase Cloud:</span>
                        <span className="text-xs font-black text-white">{importedVisName}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImportedVisName(null)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-all"
                      title="Đóng thông báo"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}

                {/* The Code Editor Box */}
                <div className="bg-slate-950 p-3 rounded-lg border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-terminal text-cyan-400"></i>
                      Trình Soạn Thảo JavaScript (Tự động biên dịch Realtime)
                    </span>
                    <span className="text-slate-500 font-mono text-[9px]">
                      {state.customVisualizerJs ? `${state.customVisualizerJs.split('\n').length} lines` : '0 lines'}
                    </span>
                  </div>

                  <textarea 
                    value={state.customVisualizerJs || ''} 
                    onChange={(e) => {
                      setState(s => ({ ...s, customVisualizerJs: e.target.value }));
                      setActiveVisPreset('');
                    }}
                    placeholder="// Dán mã visualizer javascript vào đây..."
                    className="w-full h-64 bg-slate-900 text-cyan-300 font-mono text-[10px] leading-relaxed p-3.5 border border-slate-700/90 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all selection:bg-indigo-600 selection:text-white"
                    spellCheck="false"
                  />

                  <div className="flex items-center justify-between text-[8.5px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <i className="fa-solid fa-circle-check text-emerald-400 text-[8px]"></i>
                      Hỗ trợ Canvas 2D API, Linear/Radial Gradients, Shadows, Path 2D, RoundRect.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setState(s => ({ ...s, customVisualizerJs: '' }));
                        setActiveVisPreset('');
                      }}
                      className="text-rose-400 hover:text-rose-300 font-bold transition-colors"
                    >
                      Xóa trắng code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-slate-950/40 p-4 rounded-md border border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Branding Overlay</label>
                 <button
                   type="button"
                   onClick={() => setState(s => ({ ...s, showLogo: s.showLogo === false ? true : false }))}
                   className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                     state.showLogo !== false 
                       ? 'bg-fuchsia-600/30 border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-600/40' 
                       : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                   }`}
                 >
                   <i className={`fa-solid ${state.showLogo !== false ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                   <span>{state.showLogo !== false ? 'SHOW LOGO' : 'HIDE LOGO'}</span>
                 </button>
               </div>
               <div className="space-y-3">
                 <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) handleProcessLogoFile(f); e.target.value = ''; }} className="hidden" id="logo-v4" />
                 <label htmlFor="logo-v4" className={`flex items-center justify-between p-3 rounded-md border border-slate-700 cursor-pointer transition-all text-xs font-bold bg-slate-800 hover:bg-slate-700 ${state.logoUrl && !state.logoUrl.includes('./') && !state.logoUrl.startsWith('http') ? 'border-fuchsia-500 text-fuchsia-400' : 'text-slate-400'}`}>
                    <span>{state.logoUrl && !state.logoUrl.includes('./') && !state.logoUrl.startsWith('http') ? 'Custom Logo Linked' : 'Channel Logo Upload'}</span> <i className="fa-solid fa-upload"></i>
                 </label>
                 <input type="text" placeholder="Paste Logo URL..." value={state.logoUrl && state.logoUrl.startsWith('http') ? state.logoUrl : ''} onChange={(e) => setState(s => ({...s, logoUrl: e.target.value}))} className="w-full bg-slate-950/40 border border-slate-800 rounded-md p-3 text-[10px] outline-none focus:ring-1 focus:ring-fuchsia-500/50" />
               </div>
               
               {state.logoUrl && (
                 <div className="space-y-4 mt-4 pt-4 border-t border-slate-800">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-600 uppercase">Logo Size</span>
                       <input type="range" min="50" max="500" value={state.logoSize} onChange={(e) => setState(s => ({ ...s, logoSize: parseInt(e.target.value) }))} className="w-full h-8 bg-slate-900 rounded-md accent-fuchsia-500" />
                     </div>
                     <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-600 uppercase">Logo Opacity</span>
                       <input type="range" min="0" max="1" step="0.1" value={state.logoOpacity} onChange={(e) => setState(s => ({ ...s, logoOpacity: parseFloat(e.target.value) }))} className="w-full h-8 bg-slate-900 rounded-md accent-fuchsia-500" />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-600 uppercase">Pos X ({state.logoX}%)</span>
                        <input type="range" min="0" max="100" value={state.logoX} onChange={(e) => setState(s => ({ ...s, logoX: parseInt(e.target.value) }))} className="w-full h-1 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-600 uppercase">Pos Y ({state.logoY}%)</span>
                        <input type="range" min="0" max="100" value={state.logoY} onChange={(e) => setState(s => ({ ...s, logoY: parseInt(e.target.value) }))} className="w-full h-1 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                     </div>
                   </div>
                 </div>
               )}
             </div>

             <div className="space-y-4">
               <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Cinematic Motion</label>
               <div className="grid grid-cols-4 gap-2">
                 {BG_ANIM_OPTIONS.map(o => (
                   <button key={o.value} onClick={() => setState(s => ({ ...s, bgAnimationType: o.value }))} className={`py-2 px-1 text-[10px] font-black rounded-md border transition-all ${state.bgAnimationType === o.value ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{o.name}</button>
                 ))}
               </div>
               <div className="space-y-1 pt-2">
                 <div className="flex justify-between text-[10px] text-slate-600 font-black uppercase"><span>Motion Power</span><span>{state.bgAnimationSpeed.toFixed(1)}x</span></div>
                 <input type="range" min="0.05" max="2" step="0.05" value={state.bgAnimationSpeed} onChange={(e) => setState(s => ({ ...s, bgAnimationSpeed: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" />
               </div>
             </div>
          </section>

            {/* SPECTRA PRO BEAT ZOOM ENGINE */}
            <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950/20 p-4 md:p-5 rounded-md border border-fuchsia-500/30 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 text-xs">
                    <i className="fa-solid fa-bolt-lightning"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-black uppercase tracking-[0.25em] text-fuchsia-400">Zoom Theo Nhịp (SPECTRA Pro)</label>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">ENGINE V2</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 mt-0.5">Thuật toán bắt nhịp Kick Transient & Vật lý lò xo Spring Damping siêu mượt</p>
                  </div>
                </div>
                <button 
                  id="btn-toggle-beat-zoom"
                  onClick={() => setState(s => ({ ...s, enableBeatZoom: !s.enableBeatZoom }))} 
                  className={`text-[10px] font-black px-4 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${state.enableBeatZoom ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-600/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${state.enableBeatZoom ? 'bg-white animate-pulse' : 'bg-slate-500'}`}></span>
                  {state.enableBeatZoom ? 'ĐANG BẬT SPECTRA' : 'KÍCH HOẠT'}
                </button>
              </div>

              {state.enableBeatZoom && (
                <div className="space-y-5 pt-2 border-t border-slate-800/80">
                  {/* SPECTRA MODES */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kiểu Nảy Nhịp (SPECTRA Mode)</span>
                      <span className="text-[9px] text-fuchsia-400/90 font-medium">5 Phong cách chuyên nghiệp</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {[
                        { id: 'spectra_punch', name: 'SPECTRA Punch', desc: 'Nảy đập đàn hồi chuẩn visualizer', icon: 'fa-drum' },
                        { id: 'sub_bass_pulse', name: 'Sub-Bass Pulse', desc: 'Nhịp thở êm dịu, mềm mại', icon: 'fa-wave-square' },
                        { id: 'drop_impact', name: 'EDM Impact', desc: 'Cú nảy uy lực & rung chấn drop', icon: 'fa-fire' },
                        { id: 'rotational_kick', name: '3D Angle Kick', desc: 'Zoom kết hợp xoay góc 3D sống động', icon: 'fa-arrows-rotate' },
                        { id: 'inverted_dip', name: 'Trap Suction', desc: 'Hút ngược & bật nảy cực gắt', icon: 'fa-compress' },
                      ].map(mode => {
                        const active = (state.beatZoomMode || 'sub_bass_pulse') === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setState(s => ({ ...s, beatZoomMode: mode.id as any }))}
                            className={`p-2.5 rounded-md border text-left transition-all relative overflow-hidden flex flex-col justify-between ${active ? 'bg-fuchsia-950/60 border-fuchsia-400 text-white shadow-md shadow-fuchsia-900/30' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <i className={`fa-solid ${mode.icon} ${active ? 'text-fuchsia-400' : 'text-slate-500'} text-xs`}></i>
                              {active && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>}
                            </div>
                            <div>
                              <div className={`text-[10.5px] font-bold leading-tight ${active ? 'text-white' : 'text-slate-300'}`}>{mode.name}</div>
                              <div className="text-[8.5px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{mode.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PHẠM VI TÁC ĐỘNG & HIỆU ỨNG ĐI KÈM */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-900/50 rounded-md border border-slate-800/80">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Phạm Vi Tác Động</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setState(s => ({ ...s, beatZoomTarget: 'bg_only' }))}
                          className={`flex-1 py-1.5 px-2.5 rounded text-[9.5px] font-bold border transition-all ${state.beatZoomTarget === 'bg_only' ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                        >
                          Chỉ Zoom Nền (Giữ Chữ Cố Định)
                        </button>
                        <button
                          onClick={() => setState(s => ({ ...s, beatZoomTarget: 'all' }))}
                          className={`flex-1 py-1.5 px-2.5 rounded text-[9.5px] font-bold border transition-all ${state.beatZoomTarget === 'all' ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                        >
                          Toàn Khung Hình (Cinematic)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hiệu Ứng Bổ Trợ</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setState(s => ({ ...s, enableBeatFlash: !s.enableBeatFlash }))}
                          className={`flex-1 py-1.5 px-2 rounded text-[9.5px] font-bold border transition-all flex items-center justify-center gap-1.5 ${state.enableBeatFlash ? 'bg-purple-600/30 border-purple-400 text-purple-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}
                        >
                          <i className="fa-solid fa-sun text-[10px]"></i>
                          <span>Lóe Hào Quang Nhịp</span>
                        </button>
                        <button
                          onClick={() => setState(s => ({ ...s, enableBeatShake: !s.enableBeatShake }))}
                          className={`flex-1 py-1.5 px-2 rounded text-[9.5px] font-bold border transition-all flex items-center justify-center gap-1.5 ${state.enableBeatShake ? 'bg-pink-600/30 border-pink-400 text-pink-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}
                        >
                          <i className="fa-solid fa-shake text-[10px]"></i>
                          <span>Rung Chấn Cam</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SLIDERS TINH CHỈNH VẬT LÝ LÒ XO VÀ BIÊN ĐỘ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>ZOOM TĨNH (MIN)</span>
                        <span className="text-fuchsia-400 font-mono">{state.zoomMin.toFixed(2)}x</span>
                      </div>
                      <input type="range" min="0.9" max="1.2" step="0.01" value={state.zoomMin} onChange={(e) => setState(s => ({ ...s, zoomMin: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                      <p className="text-[8.5px] text-slate-500">Mức zoom khi chưa có nhịp trống</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>CỰC ĐẠI KHI NẨY (MAX)</span>
                        <span className="text-fuchsia-400 font-mono">{state.zoomMax.toFixed(2)}x</span>
                      </div>
                      <input type="range" min="1.05" max="1.65" step="0.01" value={state.zoomMax} onChange={(e) => setState(s => ({ ...s, zoomMax: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                      <p className="text-[8.5px] text-slate-500">Biên độ zoom căng nhất khi đập kick</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>ĐỘ ĐÀN HỒI LÒ XO (SPRING)</span>
                        <span className="text-fuchsia-400 font-mono">{Math.round((state.beatZoomSpring ?? 0.65) * 100)}%</span>
                      </div>
                      <input type="range" min="0.2" max="1.0" step="0.05" value={state.beatZoomSpring ?? 0.65} onChange={(e) => setState(s => ({ ...s, beatZoomSpring: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                      <p className="text-[8.5px] text-slate-500">Độ nảy lò xo & lực giật đàn hồi vật lý</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>ĐỘ NHẠY BASS (SENSITIVITY)</span>
                        <span className="text-fuchsia-400 font-mono">{Math.round(state.sensitivity * 100)}%</span>
                      </div>
                      <input type="range" min="0.2" max="2.0" step="0.05" value={state.sensitivity} onChange={(e) => setState(s => ({ ...s, sensitivity: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                      <p className="text-[8.5px] text-slate-500">Ngưỡng lọc bắt nhịp trống bass</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>ĐỘ MƯỢT (DAMPING)</span>
                        <span className="text-fuchsia-400 font-mono">{Math.round(state.smoothness * 100)}%</span>
                      </div>
                      <input type="range" min="0.1" max="0.95" step="0.05" value={state.smoothness} onChange={(e) => setState(s => ({ ...s, smoothness: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                      <p className="text-[8.5px] text-slate-500">Giảm giật khung hình, chuyển động mượt mà</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>BÙ TRỄ NHỊP (LEAD SYNC)</span>
                        <span className="text-fuchsia-400 font-mono">{state.leadMs}ms</span>
                      </div>
                      <input type="range" min="0" max="800" step="10" value={state.leadMs} onChange={(e) => setState(s => ({ ...s, leadMs: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-full accent-fuchsia-500 appearance-none cursor-pointer" />
                      <p className="text-[8.5px] text-slate-500">Khớp chuẩn xác thời điểm nảy đón nhịp</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

          {/* HIỆU ỨNG HẬU KỲ CHUYÊN SÂU (POST-PROCESSING VFX SHADER) */}
          <section id="vfx-postprocessing-section" className="bg-gradient-to-br from-slate-950 via-purple-950/25 to-slate-900 rounded-lg border border-purple-500/30 overflow-hidden shadow-2xl transition-all">
            {/* Header with Collapse/Expand Toggle */}
            <div 
              id="vfx-header-toggle"
              onClick={() => setIsVfxSectionExpanded(prev => !prev)}
              className="flex items-center justify-between p-3.5 md:p-4 cursor-pointer select-none bg-slate-900/60 hover:bg-slate-900/90 transition-colors border-b border-purple-500/20"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-sm">
                  <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.25em] text-purple-400 cursor-pointer">
                      Hiệu Ứng Hậu Kỳ VFX (Post-Processing)
                    </label>
                    <span className="text-[8.5px] font-bold bg-purple-900/70 text-purple-200 border border-purple-600/50 px-2 py-0.5 rounded-full">
                      Audio-Reactive 60FPS
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-medium">
                    {state.postProcessingVfx && state.postProcessingVfx !== 'none'
                      ? `Đang bật: ${POST_PROCESSING_VFX_OPTIONS.find(o => o.value === state.postProcessingVfx)?.name || state.postProcessingVfx} (${((state.vfxIntensity ?? 0.2) * 100).toFixed(0)}%)`
                      : 'Chưa kích hoạt hiệu ứng'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border transition-colors ${
                  state.postProcessingVfx && state.postProcessingVfx !== 'none'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                }`}>
                  {state.postProcessingVfx && state.postProcessingVfx !== 'none' ? `VFX ON` : 'VFX OFF'}
                </span>
                <button
                  id="btn-toggle-vfx-accordion"
                  type="button"
                  aria-label="Thu gọn / Mở rộng"
                  className="w-7 h-7 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 flex items-center justify-center text-slate-300 transition-transform duration-200"
                  style={{ transform: isVfxSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </button>
              </div>
            </div>

            {/* Collapsible Content Body */}
            {isVfxSectionExpanded && (
              <div id="vfx-content-body" className="p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-film text-purple-400"></i> Chọn Bộ Lọc Điện Ảnh Cinema Shader
                  </span>
                  {state.postProcessingVfx && state.postProcessingVfx !== 'none' && (
                    <button
                      id="btn-quick-disable-vfx"
                      type="button"
                      onClick={() => setState(s => ({ ...s, postProcessingVfx: 'none' }))}
                      className="text-[9.5px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                    >
                      <i className="fa-solid fa-power-off"></i> Tắt hiệu ứng
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {POST_PROCESSING_VFX_OPTIONS.map(vfx => {
                    const isActive = (state.postProcessingVfx || 'none') === vfx.value;
                    return (
                      <button
                        key={vfx.value}
                        id={`btn-vfx-${vfx.value}`}
                        type="button"
                        onClick={() => setState(s => ({ ...s, postProcessingVfx: vfx.value }))}
                        className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden group ${
                          isActive
                            ? 'bg-purple-900/80 border-purple-400 text-white ring-1 ring-purple-400/60 shadow-lg shadow-purple-950/60'
                            : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800/80 hover:border-purple-500/30 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <i className={`fa-solid ${vfx.icon} text-xs ${isActive ? 'text-purple-300' : 'text-slate-400 group-hover:text-purple-400'}`}></i>
                            <span className={`text-[10px] font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                              {vfx.name}
                            </span>
                          </div>
                          {vfx.badge && (
                            <span className={`text-[7.5px] font-black uppercase px-1 py-0.2 rounded border ${
                              isActive 
                                ? 'bg-purple-400/20 text-purple-200 border-purple-400/40' 
                                : 'bg-slate-800 text-slate-400 border-slate-700/60'
                            }`}>
                              {vfx.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[8.5px] leading-relaxed line-clamp-2 ${isActive ? 'text-purple-200/90 font-medium' : 'text-slate-400'}`}>
                          {vfx.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {state.postProcessingVfx && state.postProcessingVfx !== 'none' && (
                  <div className="space-y-2 pt-3 border-t border-purple-900/40 bg-purple-950/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-sliders text-purple-400"></i> Cường độ hiệu ứng (VFX Intensity)
                      </span>
                      <span className="font-mono bg-purple-900/70 border border-purple-600/50 px-2 py-0.5 rounded text-purple-200">
                        {((state.vfxIntensity ?? 0.2) * 100).toFixed(0)}% ({(state.vfxIntensity ?? 0.2).toFixed(2)}x)
                      </span>
                    </div>
                    <input 
                      id="input-vfx-intensity"
                      type="range" 
                      min="0.2" 
                      max="2.5" 
                      step="0.05" 
                      value={state.vfxIntensity ?? 0.2} 
                      onChange={(e) => setState(s => ({ ...s, vfxIntensity: parseFloat(e.target.value) }))} 
                      className="w-full h-1.5 bg-slate-800 rounded-full accent-purple-500 appearance-none cursor-pointer" 
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-medium">
                      <span>Nhẹ nhàng (20%)</span>
                      <span>Tiêu chuẩn (100%)</span>
                      <span>Mạnh mẽ theo Beat (250%)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ON-VIDEO MUSIC PLAYER HUD SECTION */}
          <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-4 md:p-5 rounded-md border border-indigo-500/30 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                  <i className="fa-solid fa-compact-disc text-cyan-400"></i> On-Video Music Player HUD
                </label>
                <span className="hidden sm:inline-block text-[9px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/50">
                  Player Bar &bull; Cassette &bull; Timer
                </span>
              </div>
              <button 
                onClick={() => setState(s => ({ ...s, showMusicPlayer: !s.showMusicPlayer }))} 
                className={`text-[10px] font-black px-5 py-1.5 rounded-full border transition-all ${
                  state.showMusicPlayer 
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30' 
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {state.showMusicPlayer ? 'PLAYER ACTIVE' : 'PLAYER HIDDEN'}
              </button>
            </div>

            {state.showMusicPlayer && (
              <div className="space-y-4 pt-1">
                {/* 1. Style Presets */}
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Chọn Giao Diện Trình Phát (Player Style)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {[
                      { id: 'modern_glass', name: 'Modern Glass', icon: 'fa-layer-group', desc: 'Dock kính mờ, nút play & timeline' },
                      { id: 'lofi_cassette', name: 'Lofi Cassette', icon: 'fa-tape', desc: 'Băng cassette retro xoay bánh xe' },
                      { id: 'spotify_bar', name: 'Spotify Bar', icon: 'fa-headphones', desc: 'Thanh pill dock tối giản' },
                      { id: 'retro_vinyl_card', name: 'Vinyl Card', icon: 'fa-record-vinyl', desc: 'Thẻ bài album đĩa than xoay' },
                      { id: 'minimal_timer_badge', name: 'Timer Badge', icon: 'fa-clock', desc: 'Huy hiệu đồng hồ & sóng LED' },
                      { id: 'cyber_hologram', name: 'Cyber Hologram', icon: 'fa-microchip', desc: 'Viền sáng Neon, lưới hologram 3D' },
                      { id: 'neon_synthwave', name: 'Neon Synthwave', icon: 'fa-sun', desc: 'Phong cách retro 80s outrun hoàng hôn' },
                      { id: 'apple_dynamic_island', name: 'Dynamic Island', icon: 'fa-mobile', desc: 'Thiết kế pill bo góc của iOS' },
                      { id: 'vintage_ipod', name: 'Vintage iPod', icon: 'fa-music', desc: 'Giao diện Classic iPod bánh xe click' },
                      { id: 'glow_cd_case', name: 'Glow CD Case', icon: 'fa-compact-disc', desc: 'Hộp nhựa CD trong suốt phát sáng' }
                    ].map(st => {
                      const isActive = state.musicPlayerStyle === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setState(s => ({ ...s, musicPlayerStyle: st.id as any }))}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            isActive
                              ? 'bg-cyan-950/80 border-cyan-400 text-white ring-1 ring-cyan-400/60 shadow-md'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <i className={`fa-solid ${st.icon} text-xs ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}></i>
                            <span className="text-[10px] font-bold">{st.name}</span>
                          </div>
                          <p className="text-[8.5px] text-slate-400 leading-tight">{st.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Theme & Custom Text Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Tên Bài Hát (Song Title)</span>
                    <input 
                      type="text" 
                      value={state.musicPlayerTitle || ''} 
                      onChange={e => setState(s => ({ ...s, musicPlayerTitle: e.target.value }))}
                      placeholder="Nhập tên bài hát..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-[10px] text-slate-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Ca Sĩ / Tác Giả (Artist)</span>
                    <input 
                      type="text" 
                      value={state.musicPlayerArtist || ''} 
                      onChange={e => setState(s => ({ ...s, musicPlayerArtist: e.target.value }))}
                      placeholder="Nhập tên nghệ sĩ..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-[10px] text-slate-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Màu Sắc / Theme</span>
                    <select
                      value={state.musicPlayerTheme || 'dark_glass'}
                      onChange={e => setState(s => ({ ...s, musicPlayerTheme: e.target.value as any }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-[10px] text-slate-200 outline-none focus:border-cyan-500"
                    >
                      <option value="dark_glass">Dark Glass (Kính Tối Sang Trọng)</option>
                      <option value="sunset_neon">Sunset Neon (Cam Hồng Hoàng Hôn)</option>
                      <option value="cyber_glow">Cyber Glow (Xanh Neon Cyberpunk)</option>
                      <option value="vintage_warm">Vintage Warm (Ấm Áp Cổ Điển)</option>
                      <option value="clean_white">Clean Light (Trắng Tinh Tế)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Toggle Components in Player */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { key: 'showPlayerButtons', label: 'Nút Play / Controls', icon: 'fa-play' },
                    { key: 'showPlayerTimer', label: 'Đồng Hồ Thời Gian', icon: 'fa-clock' },
                    { key: 'showPlayerProgress', label: 'Thanh Tiến Độ (Progress Bar)', icon: 'fa-bars-progress' },
                    { key: 'showPlayerCover', label: 'Ảnh Bìa Album (Cover Art)', icon: 'fa-image' },
                    { key: 'showPlayerWaveform', label: 'Sóng Âm Mini (Waveform)', icon: 'fa-water' }
                  ].map(item => {
                    const isChecked = (state as any)[item.key] !== false;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setState(s => ({ ...s, [item.key]: !isChecked }))}
                        className={`px-3 py-1.5 rounded-md text-[9.5px] font-bold border transition-all flex items-center gap-1.5 ${
                          isChecked 
                            ? 'bg-indigo-950/80 border-indigo-400 text-indigo-300 shadow-sm' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <i className={`fa-solid ${isChecked ? 'fa-check text-cyan-400' : item.icon} text-[10px]`}></i>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 4. Position & Scale Sliders */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                      <span>Kích Thước (Scale)</span>
                      <span>{(state.musicPlayerScale || 1.0).toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2.0" step="0.05" 
                      value={state.musicPlayerScale || 1.0} 
                      onChange={e => setState(s => ({ ...s, musicPlayerScale: parseFloat(e.target.value) }))} 
                      className="w-full h-1.5 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                      <span>Độ Trong Suốt</span>
                      <span>{Math.round((state.musicPlayerOpacity !== undefined ? state.musicPlayerOpacity : 1.0) * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="1.0" step="0.05" 
                      value={state.musicPlayerOpacity !== undefined ? state.musicPlayerOpacity : 1.0} 
                      onChange={e => setState(s => ({ ...s, musicPlayerOpacity: parseFloat(e.target.value) }))} 
                      className="w-full h-1.5 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                      <span>Vị Trí Ngang X</span>
                      <span>{state.musicPlayerX || 50}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={state.musicPlayerX !== undefined ? state.musicPlayerX : 50} 
                      onChange={e => setState(s => ({ ...s, musicPlayerX: parseInt(e.target.value) }))} 
                      className="w-full h-1.5 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                      <span>Vị Trí Dọc Y</span>
                      <span>{state.musicPlayerY || 82}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={state.musicPlayerY !== undefined ? state.musicPlayerY : 82} 
                      onChange={e => setState(s => ({ ...s, musicPlayerY: parseInt(e.target.value) }))} 
                      className="w-full h-1.5 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-slate-950/60 p-4 rounded-md border border-slate-800 space-y-6 shadow-inner">
            {/* Header with Collapse/Expand */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTypographyExpanded(prev => !prev)}
                  className="flex items-center gap-2 hover:opacity-80 transition-all text-left"
                >
                  <i 
                    className="fa-solid fa-chevron-down text-cyan-400 text-xs transition-transform duration-200"
                    style={{ transform: isTypographyExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
                  ></i>
                  <span className="text-[12px] font-black uppercase tracking-[0.25em] text-cyan-400">
                    Typography Studio & Reactive Engine
                  </span>
                </button>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300">
                  PRO LRC DISPLAY
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setState(s => ({
                    ...s,
                    fontFamily: 'Playfair Display',
                    fontSize: 30,
                    textColor: '#ffffff',
                    outlineColor: '#000000',
                    outlineWidth: 2,
                    enableHighlight: false,
                    karaokeHighlightColor: '#facc15',
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowBlur: 12,
                    lyricAnimation: 'fade',
                    animationSpeed: 1.2,
                    lyricLinesCount: 1,
                    lyricLeadTime: 0,
                    letterSpacing: 0,
                    textTransform: 'none',
                    enableLyricBeatPulse: false,
                    lyricBeatIntensity: 1.0,
                    lyricLineSpacing: 1.8,
                    inactiveLinesOpacity: 0.4,
                    inactiveLinesBlur: 0,
                    enableLyricBox: false,
                    lyricPosition: 50,
                    lyricX: 50,
                    lyricIsBold: false,
                    lyricIsItalic: false,
                    lyricIsUnderline: false,
                  }))}
                  className="text-[9px] font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
                  title="Khôi phục Typography & Hiệu ứng về mặc định cũ"
                >
                  <i className="fa-solid fa-rotate-left text-xs text-amber-400"></i>
                  <span>MẶC ĐỊNH CŨ</span>
                </button>
                <button 
                  onClick={() => setState(s => ({ ...s, showLyrics: !s.showLyrics }))} 
                  className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${state.showLyrics ? "bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-900/40" : "bg-slate-800 border-slate-700 text-slate-500"}`}
                >
                  {state.showLyrics ? "LYRICS VISIBLE" : "LYRICS HIDDEN"}
                </button>
              </div>
            </div>

            {isTypographyExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                {/* ── LEFT COLUMN: TYPOGRAPHY STUDIO ── */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300 flex items-center gap-2">
                      <i className="fa-solid fa-font text-cyan-400"></i>
                      Typography Studio
                    </label>
                    <span className="text-[9px] text-slate-500 font-medium">Con chữ & Định dạng</span>
                  </div>

                  {/* Font Family Selector & Quick Styles */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase block">Phông Chữ & Phong Cách</span>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                      <FontSelector value={state.fontFamily} onChange={(val) => setState(s => ({ ...s, fontFamily: val }))} options={fontOptions} onAddCustom={handleAddCustomFont} />
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-md p-1 gap-1">
                        {/* Bold Button */}
                        <button
                          type="button"
                          title="In Đậm (Bold)"
                          onClick={() => setState(s => ({ ...s, lyricIsBold: !s.lyricIsBold }))}
                          className={`w-8 h-8 rounded text-[12px] font-black transition-all ${state.lyricIsBold ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                        >
                          B
                        </button>
                        {/* Italic Button */}
                        <button
                          type="button"
                          title="In Nghiêng (Italic)"
                          onClick={() => setState(s => ({ ...s, lyricIsItalic: !s.lyricIsItalic }))}
                          className={`w-8 h-8 rounded text-[12px] font-serif italic font-bold transition-all ${state.lyricIsItalic ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                        >
                          I
                        </button>
                        {/* Underline Button */}
                        <button
                          type="button"
                          title="Gạch Chân (Underline)"
                          onClick={() => setState(s => ({ ...s, lyricIsUnderline: !s.lyricIsUnderline }))}
                          className={`w-8 h-8 rounded text-[12px] underline font-bold transition-all ${state.lyricIsUnderline ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                        >
                          U
                        </button>
                        {/* Text Transform Cycler */}
                        <button
                          type="button"
                          title={`Kiểu chữ: ${state.textTransform ?? "none"}`}
                          onClick={() => {
                            const modes = ["none", "uppercase", "capitalize", "lowercase"] as const;
                            const cur = state.textTransform ?? "none";
                            const next = modes[(modes.indexOf(cur as any) + 1) % modes.length];
                            setState(s => ({ ...s, textTransform: next }));
                          }}
                          className={`px-2 h-8 rounded text-[10px] font-mono font-bold transition-all ${state.textTransform && state.textTransform !== "none" ? "bg-cyan-700/80 text-cyan-100 border border-cyan-500/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                        >
                          {state.textTransform === "uppercase" ? "AA" : state.textTransform === "capitalize" ? "Aa" : state.textTransform === "lowercase" ? "aa" : "Tt"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Colors: Text Fill & Focus Highlight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Màu Chữ Chính</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={state.textColor} 
                          onChange={(e) => setState(s => ({ ...s, textColor: e.target.value }))} 
                          className="w-10 h-8 bg-transparent p-0.5 border border-slate-700 rounded cursor-pointer" 
                        />
                        <span className="text-[10px] font-mono text-slate-300 uppercase">{state.textColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Focus Karaoke</span>
                        <button 
                          onClick={() => setState(s => ({ ...s, enableHighlight: !s.enableHighlight }))} 
                          className={`text-[8px] font-bold px-2 py-0.5 rounded ${state.enableHighlight ? "bg-cyan-500 text-slate-950 font-black" : "bg-slate-800 text-slate-500"}`}
                        >
                          {state.enableHighlight ? "ON" : "OFF"}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={state.karaokeHighlightColor} 
                          onChange={(e) => setState(s => ({ ...s, karaokeHighlightColor: e.target.value }))} 
                          className="w-10 h-8 bg-transparent p-0.5 border border-slate-700 rounded cursor-pointer" 
                        />
                        <span className="text-[10px] font-mono text-slate-300 uppercase">{state.karaokeHighlightColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Outline Stroke (Viền Chữ Chống Chìm Nền) */}
                  <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-slate-400 uppercase flex items-center gap-1.5">
                        <i className="fa-solid fa-pen-nib text-cyan-400 text-xs"></i>
                        Viền Chữ (Outline Stroke)
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[0, 2, 4, 8].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setState(s => ({ ...s, outlineWidth: w }))}
                            className={`px-1.5 py-0.5 text-[8px] rounded font-bold ${state.outlineWidth === w ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                          >
                            {w}px
                          </button>
                        ))}
                        <span className="text-cyan-300 font-mono text-[10px] font-bold ml-1">{state.outlineWidth}px</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={state.outlineColor} 
                        onChange={(e) => setState(s => ({ ...s, outlineColor: e.target.value }))} 
                        className="w-10 h-8 bg-transparent p-0.5 border border-slate-700 rounded cursor-pointer" 
                        title="Màu viền chữ"
                      />
                      <input 
                        type="range" 
                        min="0" 
                        max="14" 
                        value={state.outlineWidth} 
                        onChange={(e) => setState(s => ({ ...s, outlineWidth: parseInt(e.target.value) }))} 
                        className="flex-1 h-2 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Font Size & Letter Spacing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-slate-400">CỠ CHỮ</span>
                        <span className="text-cyan-400 font-mono">{state.fontSize}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="14" 
                        max="160" 
                        value={state.fontSize} 
                        onChange={(e) => setState(s => ({ ...s, fontSize: parseInt(e.target.value) }))} 
                        className="w-full h-2 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                      />
                    </div>

                    <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-slate-400">GIÃN CHỮ</span>
                        <span className="text-cyan-400 font-mono">{state.letterSpacing ?? 0}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-2" 
                        max="24" 
                        value={state.letterSpacing ?? 0} 
                        onChange={(e) => setState(s => ({ ...s, letterSpacing: parseInt(e.target.value) }))} 
                        className="w-full h-2 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Position X & Y */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-slate-400">NGANG (X)</span>
                        <span className="text-cyan-400 font-mono">{state.lyricX}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={state.lyricX} 
                        onChange={(e) => setState(s => ({ ...s, lyricX: parseInt(e.target.value) }))} 
                        className="w-full h-2 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                      />
                    </div>

                    <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-slate-400">DỌC (Y)</span>
                        <span className="text-cyan-400 font-mono">{state.lyricPosition}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="90" 
                        value={state.lyricPosition} 
                        onChange={(e) => setState(s => ({ ...s, lyricPosition: parseInt(e.target.value) }))} 
                        className="w-full h-2 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Glassmorphism Backdrop Pill */}
                  <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setState(s => ({ ...s, enableLyricBox: !s.enableLyricBox }))}
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${state.enableLyricBox ? "bg-cyan-500 border-cyan-400 text-slate-950 font-bold" : "border-slate-700 bg-slate-800 text-transparent"}`}
                      >
                        ✓
                      </button>
                      <span className="text-[10px] font-bold text-slate-300">Khung Nền Kính Bo Tròn (Pill Backdrop)</span>
                    </div>
                    {state.enableLyricBox && (
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="color" 
                          value={state.lyricBoxColor ? (state.lyricBoxColor.startsWith("#") ? state.lyricBoxColor : "#000000") : "#000000"} 
                          onChange={(e) => setState(s => ({ ...s, lyricBoxColor: e.target.value }))} 
                          className="w-6 h-6 bg-transparent p-0 border border-slate-700 rounded cursor-pointer" 
                          title="Màu nền khung kính"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── RIGHT COLUMN: REACTIVE ENGINE (BEST LEVEL FOR LRC DISPLAY) ── */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400 flex items-center gap-2">
                      <i className="fa-solid fa-bolt-lightning text-indigo-400"></i>
                      Reactive Engine
                    </label>
                    <span className="text-[9px] text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                      AUDIO-REACTIVE BASS & BEAT
                    </span>
                  </div>

                  {/* Audio-Reactive Beat Bounce Module */}
                  <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 p-3 rounded-md border border-indigo-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-wave-square text-indigo-400 text-xs"></i>
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-wide">
                          Nhịp Beat Đập Theo Nhạc (Bass Bounce)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setState(s => ({ ...s, enableLyricBeatPulse: s.enableLyricBeatPulse === false ? true : false }))}
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded transition-all ${state.enableLyricBeatPulse !== false ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50" : "bg-slate-800 text-slate-500"}`}
                      >
                        {state.enableLyricBeatPulse !== false ? "BẬT (ACTIVE)" : "TẮT (OFF)"}
                      </button>
                    </div>
                    {state.enableLyricBeatPulse !== false && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span>Cường Độ Nhịp Đập (Reactivity)</span>
                          <span className="text-indigo-300 font-mono font-bold">
                            {Math.round((state.lyricBeatIntensity ?? 1.0) * 100)}%
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0.2" 
                          max="2.0" 
                          step="0.05" 
                          value={state.lyricBeatIntensity ?? 1.0} 
                          onChange={(e) => setState(s => ({ ...s, lyricBeatIntensity: parseFloat(e.target.value) }))} 
                          className="w-full h-1.5 bg-slate-800 rounded-full accent-indigo-400 appearance-none cursor-pointer" 
                        />
                        <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Dịu nhẹ (20%)</span>
                          <span>Chuẩn (100%)</span>
                          <span>Bùng nổ (200%)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Animation Style & Lines Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Số Dòng Hiển Thị</span>
                      <div className="flex bg-slate-900 rounded-md p-1 border border-slate-800">
                        {[1, 3, 5].map(v => (
                          <button 
                            key={v} 
                            onClick={() => setState(s => ({ ...s, lyricLinesCount: v }))} 
                            className={`flex-1 py-1.5 text-[10px] font-black rounded transition-all ${state.lyricLinesCount === v ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}
                          >
                            {v} Line{v > 1 ? "s" : ""}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Hiệu Ứng Lời Bài Hát (Anim)</span>
                      <select 
                        value={state.lyricAnimation} 
                        onChange={(e) => setState(s => ({ ...s, lyricAnimation: e.target.value as AnimationType }))} 
                        className="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 px-2 text-xs outline-none text-indigo-200 font-semibold"
                      >
                        {ANIMATION_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Multi-line Depth & Focus (When 3 or 5 lines are active) */}
                  {state.lyricLinesCount > 1 && (
                    <div className="bg-slate-900/60 p-2.5 rounded-md border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                        <span>CHIỀU SÂU DÒNG PHỤ (FOCUS & DOF)</span>
                        <span className="text-indigo-400 font-mono">{(state.lyricLineSpacing ?? 1.8).toFixed(1)}x</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-500 font-bold block">Khoảng Cách Dòng</span>
                          <input 
                            type="range" 
                            min="1.2" 
                            max="2.6" 
                            step="0.1" 
                            value={state.lyricLineSpacing ?? 1.8} 
                            onChange={(e) => setState(s => ({ ...s, lyricLineSpacing: parseFloat(e.target.value) }))} 
                            className="w-full h-1.5 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" 
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-500 font-bold block">Làm Mờ Dòng Phụ (DOF Blur)</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="8" 
                            value={state.inactiveLinesBlur ?? 0} 
                            onChange={(e) => setState(s => ({ ...s, inactiveLinesBlur: parseInt(e.target.value) }))} 
                            className="w-full h-1.5 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lead Time (Xuất hiện sớm) */}
                  <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-stopwatch text-cyan-400"></i>
                        Xuất Hiện Sớm (Lead Time)
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[0, 0.5, 1, 1.5, 2].map((quickVal) => (
                          <button
                            key={quickVal}
                            type="button"
                            onClick={() => setState(s => ({ ...s, lyricLeadTime: quickVal }))}
                            className={`px-1.5 py-0.5 text-[8px] rounded font-bold transition-all ${
                              (state.lyricLeadTime ?? 0) === quickVal
                                ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {quickVal === 0 ? "0s" : `${quickVal}s`}
                          </button>
                        ))}
                        <span className="text-cyan-300 font-mono text-[9px] font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                          {((state.lyricLeadTime ?? 0) > 0 ? `+${(state.lyricLeadTime ?? 0).toFixed(1)}s` : "0.0s")}
                        </span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="3.0" 
                      step="0.1" 
                      value={state.lyricLeadTime ?? 0} 
                      onChange={(e) => setState(s => ({ ...s, lyricLeadTime: parseFloat(e.target.value) }))} 
                      className="w-full h-2 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer" 
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-medium">
                      <span>Chuẩn thời gian (0s)</span>
                      <span>Hiện sớm 1s</span>
                      <span>Hiện sớm tối đa (3s)</span>
                    </div>
                  </div>

                  {/* Transition Speed */}
                  <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400 font-black">
                      <span>TỐC ĐỘ HIỆU ỨNG (FADE/MOTION SPEED)</span>
                      <span className="text-indigo-400 font-mono">{state.animationSpeed}s</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="4.0" 
                      step="0.1" 
                      value={state.animationSpeed} 
                      onChange={(e) => setState(s => ({ ...s, animationSpeed: parseFloat(e.target.value) }))} 
                      className="w-full h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" 
                    />
                  </div>

                  {/* Text Glow & Neon Bloom */}
                  <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-md border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400 font-black">
                      <span>HÀO QUANG PHÁT SÁNG (TEXT GLOW & NEON BLOOM)</span>
                      <span className="text-indigo-400 font-mono">{state.textShadowBlur}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={state.textShadowColor} 
                        onChange={(e) => setState(s => ({ ...s, textShadowColor: e.target.value }))} 
                        className="w-10 h-8 bg-transparent p-0.5 border border-slate-700 rounded cursor-pointer" 
                      />
                      <input 
                        type="range" 
                        min="0" 
                        max="60" 
                        value={state.textShadowBlur} 
                        onChange={(e) => setState(s => ({ ...s, textShadowBlur: parseInt(e.target.value) }))} 
                        className="flex-1 h-2 bg-slate-800 rounded-full accent-indigo-500 appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {templates.length > 0 && (
            <section className="p-4 bg-slate-950/40 rounded-md border border-slate-800 shadow-inner">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 block">Production Library Presets</label>
              <div className="flex flex-wrap gap-4">
                {templates.map(t => (
                  <div key={t.id} className="group relative">
                    <button onClick={() => setState(prev => ({ ...prev, ...t.settings }))} className="bg-slate-900/80 hover:bg-slate-800 text-[11px] font-black px-6 py-4 rounded-md border border-slate-800 transition-all hover:border-cyan-500/50 shadow-xl">{t.name}</button>
                    <button onClick={() => { const u = templates.filter(x => x.id !== t.id); setTemplates(u); localStorage.setItem('karaoke_templates_v4', JSON.stringify(u)); }} className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 🎬 TRÌNH BIÊN TẬP & DỰNG VIDEO (TIMELINE & MULTI-TRACK) - Hidden by default for fast initial load */}
          <TimelineEditor
            state={state}
            setState={setState}
            currentTime={state.currentTime}
            duration={state.duration}
            onSeek={handleSeek}
            onTogglePlay={togglePlay}
            isPlaying={state.isPlaying}
          />

          {/* Interactive Waveform Audio Trimmer & Fade Controls */}
          <AudioTimelineTrimmer
            duration={state.duration}
            currentTime={state.currentTime}
            trimStart={state.trimStart}
            trimEnd={state.trimEnd > 0 ? state.trimEnd : state.duration}
            enableTrim={state.enableTrim}
            onTrimChange={(updates) => setState(s => ({ ...s, ...updates }))}
            enableFadeIn={state.enableFadeIn}
            fadeInDuration={state.fadeInDuration}
            onFadeInChange={(enabled, duration) => setState(s => ({ ...s, enableFadeIn: enabled, fadeInDuration: duration }))}
            enableFadeOut={state.enableFadeOut}
            fadeOutDuration={state.fadeOutDuration}
            onFadeOutChange={(enabled, duration) => setState(s => ({ ...s, enableFadeOut: enabled, fadeOutDuration: duration }))}
            onSeek={handleSeek}
            onPlayTrimRange={handlePlayTrimRange}
            isPlaying={state.isPlaying}
          />

          <section className="bg-slate-950/50 p-4 sm:p-5 rounded-md border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-xs"></i> TÙY CHỌN XUẤT VIDEO (CONSISTENT QUALITY)
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                100% Không Lag • Ổn định
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aspect Ratio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tỉ lệ khung hình (Aspect Ratio)</span>
                  <span className="text-[9px] font-mono text-indigo-400">{state.exportRatio === '9:16' ? '1080x1920' : state.exportRatio === '16:9' ? '1920x1080' : '1080x1080'}</span>
                </div>
                <div className="flex gap-1.5 bg-slate-900/70 p-1 rounded-md border border-slate-800">
                  <button onClick={() => setState(s => ({ ...s, exportRatio: '9:16' }))} className={`flex-1 py-2 text-[10px] font-black rounded transition-all ${state.exportRatio === '9:16' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>9:16 (TikTok)</button>
                  <button onClick={() => setState(s => ({ ...s, exportRatio: '16:9' }))} className={`flex-1 py-2 text-[10px] font-black rounded transition-all ${state.exportRatio === '16:9' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>16:9 (YouTube)</button>
                  <button onClick={() => setState(s => ({ ...s, exportRatio: '1:1' }))} className={`flex-1 py-2 text-[10px] font-black rounded transition-all ${state.exportRatio === '1:1' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>1:1 (Insta)</button>
                </div>
              </div>

              {/* Framerate FPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tốc độ khung hình (FPS)</span>
                  <span className="text-[9px] font-mono text-emerald-400">{state.exportFps || 30} FPS</span>
                </div>
                <div className="flex gap-1.5 bg-slate-900/70 p-1 rounded-md border border-slate-800">
                  <button onClick={() => setState(s => ({ ...s, exportFps: 30 }))} className={`flex-1 py-2 text-[10px] font-black rounded transition-all flex items-center justify-center gap-1.5 ${state.exportFps === 30 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                    <span>30 FPS</span>
                    <span className="text-[8px] opacity-80 font-normal">(Khuyên dùng)</span>
                  </button>
                  <button onClick={() => setState(s => ({ ...s, exportFps: 60 }))} className={`flex-1 py-2 text-[10px] font-black rounded transition-all flex items-center justify-center gap-1.5 ${state.exportFps === 60 ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                    <span>60 FPS</span>
                    <span className="text-[8px] opacity-80 font-normal">(Siêu mượt)</span>
                  </button>
                </div>
              </div>

              {/* Quality & Bitrate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Chất lượng &amp; Bitrate</span>
                  <span className="text-[9px] font-mono text-amber-400">{state.exportQuality === 'ultra' ? '14 Mbps' : state.exportQuality === 'high' ? '8 Mbps' : state.exportQuality === 'medium' ? '5 Mbps' : '2.5 Mbps'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 bg-slate-900/70 p-1 rounded-md border border-slate-800">
                  <button onClick={() => setState(s => ({ ...s, exportQuality: 'ultra' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportQuality === 'ultra' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Ultra</button>
                  <button onClick={() => setState(s => ({ ...s, exportQuality: 'high' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportQuality === 'high' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>High (Chuẩn)</button>
                  <button onClick={() => setState(s => ({ ...s, exportQuality: 'medium' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportQuality === 'medium' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Vừa</button>
                  <button onClick={() => setState(s => ({ ...s, exportQuality: 'low' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportQuality === 'low' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Nhẹ</button>
                </div>
              </div>

              {/* Format & Codec */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Định dạng &amp; Codec</span>
                  <span className="text-[9px] font-mono text-purple-400">{state.exportCodec || 'auto'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 bg-slate-900/70 p-1 rounded-md border border-slate-800">
                  <button onClick={() => setState(s => ({ ...s, exportCodec: 'auto' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportCodec === 'auto' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Auto</button>
                  <button onClick={() => setState(s => ({ ...s, exportCodec: 'mp4' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportCodec === 'mp4' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>MP4</button>
                  <button onClick={() => setState(s => ({ ...s, exportCodec: 'webm_vp8' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportCodec === 'webm_vp8' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>VP8 (Mượt)</button>
                  <button onClick={() => setState(s => ({ ...s, exportCodec: 'webm_vp9' }))} className={`py-2 text-[9px] font-black rounded transition-all ${state.exportCodec === 'webm_vp9' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>VP9</button>
                </div>
              </div>

              {/* Render Engine Selector */}
              <div className="space-y-2 col-span-1 md:col-span-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Chế độ xuất video (Render Engine)</span>
                  <span className={`text-[9px] font-mono font-bold ${state.exportEngine !== 'realtime' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {state.exportEngine !== 'realtime' ? '🚀 Frame-by-Frame (WebCodecs) • 0% rớt frame' : '🔴 Real-time (MediaRecorder)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    type="button"
                    disabled={true}
                    className="p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed opacity-70"
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-slate-800/50 text-slate-600">
                      <i className="fa-solid fa-bolt-lightning text-xs"></i>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <span className="line-through">Frame-by-Frame</span>
                        <span className="text-[8px] bg-amber-500/10 text-amber-500/70 px-1.5 py-0.5 rounded font-black uppercase">Sắp ra mắt</span>
                      </div>
                      <div className="text-[9px] text-slate-500 leading-snug mt-0.5">
                        Tính năng render chuẩn xác bằng WebCodecs đang được bảo trì. Vui lòng sử dụng chế độ Real-time.
                      </div>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setState(s => ({ ...s, exportEngine: 'realtime' }))} 
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                      state.exportEngine === 'realtime'
                        ? 'border-indigo-500/80 bg-indigo-950/40 text-white shadow-lg ring-1 ring-indigo-500/40'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${state.exportEngine === 'realtime' ? 'bg-indigo-500 text-white font-black' : 'bg-slate-800 text-slate-400'}`}>
                      <i className="fa-solid fa-record-vinyl text-xs"></i>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <span>Thời gian thực (MediaRecorder)</span>
                        <span className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase">Cổ điển</span>
                      </div>
                      <div className="text-[9px] text-slate-400 leading-snug mt-0.5">
                        Thu trực tiếp luồng phát Canvas Stream theo thời gian thực (1:1 với thời lượng bài hát). Dành cho thiết bị hoặc trình duyệt đời cũ.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Stability & Performance Engine Badge */}
            <div className="p-3 bg-cyan-950/30 rounded-md border border-cyan-500/20 flex items-start gap-2.5 text-[11px] text-cyan-200/90 leading-relaxed">
              <i className="fa-solid fa-circle-check text-cyan-400 mt-0.5 shrink-0 text-sm"></i>
              <div>
                <strong className="text-white font-bold">{state.exportEngine !== 'realtime' ? 'Công nghệ Frame-by-Frame WebCodecs + Muxer:' : 'Công nghệ Stream Time-sliced:'}</strong> {state.exportEngine !== 'realtime' ? 'Mỗi khung hình được mã hóa trực tiếp vào tệp qua GPU phần cứng với độ chính xác miligiây. Cho phép xuất video ở tốc độ cực cao, chuẩn 30/60 FPS mượt mà không rớt một khung hình nào dù thu nhỏ hoặc chuyển tab trình duyệt.' : 'Bộ đệm phân luồng theo giây (1s Time-sliced stream) kết hợp giải mã phần cứng H.264/VP8 giúp video dài không bị tràn RAM.'}
              </div>
            </div>
          </section>

          <button 
            onClick={exportStatus === ExportStatus.RECORDING ? cancelExport : handleExport}
            disabled={!isReady && exportStatus !== ExportStatus.RECORDING} 
            className={`group relative w-full py-3.5 sm:py-5 px-3.5 sm:px-6 rounded-md font-bold text-base sm:text-lg flex items-center justify-between gap-2.5 sm:gap-4 transition-all duration-200 shadow-2xl overflow-hidden ${
              isReady && exportStatus !== ExportStatus.RECORDING
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] border border-emerald-300/60' 
                : exportStatus === ExportStatus.RECORDING
                  ? 'bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow-inner cursor-wait'
                  : 'bg-slate-900/90 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-60'
            }`}
          >
            {exportStatus === ExportStatus.RECORDING ? (
              <div className="w-full flex items-center justify-between gap-2 px-1 sm:px-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <i className="fa-solid fa-circle-notch fa-spin text-cyan-400 text-xl sm:text-2xl"></i>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs sm:text-base font-extrabold text-white">Đang render & xuất video master...</span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300 font-bold">
                      {Math.round(exportProgress)}% hoàn tất &bull; {activeExportInfo || `${state.exportFps || 30} FPS HD`}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 flex items-center justify-center text-red-400 hover:text-red-300 cursor-pointer transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] pointer-events-auto" title="Hủy xuất video" onClick={(e) => { e.stopPropagation(); cancelExport(); }}>
                  <i className="fa-solid fa-stop text-xs sm:text-base"></i>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-emerald-950/90 border border-emerald-300/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform shrink-0">
                    <i className="fa-solid fa-arrow-down-to-bracket text-xs sm:text-base"></i>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-base font-black tracking-wider uppercase text-white drop-shadow-sm">
                      XUẤT VIDEO KARAOKE (EXPORT VIDEO)
                    </span>
                    <span className="text-[9px] sm:text-[11px] font-semibold text-emerald-100/90">
                      Full HD 1080p &bull; {state.exportFps || 30} FPS &bull; Tối ưu TikTok, YouTube Shorts &amp; Reels (Không lag)
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-black/30 border border-white/10 text-xs font-mono font-bold text-emerald-200">
                  <span>{state.exportCodec === 'mp4' ? 'MP4' : state.exportCodec === 'webm_vp8' ? 'VP8' : state.exportCodec === 'webm_vp9' ? 'VP9' : 'AUTO'}</span>
                  <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                </div>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col items-center lg:sticky lg:top-4 w-full pb-6 lg:pb-0">
          <div className={`w-full ${state.exportRatio === '16:9' ? 'max-w-[560px] xl:max-w-[620px]' : 'max-w-[420px] xl:max-w-[480px]'} relative shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-md transition-all duration-300`}>
            <VideoPreview
              ref={canvasRef} 
              audioRef={audioRef} 
              backgroundImageUrl={state.backgroundImageUrl} 
              backgroundType={state.backgroundType} 
              isPlaying={state.isPlaying}
              exportEngine={state.exportEngine}
              isExporting={exportStatus === ExportStatus.RECORDING}
              lrcLines={state.lrcLines}
              showLyrics={state.showLyrics}
              currentTime={state.currentTime} 
              fontSize={state.fontSize} 
              overlayOpacity={state.overlayOpacity} 
              fontFamily={state.fontFamily}
              textColor={state.textColor} 
              lyricIsBold={state.lyricIsBold}
              lyricIsItalic={state.lyricIsItalic}
              lyricIsUnderline={state.lyricIsUnderline}
              outlineColor={state.outlineColor} 
              outlineWidth={state.outlineWidth}
              enableHighlight={state.enableHighlight} 
              karaokeHighlightColor={state.karaokeHighlightColor} 
              textShadowColor={state.textShadowColor} 
              textShadowBlur={state.textShadowBlur}
              lyricPosition={state.lyricPosition} 
              lyricX={state.lyricX}
              lyricAnimation={state.lyricAnimation} 
              animationSpeed={state.animationSpeed} 
              lyricLinesCount={state.lyricLinesCount}
              lyricLeadTime={state.lyricLeadTime ?? 0}
              letterSpacing={state.letterSpacing ?? 0}
              textTransform={state.textTransform ?? 'none'}
              enableLyricBeatPulse={state.enableLyricBeatPulse ?? true}
              lyricBeatIntensity={state.lyricBeatIntensity ?? 1.0}
              lyricLineSpacing={state.lyricLineSpacing ?? 1.8}
              inactiveLinesOpacity={state.inactiveLinesOpacity ?? 0.4}
              inactiveLinesBlur={state.inactiveLinesBlur ?? 0}
              enableLyricBox={state.enableLyricBox ?? false}
              lyricBoxColor={state.lyricBoxColor ?? 'rgba(0, 0, 0, 0.55)'}
              bgAnimationType={state.bgAnimationType} 
              bgAnimationSpeed={state.bgAnimationSpeed}
              enablePan={state.enablePan} 
              particleEffect={state.particleEffect}
              postProcessingVfx={state.postProcessingVfx}
              vfxIntensity={state.vfxIntensity}
              showLogo={state.showLogo !== false}
              logoUrl={state.logoUrl} 
              logoOpacity={state.logoOpacity} 
              logoSize={state.logoSize} 
              logoX={state.logoX} 
              logoY={state.logoY}
              showWaveform={state.showWaveform} 
              waveformStyle={state.waveformStyle} 
              waveformColor={state.waveformColor} 
              waveformOpacity={state.waveformOpacity}
              waveformSize={state.waveformSize} 
              waveformPosition={state.waveformPosition} 
              waveformX={state.waveformX} 
              waveformWidth={state.waveformWidth}
              visualizerScale={state.visualizerScale}
              customVisualizerJs={state.customVisualizerJs}
              customTexts={state.customTexts}
              showMusicPlayer={state.showMusicPlayer}
              musicPlayerStyle={state.musicPlayerStyle}
              musicPlayerTitle={state.musicPlayerTitle}
              musicPlayerArtist={state.musicPlayerArtist}
              musicPlayerX={state.musicPlayerX}
              musicPlayerY={state.musicPlayerY}
              musicPlayerScale={state.musicPlayerScale}
              musicPlayerOpacity={state.musicPlayerOpacity}
              musicPlayerTheme={state.musicPlayerTheme}
              showPlayerButtons={state.showPlayerButtons}
              showPlayerTimer={state.showPlayerTimer}
              showPlayerProgress={state.showPlayerProgress}
              showPlayerCover={state.showPlayerCover}
              duration={state.duration}
              zoomMin={state.zoomMin} 
              zoomMax={state.zoomMax} 
              sensitivity={state.sensitivity} 
              smoothness={state.smoothness} 
              leadMs={state.leadMs} 
              enableBeatZoom={state.enableBeatZoom}
              beatZoomMode={state.beatZoomMode}
              beatZoomTarget={state.beatZoomTarget}
              beatZoomSpring={state.beatZoomSpring}
              enableBeatFlash={state.enableBeatFlash}
              enableBeatShake={state.enableBeatShake}
              exportRatio={state.exportRatio}
              exportFps={state.exportFps || 30}
              enableTrim={state.enableTrim}
              trimStart={state.trimStart}
              trimEnd={state.trimEnd > 0 ? state.trimEnd : state.duration}
              enableFadeIn={state.enableFadeIn}
              fadeInDuration={state.fadeInDuration}
              enableFadeOut={state.enableFadeOut}
              fadeOutDuration={state.fadeOutDuration}
              timelineSegments={state.timelineSegments}
              smartIntroCard={state.smartIntroCard}
              smartOutroCard={state.smartOutroCard}
              enableCanvasInteractiveMode={state.enableCanvasInteractiveMode}
              onUpdateCanvasElement={(updates) => setState(s => ({ ...s, ...updates }))}
            />
            {!isReady && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-14 text-center rounded-md backdrop-blur-xl">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-3xl border border-slate-800 animate-pulse">
                  <i className="fa-solid fa-sliders text-cyan-400 text-4xl"></i>
                </div>
                <h3 className="text-white font-black text-3xl mb-4 tracking-tighter">PREVIEW READY</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed opacity-60">Upload nhạc MP3 hoặc dán link nhạc để bắt đầu.</p>
              </div>
            )}
          </div>

          {/* Interactive Timeline & Playback Controller */}
          <div className={`w-full ${state.exportRatio === '16:9' ? 'max-w-[560px] xl:max-w-[620px]' : 'max-w-[420px] xl:max-w-[480px]'} mt-3 sm:mt-4 bg-slate-900/95 backdrop-blur-3xl rounded-md p-2.5 sm:p-4 border border-slate-800/80 shadow-[0_40px_80px_rgba(0,0,0,0.7)] space-y-2 sm:space-y-3.5 transition-all duration-300`}>
             
             {/* Interactive Drag & Click Scrubber Bar */}
             <div className="space-y-1 sm:space-y-1.5">
                <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono font-bold tracking-wider">
                   <div className="flex items-center gap-1.5 sm:gap-2">
                     <span className="text-cyan-400 font-extrabold">{formatTime(state.currentTime)}</span>
                     {isScrubbing && (
                       <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans font-bold animate-pulse">
                         Đang kéo tua
                       </span>
                     )}
                   </div>
                   <div className="flex items-center gap-2 sm:gap-3">
                     {state.duration > 0 && (
                       <span className="text-slate-500 text-[9px] sm:text-[10px]">
                         {Math.round((state.currentTime / state.duration) * 100)}%
                       </span>
                     )}
                     <span className="text-slate-400">{formatTime(state.duration)}</span>
                   </div>
                </div>

                <div 
                  ref={progressBarRef}
                  onMouseDown={handleScrubberMouseDown}
                  onTouchStart={handleScrubberTouchStart}
                  onMouseMove={handleScrubberMouseMove}
                  onMouseLeave={handleScrubberMouseLeave}
                  className="group relative h-3.5 sm:h-4 w-full flex items-center cursor-pointer select-none py-1"
                  title="Click hoặc kéo chuột để tua nhanh/chậm đến bất kỳ thời điểm nào"
                >
                   {/* Track background */}
                   <div className="h-1.5 sm:h-2 w-full bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative">
                      {/* Trim Region Highlight on Scrubber */}
                      {state.enableTrim && state.duration > 0 && (
                        <div 
                          className="absolute top-0 bottom-0 bg-emerald-500/35 border-x border-emerald-400/80 z-0 pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          style={{
                            left: `${(state.trimStart / state.duration) * 100}%`,
                            width: `${Math.max(1, (((state.trimEnd > 0 ? state.trimEnd : state.duration) - state.trimStart) / state.duration) * 100)}%`
                          }}
                        />
                      )}

                      {/* Active progress fill */}
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-75 relative z-0" 
                        style={{ width: `${state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0}%` }}
                      ></div>
                   </div>

                   {/* Hover cursor preview line */}
                   {scrubHoverTime !== null && (
                     <div 
                       className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-10 shadow-[0_0_6px_white]"
                       style={{ left: `${scrubHoverPos}%` }}
                     >
                       {/* Floating timestamp tooltip */}
                       <div className="absolute -top-7 -translate-x-1/2 bg-slate-950 text-cyan-300 border border-cyan-800/70 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap">
                         {formatTime(scrubHoverTime)}
                       </div>
                     </div>
                   )}

                   {/* Draggable Scrubber Thumb Handle */}
                   {state.duration > 0 && (
                     <div 
                       className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full border-2 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-transform ${isScrubbing ? 'scale-125 bg-cyan-200' : 'group-hover:scale-110'}`}
                       style={{ left: `${(state.currentTime / state.duration) * 100}%` }}
                     ></div>
                   )}
                </div>
             </div>

             {/* Playback Controls & Fast-Forward Buttons */}
             <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1 sm:gap-1.5">
                   {/* Play / Pause button */}
                    <button 
                      onClick={togglePlay} 
                      disabled={!state.audioUrl} 
                      title={state.isPlaying && !isPlayingTrimOnly ? "Tạm dừng toàn bài (Space)" : "Phát toàn bài"}
                      className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg sm:rounded-xl transition-all shadow-xl active:scale-90 ${
                        state.isPlaying && !isPlayingTrimOnly 
                          ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 font-bold" 
                          : state.audioUrl 
                            ? "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/80" 
                            : "bg-slate-800 text-slate-700 cursor-not-allowed"
                      }`}
                    >
                       <i className={`fa-solid ${state.isPlaying && !isPlayingTrimOnly ? "fa-pause text-base sm:text-lg" : "fa-play text-xs sm:text-base ml-0.5"}`}></i>
                    </button>

                    {/* Play TRIMMED Video Only Button */}
                    {state.enableTrim ? (
                      <button
                        onClick={handlePlayTrimRange}
                        disabled={!state.audioUrl}
                        title={`Phát CHỈ đoạn cắt (${formatTime(state.trimStart)} - ${formatTime(state.trimEnd > 0 ? state.trimEnd : state.duration)})`}
                        className={`h-9 sm:h-11 px-2 sm:px-3 flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl transition-all shadow-xl active:scale-95 border ${
                          isPlayingTrimOnly && state.isPlaying
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black border-emerald-400 shadow-emerald-500/30"
                            : "bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"
                        }`}
                      >
                         <i className={`fa-solid ${isPlayingTrimOnly && state.isPlaying ? "fa-pause text-[10px] sm:text-xs" : "fa-scissors text-[10px] sm:text-xs"}`}></i>
                         <div className="flex flex-col text-left">
                            <span className="text-[9px] sm:text-[10px] font-black leading-tight uppercase tracking-wider">
                              {isPlayingTrimOnly && state.isPlaying ? "Dừng cắt" : "Play Trim"}
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400/90 leading-tight">
                              {formatTime(state.trimStart)}-{formatTime(state.trimEnd > 0 ? state.trimEnd : state.duration)}
                            </span>
                         </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setState(s => ({ ...s, enableTrim: true, trimStart: 0, trimEnd: s.duration > 0 ? Math.min(30, s.duration) : 30 }));
                        }}
                        disabled={!state.audioUrl}
                        title="Bật tính năng cắt đoạn nhạc (Trim)"
                        className="h-9 sm:h-11 px-2 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-emerald-300 text-[9px] sm:text-[10px] font-bold border border-slate-700/60 transition-all active:scale-95"
                      >
                         <i className="fa-solid fa-scissors text-[10px] sm:text-xs"></i>
                         <span>Trim</span>
                      </button>
                    )}

                    {/* Replay from start */}
                    <button 
                      onClick={handleReplay} 
                      disabled={!state.audioUrl} 
                      title="Phát lại từ đầu"
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg transition-all bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-90 ${!state.audioUrl && "opacity-50 cursor-not-allowed"}`}
                    >
                       <i className="fa-solid fa-rotate-left text-[10px] sm:text-xs"></i>
                    </button>
                 </div>

                 {/* Fast-forward and Rewind Steppers */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                   <button 
                     onClick={() => handleFastForward(-5)} 
                     disabled={!state.audioUrl || !state.duration}
                     title="Tua lùi lại 5 giây"
                     className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-0.5 sm:gap-1 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                   >
                     <i className="fa-solid fa-backward-step text-[9px] sm:text-[10px]"></i>
                     <span>-5s</span>
                   </button>

                   <button 
                     onClick={() => handleFastForward(5)} 
                     disabled={!state.audioUrl || !state.duration}
                     title="Tua tới 5 giây"
                     className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-0.5 sm:gap-1 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                   >
                     <span>+5s</span>
                     <i className="fa-solid fa-forward-step text-[9px] sm:text-[10px]"></i>
                   </button>

                   <button 
                     onClick={() => handleFastForward(15)} 
                     disabled={!state.audioUrl || !state.duration}
                     title="Tua nhanh tới 15 giây"
                     className="px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-0.5 sm:gap-1 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                   >
                     <span>+15s</span>
                     <i className="fa-solid fa-angles-right text-[8px] sm:text-[9px]"></i>
                   </button>
                </div>

                {/* Playback speed rate toggle */}
                <button
                  onClick={handleTogglePlaybackRate}
                  disabled={!state.audioUrl}
                  title="Thay đổi tốc độ phát"
                  className="px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] sm:text-xs font-mono font-bold border border-slate-700/60 disabled:opacity-40 transition-all"
                >
                  {playbackRate}x
                </button>
             </div>

             {/* ⚡ CẤU HÌNH XUẤT & PREVIEW OPTIONS TOOLBAR (ĐỒNG BỘ TRỰC TIẾP VỚI PREVIEW & EXPORT) */}
             <div className="pt-2 sm:pt-2.5 border-t border-slate-800/80 space-y-2">
               <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                 <div className="flex items-center gap-1.5 font-bold text-slate-400">
                   <i className="fa-solid fa-sliders text-cyan-400 text-[10px]"></i>
                   <span className="uppercase tracking-wider font-extrabold text-[9px] sm:text-[10px] text-slate-300">Cấu hình Export & Preview</span>
                 </div>
                 
                 {/* 60 FPS Boost Engine Badge */}
                 <div 
                   className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-black text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                   title="Hệ thống đang chạy tăng tốc phần cứng WebGL/Canvas 60 FPS không độ trễ"
                 >
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                   <i className="fa-solid fa-bolt text-amber-400 text-[9px]"></i>
                   <span>60 FPS BOOST ACTIVE</span>
                 </div>
               </div>

               {/* Quick Export Config Selectors directly synchronized with state */}
               <div className="grid grid-cols-3 gap-1.5 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/90 text-[9px] sm:text-[10px]">
                 
                 {/* 1. Tỉ lệ khung hình (Aspect Ratio) */}
                 <div className="flex flex-col gap-1">
                   <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                     <i className="fa-solid fa-crop-simple text-indigo-400 text-[8px]"></i>
                     Tỉ Lệ:
                   </span>
                   <div className="flex bg-slate-900 rounded border border-slate-800 p-0.5">
                     <button
                       type="button"
                       onClick={() => setState(s => ({ ...s, exportRatio: '9:16' }))}
                       className={`flex-1 py-1 text-[8px] sm:text-[9px] font-extrabold rounded transition-all ${
                         state.exportRatio === '9:16' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                       }`}
                       title="9:16 - Chuẩn dọc TikTok / Reels / Shorts (1080x1920)"
                     >
                       9:16
                     </button>
                     <button
                       type="button"
                       onClick={() => setState(s => ({ ...s, exportRatio: '16:9' }))}
                       className={`flex-1 py-1 text-[8px] sm:text-[9px] font-extrabold rounded transition-all ${
                         state.exportRatio === '16:9' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                       }`}
                       title="16:9 - Chuẩn ngang YouTube (1920x1080)"
                     >
                       16:9
                     </button>
                     <button
                       type="button"
                       onClick={() => setState(s => ({ ...s, exportRatio: '1:1' }))}
                       className={`flex-1 py-1 text-[8px] sm:text-[9px] font-extrabold rounded transition-all ${
                         state.exportRatio === '1:1' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                       }`}
                       title="1:1 - Chuẩn vuông Instagram (1080x1080)"
                     >
                       1:1
                     </button>
                   </div>
                 </div>

                 {/* 2. Tốc độ khung hình (Export FPS) */}
                 <div className="flex flex-col gap-1">
                   <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                     <i className="fa-solid fa-gauge-high text-cyan-400 text-[8px]"></i>
                     Tốc Độ:
                   </span>
                   <div className="flex bg-slate-900 rounded border border-slate-800 p-0.5">
                     <button
                       type="button"
                       onClick={() => setState(s => ({ ...s, exportFps: 30 }))}
                       className={`flex-1 py-1 text-[8px] sm:text-[9px] font-extrabold rounded transition-all ${
                         (state.exportFps || 30) === 30 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                       }`}
                       title="30 FPS - Tối ưu thời gian xuất nhanh & nhẹ"
                     >
                       30 FPS
                     </button>
                     <button
                       type="button"
                       onClick={() => setState(s => ({ ...s, exportFps: 60 }))}
                       className={`flex-1 py-1 text-[8px] sm:text-[9px] font-extrabold rounded transition-all ${
                         state.exportFps === 60 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                       }`}
                       title="60 FPS - Chuyển động siêu mượt"
                     >
                       60 FPS
                     </button>
                   </div>
                 </div>

                 {/* 3. Chất lượng & Bitrate */}
                 <div className="flex flex-col gap-1">
                   <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                     <i className="fa-solid fa-film text-purple-400 text-[8px]"></i>
                     Chất Lượng:
                   </span>
                   <button
                     type="button"
                     onClick={() => {
                       const qualities: ('low' | 'medium' | 'high' | 'ultra')[] = ['low', 'medium', 'high', 'ultra'];
                       const nextIdx = (qualities.indexOf(state.exportQuality || 'high') + 1) % qualities.length;
                       setState(s => ({ ...s, exportQuality: qualities[nextIdx] }));
                     }}
                     className="py-1 px-1.5 bg-slate-900 hover:bg-slate-800/90 rounded border border-slate-800 text-[8px] sm:text-[9px] font-mono font-bold text-amber-300 flex items-center justify-between transition-all"
                     title="Nhấp để chuyển đổi chất lượng: Low (2.5M) -> Medium (5M) -> High (8M) -> Ultra (14M)"
                   >
                     <span className="uppercase font-sans font-black">{state.exportQuality === 'ultra' ? 'Ultra' : state.exportQuality === 'high' ? 'High' : state.exportQuality === 'medium' ? 'Vừa' : 'Nhẹ'}</span>
                     <span className="text-slate-500 font-normal">
                       {state.exportQuality === 'ultra' ? '14M' : state.exportQuality === 'high' ? '8M' : state.exportQuality === 'medium' ? '5M' : '2.5M'}
                     </span>
                   </button>
                 </div>

               </div>

               {/* Info footer summary */}
               <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-500 px-1 font-mono">
                 <span>
                   Khung hình: <strong className="text-slate-300 font-sans">{state.exportRatio === '16:9' ? '1920x1080 (16:9)' : state.exportRatio === '1:1' ? '1080x1080 (1:1)' : '1080x1920 (9:16)'}</strong>
                 </span>
                 <span>
                   Codec: <strong className="text-purple-400 uppercase">{state.exportCodec === 'mp4' ? 'MP4 (H.264)' : state.exportCodec === 'webm_vp8' ? 'VP8' : state.exportCodec === 'webm_vp9' ? 'VP9' : 'Auto'}</strong>
                 </span>
               </div>
             </div>
          </div>
          {/* Audio element is rendered with a key based on URL to force a fresh instance on change */}
          <audio 
            key={state.audioUrl || 'empty-audio'}
            ref={audioRef} 
            src={state.audioUrl || undefined} 
            preload="auto"
            crossOrigin={state.audioUrl?.startsWith('http') && !state.audioUrl?.startsWith('blob:') ? 'anonymous' : undefined} 
          />
        </div>
        {isVisGalleryOpen && (
          <CommunityVisualizerGalleryModal
            isOpen={isVisGalleryOpen}
            onClose={() => setIsVisGalleryOpen(false)}
            currentCode={state.customVisualizerJs || ''}
            onImportVisualizer={(code, name) => {
              const cleaned = cleanCustomJsCode(code);
              setState(s => ({
                ...s,
                customVisualizerJs: cleaned,
                waveformStyle: 'custom_js',
                showWaveform: true
              }));
              setActiveVisPreset('');
              setImportedVisName(name);
            }}
          />
        )}
      </main>

      <footer className="mt-auto py-6 flex flex-col items-center gap-4 select-none border-t border-slate-900/50 w-full max-w-[1700px]">
        <div className="flex flex-wrap justify-center gap-4 md:gap-4">
          <a href="https://fcalgobot.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase hover:text-cyan-400 transition-colors duration-300">FCALGOBOT.COM</a>
          <a href="https://8a5.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase hover:text-indigo-400 transition-colors duration-300">8A5.COM</a>
          <a href="https://www.tiktok.com/@pulsevibe95" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase hover:text-fuchsia-400 transition-colors duration-300 flex items-center gap-2">
            <i className="fa-brands fa-tiktok"></i> @PULSEVIBE95
          </a>
        </div>
        <div className="text-slate-800 text-[10px] font-black tracking-[0.8em] text-center opacity-30">
          KARAOKE STUDIO MASTER MASTER &bull; VERSION 5.4 &bull; 2024
        </div>
      </footer>
    </div>
  );
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds === Infinity || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60); 
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default App;
