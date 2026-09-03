import React, { useState } from 'react';
import { 
  KaraokeState, 
  TimelineSegment, 
  SmartIntroCard, 
  SmartOutroCard, 
  SceneTransitionType, 
  IntroCardStyle 
} from '../types';

interface TimelineEditorProps {
  state: KaraokeState;
  setState: React.Dispatch<React.SetStateAction<KaraokeState>>;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
}

const TRANSITION_OPTIONS: { name: string; value: SceneTransitionType; icon: string }[] = [
  { name: 'Crossfade (Hòa tan mờ)', value: 'crossfade', icon: 'fa-wand-magic-sparkles' },
  { name: 'Zoom In (Phóng cận cảnh)', value: 'zoom_in', icon: 'fa-magnifying-glass-plus' },
  { name: 'Wipe Left (Gạt sang trái)', value: 'wipe_left', icon: 'fa-arrow-left' },
  { name: 'Wipe Right (Gạt sang phải)', value: 'wipe_right', icon: 'fa-arrow-right' },
  { name: 'RGB Glitch (Nhiễu điện tử)', value: 'glitch', icon: 'fa-bolt' },
  { name: 'Blur Dissolve (Mờ ảo diệu)', value: 'blur_dissolve', icon: 'fa-eye-slash' },
  { name: 'None (Cắt sắc nét)', value: 'none', icon: 'fa-scissors' },
];

