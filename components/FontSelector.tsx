import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FontOption, VIETNAMESE_FONT_CATEGORIES, lazyLoadGoogleFont, lazyLoadFontBatch } from '../utils/fontLoader';

export type { FontOption } from '../utils/fontLoader';

interface FontSelectorProps {
  value: string;
  onChange: (val: string) => void;
  options: FontOption[];
  onAddCustom: (urlOrName: string) => void;
  align?: 'left' | 'right' | 'auto';
  dropdownClassName?: string;
}

export const DEMO_MULTI_FONT_URL = "https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Playwrite+CZ:wght@100..400&family=Playwrite+MX:wght@100..400&family=Roboto:ital,wght@0,100..900;1,100..900&family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap";

const SAMPLE_TEXT_OPTIONS = [
  "Tình Đầu Tình Cuối 123",
  "Nơi Này Có Anh ♪ 2026",
  "Karaoke Studio Master",
  "ABCDE abcde 0123456789"
];

export const FontSelector: React.FC<FontSelectorProps> = ({ 
  value, 
  onChange, 
  options, 
  onAddCustom,
  align = 'auto',
  dropdownClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCompact, setIsCompact] = useState(true);
  const [sampleTextIdx, setSampleTextIdx] = useState(0);
  const [calculatedAlign, setCalculatedAlign] = useState<'left' | 'right' | 'center'>('left');
  const [showImportUrl, setShowImportUrl] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lazy load active font immediately
  useEffect(() => {
    if (value) {
      lazyLoadGoogleFont(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (align === 'right') {
        setCalculatedAlign('right');
      } else if (align === 'left') {
        setCalculatedAlign('left');
      } else if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        if (screenWidth < 640) {
          setCalculatedAlign('left');
        } else if (rect.right > screenWidth - 320 || rect.left > screenWidth / 2) {
          setCalculatedAlign('right');
        } else {
          setCalculatedAlign('left');
        }
      }
      
      // Only auto-focus search input on desktop/laptop to prevent mobile keyboard popping up and blocking touch taps
      const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      if (window.innerWidth >= 768 && !isTouchDevice && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }

      // Progressive lazy load initial batch of visible fonts
      const topBatch = options.slice(0, 16).map(o => o.value);
      lazyLoadFontBatch(topBatch);
    }
  }, [isOpen, align, options]);

  const handleAdd = () => {
    if (!customUrl.trim()) return;
    onAddCustom(customUrl.trim());
    setCustomUrl('');
    setShowImportUrl(false);
  };

  const handleDemoImport = () => {
    onAddCustom(DEMO_MULTI_FONT_URL);
    setShowImportUrl(false);
  };

  const handleSelectFont = (fontVal: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    lazyLoadGoogleFont(fontVal);
    onChange(fontVal);
    setIsOpen(false);
  };

  const filteredOptions = useMemo(() => {
    let result = options;
    if (selectedCategory !== 'all') {
      result = result.filter(o => o.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.name.toLowerCase().includes(q) || 
        o.value.toLowerCase().includes(q) ||
        (o.categoryLabel && o.categoryLabel.toLowerCase().includes(q))
      );
    }
    return result;
  }, [options, selectedCategory, searchQuery]);

  const selectedName = options.find(o => o.value === value)?.name || value;
  const currentSampleText = SAMPLE_TEXT_OPTIONS[sampleTextIdx] || SAMPLE_TEXT_OPTIONS[0];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Font Trigger Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-md p-2.5 sm:p-3 text-xs outline-none cursor-pointer flex justify-between items-center transition-all shadow-sm group active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
          <span className="font-semibold text-slate-200 truncate text-[11px] sm:text-xs" style={{ fontFamily: value }}>
            {selectedName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0">
          <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider opacity-60">Font</span>
          <i className={`fa-solid fa-chevron-down text-[10px] sm:text-xs transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}></i>
        </div>
      </button>

      {/* Compact & Mobile-Optimized Dropdown Popup Panel */}
      {isOpen && (
        <div 
          onClick={e => e.stopPropagation()}
          className={`absolute top-full mt-1.5 ${
            calculatedAlign === 'right' 
              ? 'right-0 left-auto origin-top-right' 
              : 'left-0 right-auto origin-top-left'
          } w-[calc(100vw-36px)] sm:w-[450px] md:w-[500px] max-w-[520px] z-[120] bg-slate-900/98 backdrop-blur-2xl border border-slate-700/90 rounded-xl sm:rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          
          {/* Header & Controls - Super Compact for Mobile */}
          <div className="p-2 sm:p-2.5 border-b border-slate-800 bg-slate-950/90 space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1 truncate">
                  <i className="fa-solid fa-font text-xs"></i> 
                  <span>Font Tiếng Việt ({filteredOptions.length})</span>
                </span>
                
                {/* Compact Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsCompact(!isCompact)}
                  className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[8.5px] font-bold border transition-colors flex items-center gap-1 ${
                    isCompact 
                      ? 'bg-cyan-950 border-cyan-700 text-cyan-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={isCompact ? "Chế độ siêu gọn" : "Chế độ chuẩn"}
                >
                  <i className={`fa-solid ${isCompact ? 'fa-table-cells-large' : 'fa-list'} text-[8px]`}></i>
                  <span>{isCompact ? 'Gọn' : 'Thoáng'}</span>
                </button>

                {/* Sample Text Switcher */}
                <button
                  type="button"
                  onClick={() => setSampleTextIdx((sampleTextIdx + 1) % SAMPLE_TEXT_OPTIONS.length)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[8px] sm:text-[8.5px] text-slate-300 transition-colors flex items-center gap-1"
                  title="Đổi chữ mẫu xem trước"
                >
                  <i className="fa-solid fa-rotate text-[8px] text-cyan-400"></i>
                  <span className="truncate max-w-[65px] sm:max-w-[90px] font-mono text-[8px]">{currentSampleText.slice(0, 8)}..</span>
                </button>
              </div>

              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center text-xs transition-colors shrink-0"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar touch-pan-x">
              {VIETNAMESE_FONT_CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 sm:py-1 rounded text-[8.5px] sm:text-[9px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 shrink-0 ${
                      isActive 
                        ? 'bg-cyan-600 text-white shadow-sm' 
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <i className={`fa-solid ${cat.icon} text-[7.5px]`}></i>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Search Box */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]"></i>
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Tìm tên font (Dancing Script, Playfair, Lora, Oswald, Be Vietnam...)" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded pl-7 pr-7 py-1 text-[11px] text-slate-200 outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Font List Grid (Compact Native Buttons for 100% Responsive Mobile Touch) */}
          <div className={`max-h-[180px] sm:max-h-[260px] overflow-y-auto p-1.5 sm:p-2 grid ${
            isCompact 
              ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-1.5' 
              : 'grid-cols-1 sm:grid-cols-2 gap-1.5'
          } custom-scrollbar overscroll-contain`}>
            {filteredOptions.length === 0 ? (
              <div className="col-span-full py-4 text-center text-slate-500 text-xs font-medium">
                <i className="fa-solid fa-font-awesome text-lg mb-1 opacity-40 block"></i>
                Không tìm thấy font "{searchQuery}".
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = value === opt.value;
                return (
                  <button 
                    key={opt.value} 
                    type="button"
                    onClick={(e) => handleSelectFont(opt.value, e)}
                    onTouchStart={() => lazyLoadGoogleFont(opt.value)}
                    onMouseEnter={() => lazyLoadGoogleFont(opt.value)}
                    className={`rounded border text-left cursor-pointer transition-all flex flex-col justify-between select-none active:scale-[0.98] ${
                      isCompact ? 'p-1 sm:p-1.5 gap-0.5' : 'p-2 sm:p-2.5 gap-1'
                    } ${
                      isSelected 
                        ? 'bg-cyan-950 border-cyan-400 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-500/60' 
                        : 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className={`font-bold text-slate-300 truncate ${
                        isCompact ? 'text-[9px] sm:text-[9.5px]' : 'text-[10px] sm:text-[10.5px]'
                      }`}>
                        {opt.name}
                      </span>
                      {isSelected ? (
                        <span className="text-[7px] bg-cyan-500/30 text-cyan-300 font-black px-1 py-0.2 rounded border border-cyan-500/40 shrink-0">
                          ✓
                        </span>
                      ) : opt.isPopular ? (
                        <span className="text-[6.5px] bg-amber-500/20 text-amber-400 font-bold px-1 py-0.2 rounded shrink-0">
                          ★
                        </span>
                      ) : null}
                    </div>

                    {/* Category Label Subtext */}
                    {opt.categoryLabel && (
                      <span className="text-[7.5px] text-slate-500 truncate -mt-0.5">
                        {opt.categoryLabel}
                      </span>
                    )}

                    {/* Live Vietnamese Preview Text - Scaled for Mobile Compactness */}
                    <div 
                      style={{ fontFamily: opt.value }}
                      className={`truncate leading-tight w-full ${
                        isCompact 
                          ? 'text-[10.5px] sm:text-xs pt-0.5' 
                          : 'text-xs sm:text-sm pt-0.5'
                      } ${isSelected ? 'text-cyan-200 font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}
                    >
                      {currentSampleText}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Import Google Font URL / Font Name Section - Collapsible on Mobile */}
          <div className="border-t border-slate-800 bg-slate-950/95">
            {!showImportUrl ? (
              <div className="p-1.5 sm:p-2 flex items-center justify-between gap-2 text-[8.5px] sm:text-[9px]">
                <button
                  type="button"
                  onClick={() => setShowImportUrl(true)}
                  className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                >
                  <i className="fa-solid fa-cloud-arrow-down text-[10px]"></i>
                  <span>+ Thêm URL Google Fonts tùy biến</span>
                </button>
                <button
                  type="button"
                  onClick={handleDemoImport}
                  className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <i className="fa-solid fa-bolt text-yellow-400 text-[8px]"></i>
                  <span>Nạp bộ demo font</span>
                </button>
              </div>
            ) : (
              <div className="p-2 sm:p-2.5 space-y-1.5 animate-in fade-in duration-100">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <i className="fa-solid fa-cloud-arrow-down text-indigo-400"></i> 
                    <span>Nhập URL Google Fonts</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <a 
                      href="https://fonts.google.com/?preview.layout=sample&lang=vi_Latn&preview.lang=vi_Latn" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[8px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Kho Font</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[7px]"></i>
                    </a>
                    <button 
                      type="button"
                      onClick={() => setShowImportUrl(false)}
                      className="text-slate-500 hover:text-slate-300 text-[10px]"
                    >
                      <i className="fa-solid fa-chevron-up"></i>
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Dán URL (fonts.googleapis.com/...)" 
                    value={customUrl} 
                    onChange={e => setCustomUrl(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 outline-none focus:border-cyan-500" 
                  />
                  <button 
                    type="button"
                    onClick={handleAdd} 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase transition-colors shrink-0"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default FontSelector;


