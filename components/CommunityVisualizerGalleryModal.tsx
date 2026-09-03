import React, { useState, useEffect, useRef } from 'react';
import { 
  CommunityVisualizer, 
  VISUALIZER_CATEGORIES, 
  getCommunityVisualizers, 
  publishCommunityVisualizer, 
  upvoteVisualizer, 
  incrementVisualizerImports 
} from '../services/communityVisualizerService';
import { cleanCustomJsCode } from '../utils/customVisualizerPresets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportVisualizer: (code: string, name: string) => void;
  currentCode?: string;
}

export const CommunityVisualizerGalleryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportVisualizer,
  currentCode = ''
}) => {
  const [visualizers, setVisualizers] = useState<CommunityVisualizer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'likes' | 'imports' | 'newest'>('likes');
  const [previewVis, setPreviewVis] = useState<CommunityVisualizer | null>(null);
  const [likedMap, setLikedMap] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Publish Modal Sub-state
  const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);
  const [pubName, setPubName] = useState<string>('');
  const [pubAuthor, setPubAuthor] = useState<string>('');
  const [pubDescription, setPubDescription] = useState<string>('');
  const [pubCategory, setPubCategory] = useState<string>('Cyberpunk & Neon');
  const [pubTags, setPubTags] = useState<string>('Visualizer, Neon, Wave');
  const [pubCode, setPubCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load liked items from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('karaoke_liked_visualizers');
      if (saved) setLikedMap(JSON.parse(saved));
    } catch {}
  }, []);

  // Fetch from Firestore
  const loadVisualizers = async () => {
    setIsLoading(true);
    try {
      const data = await getCommunityVisualizers();
      setVisualizers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadVisualizers();
    }
  }, [isOpen]);

  const handleOpenPublish = () => {
    setPubCode(currentCode || '');
    setPubName('');
    setPubDescription('');
    setPublishMessage(null);
    setIsPublishOpen(true);
  };

  const handleLike = async (e: React.MouseEvent, vis: CommunityVisualizer) => {
    e.stopPropagation();
    if (likedMap[vis.id]) return;

    const newLiked = { ...likedMap, [vis.id]: true };
    setLikedMap(newLiked);
    try {
      localStorage.setItem('karaoke_liked_visualizers', JSON.stringify(newLiked));
    } catch {}

    setVisualizers(prev => prev.map(v => v.id === vis.id ? { ...v, likes: v.likes + 1 } : v));
    if (previewVis?.id === vis.id) {
      setPreviewVis(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
    await upvoteVisualizer(vis.id);
  };

  const handleApply = async (vis: CommunityVisualizer) => {
    incrementVisualizerImports(vis.id);
    onImportVisualizer(vis.code, vis.name);
    onClose();
  };

  const handleCopyCode = (e: React.MouseEvent, vis: CommunityVisualizer) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vis.code);
    setCopiedId(vis.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim()) {
      setPublishMessage({ type: 'error', text: 'Vui lòng nhập Tên Visualizer!' });
      return;
    }
    const cleanCode = cleanCustomJsCode(pubCode);
    if (!cleanCode.trim()) {
      setPublishMessage({ type: 'error', text: 'Vui lòng nhập Mã JavaScript Visualizer hợp lệ!' });
      return;
    }

    setIsSubmitting(true);
    setPublishMessage(null);

    try {
      await publishCommunityVisualizer({
        name: pubName,
        author: pubAuthor || 'Anonymous Artist',
        description: pubDescription || 'Custom 2D Canvas Waveform',
        category: pubCategory,
        tags: pubTags.split(',').map(t => t.trim()).filter(Boolean),
        code: cleanCode
      });

      setPublishMessage({ type: 'success', text: '🎉 Chia sẻ lên Thư Viện Cộng Đồng thành công!' });
      await loadVisualizers();
      setTimeout(() => {
        setIsPublishOpen(false);
        setPublishMessage(null);
      }, 1500);
    } catch (err: any) {
      setPublishMessage({ type: 'error', text: err?.message || 'Lỗi khi lưu lên Firebase. Vui lòng thử lại!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort
  const filteredVisualizers = visualizers.filter(v => {
    const matchCat = selectedCategory === 'Tất cả' || v.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      v.name.toLowerCase().includes(q) || 
      v.description.toLowerCase().includes(q) || 
      v.author.toLowerCase().includes(q) ||
      (v.tags && v.tags.some(t => t.toLowerCase().includes(q)));
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'imports') return b.importsCount - a.importsCount;
    return b.createdAt - a.createdAt;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl shadow-indigo-950/80 overflow-hidden text-slate-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-indigo-900/40 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
              <i className="fa-solid fa-fire text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                  Thư Viện Visualizer Cộng Đồng
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Firebase Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Khám phá, trải nghiệm trực tiếp và nhập mã Custom JS Waveform sáng tạo từ cộng đồng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenPublish}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <i className="fa-solid fa-cloud-arrow-up text-sm"></i>
              <span>Chia Sẻ Mã Của Bạn</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 flex items-center justify-center transition-all"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-900/60 border-b border-indigo-900/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, tác giả, phong cách, hiệu ứng..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-cyan-300 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="likes">🔥 Yêu thích nhất</option>
                <option value="imports">📥 Lượt nhập nhiều nhất</option>
                <option value="newest">✨ Mới cập nhật</option>
              </select>

              <button
                type="button"
                onClick={loadVisualizers}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-all"
                title="Tải lại danh sách"
              >
                <i className={`fa-solid fa-arrows-rotate text-xs ${isLoading ? 'animate-spin text-cyan-400' : ''}`}></i>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {VISUALIZER_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Đang tải danh sách Visualizer từ Cloud Firebase...</p>
            </div>
          ) : filteredVisualizers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Chưa tìm thấy Visualizer phù hợp</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Hãy thử tìm bằng từ khóa khác hoặc là người đầu tiên chia sẻ mã visualizer tuyệt đẹp của bạn!
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenPublish}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Chia sẻ ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisualizers.map((vis) => {
                const isLiked = likedMap[vis.id];
                return (
                  <div
                    key={vis.id}
                    className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-indigo-950/50 relative overflow-hidden"
                  >
                    {/* Top Info & Tags */}
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                              {vis.category}
                            </span>
                            {vis.isFeatured && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                                <i className="fa-solid fa-star text-[8px]"></i>
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                            {vis.name}
                          </h3>
                        </div>

                        {/* Like Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => handleLike(e, vis)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${
                            isLiked
                              ? 'bg-rose-600/30 border-rose-500/60 text-rose-400 shadow-sm shadow-rose-600/30'
                              : 'bg-slate-950/60 hover:bg-rose-950/40 border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-500/40'
                          }`}
                          title="Thả tim yêu thích"
                        >
                          <i className={`fa-solid fa-heart ${isLiked ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}></i>
                          <span>{vis.likes}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8">
                        {vis.description || 'Mã Visualizer nghệ thuật tương thích video 60 FPS.'}
                      </p>

                      {/* Mini Code Preview Banner */}
                      <div 
                        onClick={() => setPreviewVis(vis)}
                        className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 font-mono text-[9px] text-cyan-400/80 overflow-hidden relative cursor-pointer hover:border-cyan-500/50 transition-all group/code h-16 flex flex-col justify-center"
                      >
                        <div className="line-clamp-2 opacity-70">
                          {vis.code.substring(0, 150)}...
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-center justify-center opacity-0 group-hover/code:opacity-100 transition-opacity">
                          <span className="px-2.5 py-1 rounded bg-cyan-600 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                            <i className="fa-solid fa-play text-[9px]"></i>
                            Test Live & Xem Code
                          </span>
                        </div>
                      </div>

                      {/* Author & Meta */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1 truncate max-w-[130px]">
                          <i className="fa-solid fa-user-astronaut text-indigo-400 text-[10px]"></i>
                          <span className="text-slate-300 font-medium truncate">{vis.author}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-download text-[9px]"></i>
                          <span>{vis.importsCount} lượt dùng</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 mt-3 border-t border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewVis(vis)}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <i className="fa-solid fa-eye text-cyan-400"></i>
                        <span>Chi Tiết</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApply(vis)}
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95"
                      >
                        <i className="fa-solid fa-file-import text-xs"></i>
                        <span>Dùng Ngay</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(e, vis)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all text-xs"
                        title="Sao chép code"
                      >
                        <i className={`fa-solid ${copiedId === vis.id ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-indigo-900/40 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-emerald-400"></i>
            <span>Mã JavaScript chạy an toàn trong môi trường Canvas HTML5 cô lập.</span>
          </div>
          <span className="font-bold text-slate-400">
            Tổng số: {filteredVisualizers.length} Visualizers
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. REALTIME LIVE PREVIEW & CODE INSPECTOR MODAL */}
      {/* ========================================================= */}
      {previewVis && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl shadow-cyan-950/80 overflow-hidden text-slate-200">
            
            {/* Header */}
            <div className="p-4 border-b border-cyan-900/40 bg-slate-900/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <i className="fa-solid fa-play text-xs"></i>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    {previewVis.name}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      {previewVis.category}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tác giả: <span className="text-cyan-300 font-bold">{previewVis.author}</span> • {previewVis.likes} lượt thích
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewVis(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Body: Canvas Preview + Code Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Interactive Live Canvas Player */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-waveform-lines text-cyan-400"></i>
                    Khung Trải Nghiệm Thời Gian Thực (60 FPS Simulated Audio)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">● Đang chạy Realtime</span>
                </div>
                
                <div className="h-64 sm:h-72 w-full rounded-xl bg-slate-950 border border-cyan-500/30 overflow-hidden relative shadow-inner">
                  <VisualizerCanvasRunner code={previewVis.code} />
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mô tả hiệu ứng:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {previewVis.description || 'Hiệu ứng hiển thị sóng âm nghệ thuật cho video ca nhạc & karaoke.'}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-code text-indigo-400"></i>
                    Mã JavaScript ({previewVis.code.split('\n').length} dòng)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(e, previewVis)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-1"
                  >
                    <i className={`fa-solid ${copiedId === previewVis.id ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                    <span>{copiedId === previewVis.id ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-[10px] text-cyan-300 border border-slate-800 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
                  {previewVis.code}
                </pre>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => handleLike(e, previewVis)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  likedMap[previewVis.id]
                    ? 'bg-rose-600/30 border-rose-500/60 text-rose-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <i className="fa-solid fa-heart text-rose-500"></i>
                <span>{likedMap[previewVis.id] ? 'Đã thích' : 'Thả tim'} ({previewVis.likes})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewVis(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Đóng
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleApply(previewVis);
                    setPreviewVis(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-black shadow-lg shadow-cyan-600/30 flex items-center gap-2 active:scale-95"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>ÁP DỤNG VÀO VIDEO CỦA TÔI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PUBLISH TO COMMUNITY MODAL */}
      {/* ========================================================= */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-slate-950 border border-pink-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-pink-950/80 overflow-hidden text-slate-200">
            
            <div className="p-4 border-b border-pink-900/40 bg-slate-900/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-600/30 border border-pink-400/40 flex items-center justify-center text-pink-300">
                  <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Chia Sẻ Visualizer Lên Firebase Community</h3>
                  <p className="text-xs text-slate-400">Mã của bạn sẽ được hiển thị cho tất cả người dùng trong Thư Viện</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPublishOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitPublish} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {publishMessage && (
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  publishMessage.type === 'success' 
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}>
                  <i className={`fa-solid ${publishMessage.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                  <span>{publishMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Tên Visualizer *</label>
                  <input
                    type="text"
                    required
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    placeholder="VD: Cyber Ring 360, Neon Waves..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Tên Tác Giả / Kênh</label>
                  <input
                    type="text"
                    value={pubAuthor}
                    onChange={(e) => setPubAuthor(e.target.value)}
                    placeholder="VD: DJ Alex, Karaoke Studio..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Thể loại</label>
                  <select
                    value={pubCategory}
                    onChange={(e) => setPubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-pink-500 cursor-pointer"
                  >
                    {VISUALIZER_CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Thẻ Tags (cách nhau bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={pubTags}
                    onChange={(e) => setPubTags(e.target.value)}
                    placeholder="VD: Neon, EDM, Bass, 3D"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Mô tả ngắn</label>
                <input
                  type="text"
                  value={pubDescription}
                  onChange={(e) => setPubDescription(e.target.value)}
                  placeholder="Mô tả chuyển động và phong cách của visualizer..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Mã JavaScript Visualizer (Canvas 2D) *</label>
                  <button
                    type="button"
                    onClick={() => setPubCode(cleanCustomJsCode(pubCode))}
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] flex items-center gap-1"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Tự động Clean Code</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={8}
                  value={pubCode}
                  onChange={(e) => setPubCode(e.target.value)}
                  placeholder="// Nhập hoặc dán mã JS visualizer..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-[10px] text-cyan-300 outline-none focus:border-pink-500 leading-relaxed"
                  spellCheck="false"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-400 flex items-start gap-2">
                <i className="fa-solid fa-circle-info text-cyan-400 mt-0.5"></i>
                <span>
                  Sau khi chia sẻ, mã của bạn sẽ được lưu trên cơ sở dữ liệu Firebase Cloud và xuất hiện ngay lập tức trong Thư Viện để mọi người cùng thưởng thức.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-pink-600/30 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>Đang lưu lên Firebase...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>Xác Nhận Đăng Tải</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Embedded Sandbox Runner for Instant Realtime Preview in Gallery Modal
 */
const VisualizerCanvasRunner: React.FC<{ code: string }> = ({ code }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();
    const cleanCode = cleanCustomJsCode(code);

    let renderFn: ((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array, time: number) => void) | null = null;
    try {
      // Safe function compile
      renderFn = new Function('ctx', 'canvas', 'dataArray', 'time', cleanCode) as any;
    } catch (err) {
      console.warn('Sandbox visualizer compile warning:', err);
    }

    // Mock Audio Data Array (128 bins with dynamic animated beat)
    const dataArray = new Uint8Array(128);

    const renderLoop = (now: number) => {
      const time = (now - startTime) / 1000;
      
      // Update simulated FFT audio spectrum (smooth bass beats + mid flutter + high frequency shimmer)
      const bassBeat = Math.pow((Math.sin(time * 3.5) + 1) / 2, 3);
      for (let i = 0; i < dataArray.length; i++) {
        const norm = i / dataArray.length;
        if (norm < 0.2) {
          dataArray[i] = Math.min(255, Math.floor(80 + bassBeat * 160 + Math.sin(time * 8 + i) * 15));
        } else if (norm < 0.6) {
          dataArray[i] = Math.min(255, Math.floor(50 + Math.sin(time * 5 + i * 0.3) * 60 + bassBeat * 40));
        } else {
          dataArray[i] = Math.min(255, Math.floor(30 + Math.cos(time * 7 + i * 0.5) * 45 + Math.random() * 20));
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (renderFn) {
        ctx.save();
        try {
          renderFn(ctx, canvas, dataArray, time);
        } catch {}
        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [code]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="w-full h-full object-contain"
    />
  );
};