const INTRO_STYLES: { name: string; value: IntroCardStyle; desc: string; icon: string }[] = [
  { name: 'Spotify Canvas Glass', value: 'spotify_glass', desc: 'Thẻ kính mờ viền xanh neon Spotify hiện đại', icon: 'fa-brands fa-spotify' },
  { name: 'Apple Music Minimal', value: 'apple_music_minimal', desc: 'Phong cách tối giản kính trắng thanh lịch', icon: 'fa-brands fa-apple' },
  { name: 'Neon Billboard Cyber', value: 'neon_billboard', desc: 'Bảng hiệu phát quang phong cách Cyberpunk', icon: 'fa-bolt' },
  { name: 'Retro Mixtape 80s', value: 'retro_mixtape', desc: 'Thẻ giấy ghi chú băng cassette cổ điển', icon: 'fa-tape' },
];

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  state,
  setState,
  currentTime,
  duration,
  onSeek,
  onTogglePlay,
  isPlaying
}) => {
  // Collapsed by default to not affect initial load speed
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'intro_outro' | 'canvas_gizmo'>('timeline');
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

  const totalDuration = duration > 0 ? duration : 180;
  const segments = state.timelineSegments || [];

  // Initialize default segments if empty
  const handleAutoGenerateSegments = () => {
    const dur = totalDuration;
    const introDur = Math.min(15, dur * 0.12);
    const v1Dur = dur * 0.22;
    const c1Dur = dur * 0.22;
    const v2Dur = dur * 0.22;
    const outroDur = dur - (introDur + v1Dur + c1Dur + v2Dur);

    const generated: TimelineSegment[] = [
      {
        id: 'seg-intro',
        name: 'Intro (Mở đầu)',
        startTime: 0,
        endTime: Math.round(introDur),
        backgroundImageUrl: state.backgroundImageUrl || '',
        backgroundType: 'image',
        transition: 'none',
        transitionDuration: 0.8
      },
      {
        id: 'seg-v1',
        name: 'Verse 1 (Đoạn 1)',
        startTime: Math.round(introDur),
        endTime: Math.round(introDur + v1Dur),
        backgroundImageUrl: state.backgroundImageUrl || '',
        backgroundType: 'image',
        transition: 'crossfade',
        transitionDuration: 1.0
      },
      {
        id: 'seg-c1',
        name: 'Chorus (Điệp khúc)',
        startTime: Math.round(introDur + v1Dur),
        endTime: Math.round(introDur + v1Dur + c1Dur),
        backgroundImageUrl: state.backgroundImageUrl || '',
        backgroundType: 'image',
        transition: 'zoom_in',
        transitionDuration: 1.2
      },
      {
        id: 'seg-v2',
        name: 'Verse 2 (Đoạn 2)',
        startTime: Math.round(introDur + v1Dur + c1Dur),
        endTime: Math.round(introDur + v1Dur + c1Dur + v2Dur),
        backgroundImageUrl: state.backgroundImageUrl || '',
        backgroundType: 'image',
        transition: 'blur_dissolve',
        transitionDuration: 1.0
      },
      {
        id: 'seg-outro',
        name: 'Outro (Kết bài)',
        startTime: Math.round(introDur + v1Dur + c1Dur + v2Dur),
        endTime: Math.round(dur),
        backgroundImageUrl: state.backgroundImageUrl || '',
        backgroundType: 'image',
        transition: 'crossfade',
        transitionDuration: 1.5
      }
    ];

    setState(s => ({
      ...s,
      timelineSegments: generated
    }));
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const start = lastSeg ? lastSeg.endTime : 0;
    const end = Math.min(totalDuration, start + 30);

    const newSeg: TimelineSegment = {
      id: `seg-${Date.now()}`,
      name: `Phân đoạn ${segments.length + 1}`,
      startTime: start,
      endTime: end,
      backgroundImageUrl: state.backgroundImageUrl || '',
      backgroundType: 'image',
      transition: 'crossfade',
      transitionDuration: 1.0
    };

    setState(s => ({
      ...s,
      timelineSegments: [...(s.timelineSegments || []), newSeg]
    }));
    setEditingSegmentId(newSeg.id);
  };

  const handleUpdateSegment = (id: string, updates: Partial<TimelineSegment>) => {
    setState(s => ({
      ...s,
      timelineSegments: (s.timelineSegments || []).map(seg => seg.id === id ? { ...seg, ...updates } : seg)
    }));
  };

  const handleDeleteSegment = (id: string) => {
    setState(s => ({
      ...s,
      timelineSegments: (s.timelineSegments || []).filter(seg => seg.id !== id)
    }));
    if (editingSegmentId === id) setEditingSegmentId(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Intro Card Defaults
  const introCard: SmartIntroCard = state.smartIntroCard || {
    enabled: true,
    style: 'spotify_glass',
    startTime: 0,
    duration: 4.5,
    title: state.musicPlayerTitle || 'Tên bài hát',
    artist: state.musicPlayerArtist || 'Ca sĩ thể hiện',
    composer: '',
    coverBy: '',
    albumOrTag: 'Official Audio Master',
    coverUrl: null,
    animation: 'slide_glass',
    x: 50,
    y: 20,
    scale: 1.0
  };

  // Outro Card Defaults
  const outroCard: SmartOutroCard = state.smartOutroCard || {
    enabled: true,
    duration: 5.0,
    mainText: 'CẢM ƠN BẠN ĐÃ LẮNG NGHE!',
    subText: 'Đăng ký kênh & Bật chuông để thưởng thức thêm nhiều bài hát hay',
    socialHandle: '@MusicChannel',
    animation: 'fade_rise'
  };

  return (
    <section className="bg-slate-900/90 rounded-xl border border-indigo-500/30 overflow-hidden shadow-2xl transition-all">
      {/* HEADER WITH ACCORDION TOGGLE (HIDDEN BY DEFAULT) */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors border-b border-indigo-900/40 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950">
            <i className="fa-solid fa-film text-sm"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-indigo-300">
                3. 🎬 Trình Biên Tập & Dựng Video (Timeline & Multi-Track)
              </h2>
              <span className="text-[9px] font-bold bg-indigo-900/70 text-indigo-200 border border-indigo-600/40 px-2 py-0.5 rounded-full">
                {segments.length > 0 ? `${segments.length} Phân Cảnh` : 'Chuyên nghiệp'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Đổi hình nền theo từng đoạn nhạc (Verse/Chorus), hiệu ứng chuyển cảnh, thẻ Intro/Outro & Kéo thả Gizmo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            {isOpen ? 'Thu gọn' : 'Mở trình dựng'}
          </span>
          <div className={`w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 transition-transform ${isOpen ? 'rotate-180 bg-indigo-600 text-white' : ''}`}>
            <i className="fa-solid fa-chevron-down text-xs"></i>
          </div>
        </div>
      </div>

      {/* EXPANDABLE EDITING WORKSPACE */}
      {isOpen && (
        <div className="p-4 md:p-6 space-y-6 animate-fadeIn">
          {/* NAVIGATION SUB-TABS */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-timeline"></i>
              <span>Mini Timeline Multi-Layer ({segments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('intro_outro')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'intro_outro'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-id-card"></i>
              <span>Smart Intro / Outro Card Maker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('canvas_gizmo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'canvas_gizmo'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-up-down-left-right"></i>
              <span>Kéo Thả Trực Tiếp (Canvas Gizmo)</span>
            </button>
          </div>

          {/* TAB 1: MINI TIMELINE MULTI-LAYER */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* TIMELINE CONTROLS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs ml-0.5`}></i>
                  </button>
                  <div>
                    <span className="font-mono text-sm font-black text-white">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-slate-500 text-xs font-mono"> / {formatTime(totalDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerateSegments}
                    className="px-3 py-1.5 rounded-md bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-600/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles text-purple-300"></i>
                    <span>Tự Động Phân Đoạn (Intro - Verse - Chorus)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSegment}
                    className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm Cảnh Mới</span>
                  </button>
                </div>
              </div>

              {/* MULTI-TRACK VISUAL TIMELINE STRIP */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative overflow-x-auto shadow-inner">
                {/* Time Ruler */}
                <div className="relative h-6 border-b border-slate-800 text-[9px] font-mono text-slate-500 flex justify-between px-1">
                  <span>0:00</span>
                  <span>{formatTime(totalDuration * 0.25)}</span>
                  <span>{formatTime(totalDuration * 0.5)}</span>
                  <span>{formatTime(totalDuration * 0.75)}</span>
                  <span>{formatTime(totalDuration)}</span>

                  {/* Playhead Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                    style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                  >
                    <div className="w-2.5 h-2.5 bg-red-500 rotate-45 -ml-1 -top-1 absolute shadow-md shadow-red-500/50"></div>
                  </div>
                </div>

                {/* TRACK 1: BACKGROUND SCENES & SEGMENTS */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-indigo-400">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-image"></i> Track 1: Phân Cảnh & Hình Nền (Scenes)
                    </span>
                    <span className="text-slate-500 text-[9px]">Click vào khối để sửa ảnh/hiệu ứng</span>
                  </div>

                  <div className="relative h-14 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex">
                    {segments.length === 0 ? (
                      <div 
                        onClick={handleAutoGenerateSegments}
                        className="w-full h-full flex items-center justify-center text-xs text-slate-400 hover:text-indigo-300 cursor-pointer border border-dashed border-slate-700 hover:border-indigo-500 rounded-lg transition-all"
                      >
                        <i className="fa-solid fa-plus-circle mr-2"></i> Chưa có phân cảnh nào. Nhấn để tạo nhanh Intro / Verse / Chorus
                      </div>
                    ) : (
                      segments.map((seg, idx) => {
                        const startPct = (seg.startTime / totalDuration) * 100;
                        const widthPct = Math.max(5, ((seg.endTime - seg.startTime) / totalDuration) * 100);
                        const isSelected = editingSegmentId === seg.id;
                        const isCurrent = currentTime >= seg.startTime && currentTime <= seg.endTime;

                        const colors = [
                          'from-blue-900/80 to-indigo-900/80 border-blue-500',
                          'from-purple-900/80 to-fuchsia-900/80 border-purple-500',
                          'from-amber-900/80 to-orange-900/80 border-amber-500',
                          'from-emerald-900/80 to-teal-900/80 border-emerald-500',
                          'from-rose-900/80 to-pink-900/80 border-rose-500',
                        ];
                        const colorClass = colors[idx % colors.length];

                        return (
                          <div
                            key={seg.id}
                            onClick={() => setEditingSegmentId(seg.id)}
                            style={{
                              left: `${startPct}%`,
                              width: `${widthPct}%`,
                              position: 'absolute'
                            }}
                            className={`h-full bg-gradient-to-r ${colorClass} border-r-2 border-t-2 border-b-2 p-1.5 flex flex-col justify-between cursor-pointer transition-all hover:brightness-125 ${
                              isSelected ? 'ring-2 ring-white z-10' : ''
                            } ${isCurrent ? 'shadow-lg shadow-indigo-500/30' : 'opacity-85'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white truncate drop-shadow">
                                {seg.name}
                              </span>
                              {seg.transition !== 'none' && (
                                <span className="text-[7.5px] font-mono bg-black/50 text-slate-200 px-1 rounded">
                                  {seg.transition}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-300">
                              <span>{formatTime(seg.startTime)}</span>
                              <span>{formatTime(seg.endTime)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* TRACK 2: INTRO & OUTRO CARDS */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-purple-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-id-card"></i> Track 2: Thẻ Giới Thiệu Intro & Outro
                  </div>
                  <div className="relative h-8 bg-slate-900/80 rounded-lg border border-slate-800/80 overflow-hidden">
                    {introCard.enabled && (
                      <div
                        style={{
                          left: `${((introCard.startTime || 0) / totalDuration) * 100}%`,
                          width: `${((introCard.duration || 4.5) / totalDuration) * 100}%`,
                          position: 'absolute'
                        }}
                        className="h-full bg-emerald-600/60 border border-emerald-400/80 rounded px-2 flex items-center justify-between text-[9px] font-bold text-white shadow"
                      >
                        <span className="truncate">🎵 Intro: {introCard.title}</span>
                        <span className="font-mono text-[8px] text-emerald-200">{introCard.duration}s</span>
                      </div>
                    )}

                    {outroCard.enabled && (
                      <div
                        style={{
                          right: '0%',
                          width: `${((outroCard.duration || 5.0) / totalDuration) * 100}%`,
                          position: 'absolute'
                        }}
                        className="h-full bg-rose-600/60 border border-rose-400/80 rounded px-2 flex items-center justify-between text-[9px] font-bold text-white shadow"
                      >
                        <span className="truncate">👋 Outro: Kết bài</span>
                        <span className="font-mono text-[8px] text-rose-200">{outroCard.duration}s</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TRACK 3: LYRIC LINES SPREAD */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-music"></i> Track 3: Lời Bài Hát (Synced LRC Lyrics)
                  </div>
                  <div className="relative h-6 bg-slate-900/60 rounded-md border border-slate-800/60 overflow-hidden flex items-center px-2">
                    <div className="w-full flex gap-1 h-2">
                      {state.lrcLines.map((line, i) => {
                        const pct = (line.time / totalDuration) * 100;
                        return (
                          <div 
                            key={i} 
                            style={{ left: `${pct}%`, position: 'absolute' }} 
                            className="w-1.5 h-3 bg-amber-400/70 rounded-full"
                            title={`${formatTime(line.time)}: ${line.text}`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEGMENT INSPECTOR / EDITOR PANEL */}
              {editingSegmentId && (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-indigo-500/40 space-y-4 shadow-xl animate-fadeIn">
                  {(() => {
                    const seg = segments.find(s => s.id === editingSegmentId);
                    if (!seg) return null;

                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                              Chỉnh Sửa Phân Cảnh: {seg.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSegment(seg.id)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-950/50 border border-rose-800/40 rounded transition-all"
                          >
                            <i className="fa-solid fa-trash mr-1"></i> Xóa phân đoạn
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Segment Name */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300">Tên đoạn nhạc</label>
                            <input
                              type="text"
                              value={seg.name}
                              onChange={(e) => handleUpdateSegment(seg.id, { name: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                              placeholder="VD: Chorus (Điệp khúc)"
                            />
                          </div>

                          {/* Start Time */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300">Bắt đầu (Giây)</label>
                            <input
                              type="number"
                              min="0"
                              max={totalDuration}
                              step="0.5"
                              value={seg.startTime}
                              onChange={(e) => handleUpdateSegment(seg.id, { startTime: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                            />
                          </div>

                          {/* End Time */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300">Kết thúc (Giây)</label>
                            <input
                              type="number"
                              min="0"
                              max={totalDuration}
                              step="0.5"
                              value={seg.endTime}
                              onChange={(e) => handleUpdateSegment(seg.id, { endTime: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                            />
                          </div>

                          {/* Transition Type */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300">Hiệu ứng chuyển cảnh</label>
                            <select
                              value={seg.transition}
                              onChange={(e) => handleUpdateSegment(seg.id, { transition: e.target.value as SceneTransitionType })}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                            >
                              {TRANSITION_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Background Image for this segment */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-indigo-300 flex items-center justify-between">
                            <span>Link Ảnh Nền / Video cho phân đoạn này</span>
                            <span className="text-slate-500 font-mono text-[9px]">URL trực tiếp hoặc blob</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={seg.backgroundImageUrl}
                              onChange={(e) => handleUpdateSegment(seg.id, { backgroundImageUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onSeek(seg.startTime);
                              }}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold"
                            >
                              <i className="fa-solid fa-play mr-1"></i> Nhảy đến đoạn này
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMART INTRO / OUTRO CARD MAKER */}
          {activeTab === 'intro_outro' && (
            <div className="space-y-6">
              {/* INTRO CARD SECTION */}
              <div className="bg-slate-950/70 p-4 md:p-5 rounded-xl border border-emerald-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <i className="fa-solid fa-play"></i>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                        Thẻ Giới Thiệu Đầu Bài (Smart Intro Card)
                      </h3>
                      <p className="text-[10px] text-slate-400">Hiện thông tin bài hát chuẩn Spotify Canvas / Apple Music</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setState(s => ({
                      ...s,
                      smartIntroCard: {
                        ...introCard,
                        enabled: !introCard.enabled
                      }
                    }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      introCard.enabled
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {introCard.enabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                  </button>
                </div>

                {introCard.enabled && (
                  <div className="space-y-4">
                    {/* Style Presets */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-300">Phong cách hiển thị (Card Style)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {INTRO_STYLES.map(st => {
                          const isAct = introCard.style === st.value;
                          return (
                            <button
                              key={st.value}
                              type="button"
                              onClick={() => setState(s => ({
                                ...s,
                                smartIntroCard: { ...introCard, style: st.value }
                              }))}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                isAct
                                  ? 'bg-emerald-950/70 border-emerald-400 text-white ring-1 ring-emerald-400'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <i className={`${st.icon} text-xs ${isAct ? 'text-emerald-400' : 'text-slate-400'}`}></i>
                                <span className="text-[10px] font-bold text-white">{st.name}</span>
                              </div>
                              <p className="text-[8.5px] leading-tight text-slate-400">{st.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300">Tên bài hát</label>
                        <input
                          type="text"
                          value={introCard.title}
                          onChange={(e) => setState(s => ({
                            ...s,
                            smartIntroCard: { ...introCard, title: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300">Ca sĩ / Nghệ sĩ</label>
                        <input
                          type="text"
                          value={introCard.artist}
                          onChange={(e) => setState(s => ({
                            ...s,
                            smartIntroCard: { ...introCard, artist: e.target.value }
                          }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300">Sáng tác (Nhạc sĩ)</label>
                        <input
                          type="text"
                          value={introCard.composer || ''}
                          onChange={(e) => setState(s => ({
                            ...s,
                            smartIntroCard: { ...introCard, composer: e.target.value }
                          }))}
                          placeholder="VD: Trịnh Công Sơn"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300">Cover by / Producer</label>
                        <input
                          type="text"
                          value={introCard.coverBy || ''}
                          onChange={(e) => setState(s => ({
                            ...s,
                            smartIntroCard: { ...introCard, coverBy: e.target.value }
                          }))}
                          placeholder="VD: Acoustic Chill"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Duration & Timing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-300">
                          <span>Thời gian xuất hiện (Intro Duration)</span>
                          <span className="font-mono text-emerald-400">{introCard.duration}s</span>
                        </div>
                        <input
                          type="range"
                          min="2.0"
                          max="10.0"
                          step="0.5"
                          value={introCard.duration}
                          onChange={(e) => setState(s => ({
                            ...s,
                            smartIntroCard: { ...introCard, duration: parseFloat(e.target.value) }
                          }))}
                          className="w-full h-1.5 bg-slate-800 rounded-full accent-emerald-500 appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-300">
                          <span>Kích thước thẻ (Scale)</span>
                          <span className="font-mono text-emerald-400">{(introCard.scale || 1.0).toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="1.5"
                          step="0.05"
                          value={introCard.scale || 1.0}
                          onChange={(e) => setState(s => ({
                            ...s,
                            smartIntroCard: { ...introCard, scale: parseFloat(e.target.value) }
                          }))}
                          className="w-full h-1.5 bg-slate-800 rounded-full accent-emerald-500 appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* OUTRO CARD SECTION */}
              <div className="bg-slate-950/70 p-4 md:p-5 rounded-xl border border-rose-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <i className="fa-solid fa-flag-checkered"></i>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-rose-300">
                        Thẻ Kết Thúc Video (Smart Outro Card)
                      </h3>
                      <p className="text-[10px] text-slate-400">Lời cảm ơn & kêu gọi đăng ký kênh ở cuối bài hát</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setState(s => ({
                      ...s,
                      smartOutroCard: {
                        ...outroCard,
                        enabled: !outroCard.enabled
                      }
                    }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      outroCard.enabled
                        ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-950'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {outroCard.enabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                  </button>
                </div>

                {outroCard.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300">Dòng thông điệp chính</label>
                      <input
                        type="text"
                        value={outroCard.mainText}
                        onChange={(e) => setState(s => ({
                          ...s,
                          smartOutroCard: { ...outroCard, mainText: e.target.value }
                        }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300">Thông điệp phụ (CTA)</label>
                      <input
                        type="text"
                        value={outroCard.subText}
                        onChange={(e) => setState(s => ({
                          ...s,
                          smartOutroCard: { ...outroCard, subText: e.target.value }
                        }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300">Tên Kênh / Social Handle</label>
                      <input
                        type="text"
                        value={outroCard.socialHandle || ''}
                        onChange={(e) => setState(s => ({
                          ...s,
                          smartOutroCard: { ...outroCard, socialHandle: e.target.value }
                        }))}
                        placeholder="@AcousticChillMusic"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CANVAS GIZMO & DRAG CONTROLS */}
          {activeTab === 'canvas_gizmo' && (
            <div className="bg-slate-950/80 p-4 md:p-5 rounded-xl border border-cyan-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <i className="fa-solid fa-arrows-up-down-left-right"></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      Tùy Chỉnh Kéo Thả Trực Tiếp (Interactive Canvas Gizmo)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Click và kéo trực tiếp trên màn hình xem trước để chỉnh vị trí, xoay góc & độ phóng to
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setState(s => ({
                    ...s,
                    enableCanvasInteractiveMode: !s.enableCanvasInteractiveMode
                  }))}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    state.enableCanvasInteractiveMode
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-950'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <i className="fa-solid fa-hand-pointer mr-1.5"></i>
                  {state.enableCanvasInteractiveMode ? 'CHẾ ĐỘ KÉO THẢ: ĐANG BẬT' : 'BẬT KÉO THẢ TRÊN CANVAS'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Element 1: Logo / Sticker */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-stamp"></i> Logo / Sticker
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono">
                    X: {state.logoX}% | Y: {state.logoY}% | Size: {state.logoSize}px
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, logoX: 50, logoY: 10 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Căn Giữa Trên
                    </button>
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, logoX: 85, logoY: 5 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Góc Phải
                    </button>
                  </div>
                </div>

                {/* Element 2: Waveform Visualizer */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-wave-square"></i> Waveform Sóng Nhạc
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono">
                    X: {state.waveformX}% | Y: {state.waveformPosition}% | Rộng: {state.waveformWidth}%
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, waveformPosition: 85, waveformX: 50, waveformWidth: 100 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Đáy màn hình
                    </button>
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, waveformPosition: 50, waveformX: 50, waveformWidth: 90 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Chính Giữa
                    </button>
                  </div>
                </div>

                {/* Element 3: Karaoke Lyrics */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-font"></i> Lời Bài Hát (Lyric)
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono">
                    X: {state.lyricX}% | Y: {state.lyricPosition}% | Font: {state.fontSize}px
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, lyricPosition: 50, lyricX: 50 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Tâm Màn Hình
                    </button>
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, lyricPosition: 75, lyricX: 50 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Dưới Đáy (Sub)
                    </button>
                  </div>
                </div>

                {/* Element 4: On-Video Music Player HUD */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-compact-disc"></i> Player HUD
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono">
                    X: {state.musicPlayerX ?? 50}% | Y: {state.musicPlayerY ?? 78}% | Scale: {state.musicPlayerScale ?? 1.0}x
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, musicPlayerX: 50, musicPlayerY: 78 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Đáy Chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => setState(s => ({ ...s, musicPlayerX: 50, musicPlayerY: 50 }))}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                    >
                      Tâm Giữa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TimelineEditor;
