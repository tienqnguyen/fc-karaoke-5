import React, { useRef, useState, useEffect, useCallback } from 'react';

interface AudioTimelineTrimmerProps {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  enableTrim: boolean;
  onTrimChange: (updates: { trimStart?: number; trimEnd?: number; enableTrim?: boolean }) => void;
  enableFadeIn: boolean;
  fadeInDuration: number;
  onFadeInChange: (enabled: boolean, duration: number) => void;
  enableFadeOut: boolean;
  fadeOutDuration: number;
  onFadeOutChange: (enabled: boolean, duration: number) => void;
  onSeek: (time: number) => void;
  onPlayTrimRange: () => void;
  isPlaying: boolean;
}

export const AudioTimelineTrimmer: React.FC<AudioTimelineTrimmerProps> = ({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  enableTrim,
  onTrimChange,
  enableFadeIn,
  fadeInDuration,
  onFadeInChange,
  enableFadeOut,
  fadeOutDuration,
  onFadeOutChange,
  onSeek,
  onPlayTrimRange,
  isPlaying,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'seek' | null>(null);

  const safeDuration = duration > 0 ? duration : 100;
  const currentEnd = trimEnd > 0 && trimEnd <= safeDuration ? trimEnd : safeDuration;
  const currentStart = Math.max(0, Math.min(trimStart, currentEnd - 0.5));

  const startPercent = Math.min(100, Math.max(0, (currentStart / safeDuration) * 100));
  const endPercent = Math.min(100, Math.max(0, (currentEnd / safeDuration) * 100));
  const currentPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  // Compute simulated visual waveform peaks
  const waveformBars = React.useMemo(() => {
    const bars: number[] = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      // Create organic, music-like simulated peak heights
      const sin1 = Math.sin((i / count) * Math.PI * 4);
      const cos1 = Math.cos((i / count) * Math.PI * 6);
      const height = Math.abs(sin1 * 0.5 + cos1 * 0.3) + 0.2 + (Math.sin(i * 1.5) * 0.15);
      bars.push(Math.min(1, Math.max(0.15, height)));
    }
    return bars;
  }, []);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickX = Math.min(rect.width, Math.max(0, clientX - rect.left));
    const ratio = clickX / rect.width;
    const newTime = ratio * safeDuration;

    if (isDragging === 'start') {
      const clamped = Math.max(0, Math.min(newTime, currentEnd - 0.5));
      onTrimChange({ trimStart: clamped, enableTrim: true });
    } else if (isDragging === 'end') {
      const clamped = Math.min(safeDuration, Math.max(newTime, currentStart + 0.5));
      onTrimChange({ trimEnd: clamped, enableTrim: true });
    } else if (isDragging === 'seek') {
      onSeek(newTime);
    }
  }, [isDragging, safeDuration, currentStart, currentEnd, onTrimChange, onSeek]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
    const ratio = clickX / rect.width;
    onSeek(ratio * safeDuration);
  };

  const formatSec = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00.0";
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m}:${s.padStart(4, '0')}`;
  };

  const trimDuration = Math.max(0, currentEnd - currentStart);

  return (
    <div className="bg-slate-950/60 p-4 rounded-md border border-slate-800 space-y-5 shadow-2xl">
      {/* Header & Enable Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-scissors text-indigo-400"></i>
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">
            Audio Trim & Export Controls
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTrimChange({ enableTrim: !enableTrim })}
            className={`text-[10px] font-black px-4 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              enableTrim 
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${enableTrim ? 'fa-check' : 'fa-power-off'} text-[9px]`}></i>
            <span>{enableTrim ? 'TRIM ACTIVE' : 'FULL TRACK EXPORT'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Waveform Track with Draggable Range */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Start: {formatSec(currentStart)}</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 font-bold">End: {formatSec(currentEnd)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Trimmed Length:</span>
            <span className="bg-indigo-950/80 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-800/40">
              {formatSec(trimDuration)}
            </span>
          </div>
        </div>

        {/* The Waveform Bar & Handles */}
        <div 
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-16 w-full bg-slate-900/90 rounded-md border border-slate-800 cursor-pointer select-none overflow-hidden group shadow-inner"
        >
          {/* Simulated Waveform Bars */}
          <div className="absolute inset-0 flex items-center justify-between px-2 gap-0.5 pointer-events-none">
            {waveformBars.map((h, i) => {
              const barPos = (i / waveformBars.length) * 100;
              const isInTrim = barPos >= startPercent && barPos <= endPercent;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isInTrim 
                      ? 'bg-gradient-to-t from-cyan-500 to-indigo-400 opacity-90' 
                      : 'bg-slate-700 opacity-30'
                  }`}
                  style={{ height: `${h * 85}%` }}
                />
              );
            })}
          </div>

          {/* Dimmed Inactive Regions */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-slate-950/80 pointer-events-none backdrop-blur-[1px]"
            style={{ width: `${startPercent}%` }}
          />
          <div 
            className="absolute top-0 bottom-0 right-0 bg-slate-950/80 pointer-events-none backdrop-blur-[1px]"
            style={{ width: `${100 - endPercent}%` }}
          />

          {/* Active Highlight Window */}
          <div 
            className="absolute top-0 bottom-0 border-y-2 border-indigo-500/50 bg-indigo-500/10 pointer-events-none"
            style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
          />

          {/* Current Playhead Scrubber */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 pointer-events-none z-20 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            style={{ left: `${currentPercent}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-yellow-400 rounded-full shadow-md flex items-center justify-center">
              <div className="w-1 h-1 bg-slate-950 rounded-full"></div>
            </div>
          </div>

          {/* Left Handle: Trim Start */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); setIsDragging('start'); }}
            onTouchStart={(e) => { e.stopPropagation(); setIsDragging('start'); }}
            className="absolute top-0 bottom-0 w-6 -ml-3 cursor-ew-resize flex items-center justify-center z-30 group/handle"
            style={{ left: `${startPercent}%` }}
          >
            <div className="w-2.5 h-full bg-cyan-400 rounded-l shadow-lg border-y border-l border-cyan-300 flex items-center justify-center group-hover/handle:bg-cyan-300 transition-colors">
              <div className="w-0.5 h-4 bg-slate-950 rounded-full"></div>
            </div>
            {/* Tooltip badge */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-500 text-cyan-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Start: {formatSec(currentStart)}
            </div>
          </div>

          {/* Right Handle: Trim End */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); setIsDragging('end'); }}
            onTouchStart={(e) => { e.stopPropagation(); setIsDragging('end'); }}
            className="absolute top-0 bottom-0 w-6 -ml-3 cursor-ew-resize flex items-center justify-center z-30 group/handle"
            style={{ left: `${endPercent}%` }}
          >
            <div className="w-2.5 h-full bg-indigo-400 rounded-r shadow-lg border-y border-r border-indigo-300 flex items-center justify-center group-hover/handle:bg-indigo-300 transition-colors">
              <div className="w-0.5 h-4 bg-slate-950 rounded-full"></div>
            </div>
            {/* Tooltip badge */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-indigo-500 text-indigo-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              End: {formatSec(currentEnd)}
            </div>
          </div>
        </div>

        {/* Quick Trim Action Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTrimChange({ trimStart: Math.max(0, currentTime), enableTrim: true })}
              className="text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5"
              title="Set start trim marker to current playhead position"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-[9px]"></i>
              <span>Set Start ({formatSec(currentTime)})</span>
            </button>
            <button
              onClick={() => onTrimChange({ trimEnd: Math.min(safeDuration, currentTime), enableTrim: true })}
              className="text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5"
              title="Set end trim marker to current playhead position"
            >
              <i className="fa-solid fa-arrow-left-to-bracket text-[9px]"></i>
              <span>Set End ({formatSec(currentTime)})</span>
            </button>
            <button
              onClick={() => onTrimChange({ trimStart: 0, trimEnd: safeDuration, enableTrim: false })}
              className="text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 px-2.5 py-1.5 rounded-md transition-all"
              title="Reset trim to full song"
            >
              <i className="fa-solid fa-rotate-left mr-1"></i>
              Reset
            </button>
          </div>

          <button
            onClick={onPlayTrimRange}
            className="text-[10px] font-black bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 shadow-md"
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[9px]`}></i>
            <span>Preview Trimmed Range</span>
          </button>
        </div>
      </div>

      {/* Fade In and Fade Out Settings */}
      <div className="pt-3 border-t border-slate-800/80">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block flex items-center gap-1.5">
          <i className="fa-solid fa-sliders text-cyan-400"></i> Seamless Fade In & Fade Out Transitions
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fade In Control */}
          <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-chevron-right text-cyan-400"></i> Fade In (Intro)
              </span>
              <button
                onClick={() => onFadeInChange(!enableFadeIn, fadeInDuration)}
                className={`text-[8px] font-black px-2 py-0.5 rounded transition-all ${
                  enableFadeIn ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {enableFadeIn ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>Duration</span>
                <span className="text-cyan-400 font-bold">{fadeInDuration.toFixed(1)}s</span>
              </div>
              <input 
                type="range" 
                min="0.2" 
                max="5.0" 
                step="0.1" 
                disabled={!enableFadeIn}
                value={fadeInDuration} 
                onChange={(e) => onFadeInChange(enableFadeIn, parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-slate-800 rounded-full accent-cyan-400 appearance-none cursor-pointer disabled:opacity-40" 
              />
            </div>
            <div className="flex gap-1.5 pt-1">
              {[0.5, 1.0, 1.5, 2.0, 3.0].map((s) => (
                <button
                  key={s}
                  onClick={() => onFadeInChange(true, s)}
                  className={`flex-1 py-1 text-[8px] font-bold rounded border transition-all ${
                    enableFadeIn && Math.abs(fadeInDuration - s) < 0.05
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>

          {/* Fade Out Control */}
          <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-chevron-left text-indigo-400"></i> Fade Out (Outro)
              </span>
              <button
                onClick={() => onFadeOutChange(!enableFadeOut, fadeOutDuration)}
                className={`text-[8px] font-black px-2 py-0.5 rounded transition-all ${
                  enableFadeOut ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {enableFadeOut ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>Duration</span>
                <span className="text-indigo-400 font-bold">{fadeOutDuration.toFixed(1)}s</span>
              </div>
              <input 
                type="range" 
                min="0.2" 
                max="5.0" 
                step="0.1" 
                disabled={!enableFadeOut}
                value={fadeOutDuration} 
                onChange={(e) => onFadeOutChange(enableFadeOut, parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-slate-800 rounded-full accent-indigo-400 appearance-none cursor-pointer disabled:opacity-40" 
              />
            </div>
            <div className="flex gap-1.5 pt-1">
              {[0.5, 1.0, 1.5, 2.0, 3.0].map((s) => (
                <button
                  key={s}
                  onClick={() => onFadeOutChange(true, s)}
                  className={`flex-1 py-1 text-[8px] font-bold rounded border transition-all ${
                    enableFadeOut && Math.abs(fadeOutDuration - s) < 0.05
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioTimelineTrimmer;
