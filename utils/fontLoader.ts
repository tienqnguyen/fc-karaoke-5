// Curated Vietnamese Google Fonts with on-demand lazy loading

export interface FontOption {
  name: string;
  value: string;
  category: 'script' | 'serif' | 'display' | 'sans';
  categoryLabel: string;
  weights?: string;
  isPopular?: boolean;
}

export const VIETNAMESE_FONT_CATEGORIES = [
  { id: 'all', label: 'Tất cả Font', icon: 'fa-layer-group' },
  { id: 'script', label: 'Viết tay / Script', icon: 'fa-signature' },
  { id: 'serif', label: 'Sang trọng / Serif', icon: 'fa-feather' },
  { id: 'display', label: 'Nổi bật / Display', icon: 'fa-bolt' },
  { id: 'sans', label: 'Hiện đại / Sans', icon: 'fa-font' },
] as const;

export const CURATED_VIETNAMESE_FONTS: FontOption[] = [
  // --- Script & Handwriting (Chữ viết tay, Thư pháp) ---
  { name: 'Dancing Script', value: 'Dancing Script', category: 'script', categoryLabel: 'Thư pháp bay bổng', isPopular: true, weights: '400..700' },
  { name: 'Satisfy', value: 'Satisfy', category: 'script', categoryLabel: 'Chữ ký mượt mà', isPopular: true, weights: '400' },
  { name: 'Caveat', value: 'Caveat', category: 'script', categoryLabel: 'Viết tay mộc mạc', isPopular: true, weights: '400..700' },
  { name: 'Great Vibes', value: 'Great Vibes', category: 'script', categoryLabel: 'Dạ tiệc quý phái', isPopular: true, weights: '400' },
  { name: 'Alex Brush', value: 'Alex Brush', category: 'script', categoryLabel: 'Nghiêng bay bổng', weights: '400' },
  { name: 'Playwrite CZ', value: 'Playwrite CZ', category: 'script', categoryLabel: 'Viết tay Châu Âu', isPopular: true, weights: '100..400' },
  { name: 'Playwrite MX', value: 'Playwrite MX', category: 'script', categoryLabel: 'Modern Script', weights: '100..400' },
  { name: 'Pinyon Script', value: 'Pinyon Script', category: 'script', categoryLabel: 'Cung đình cổ điển', weights: '400' },
  { name: 'Pacifico', value: 'Pacifico', category: 'script', categoryLabel: 'Nét cọ phóng khoáng', isPopular: true, weights: '400' },
  { name: 'Charm', value: 'Charm', category: 'script', categoryLabel: 'Quý phái hoàng gia', weights: '400;700' },
  { name: 'Sriracha', value: 'Sriracha', category: 'script', categoryLabel: 'Viết tay cá tính', weights: '400' },
  { name: 'Mali', value: 'Mali', category: 'script', categoryLabel: 'Cute vui tươi', weights: '400;600;700' },
  { name: 'Pattaya', value: 'Pattaya', category: 'script', categoryLabel: 'Script nét đậm', weights: '400' },
  { name: 'Patrick Hand', value: 'Patrick Hand', category: 'script', categoryLabel: 'Chữ nét phấn', weights: '400' },
  { name: 'Marck Script', value: 'Marck Script', category: 'script', categoryLabel: 'Nghiêng thanh mảnh', weights: '400' },
  { name: 'Itim', value: 'Itim', category: 'script', categoryLabel: 'Tròn trịa nhẹ nhàng', weights: '400' },
  { name: 'Sedgwick Ave', value: 'Sedgwick Ave', category: 'script', categoryLabel: 'Graffiti đường phố', weights: '400' },
  { name: 'MonteCarlo', value: 'MonteCarlo', category: 'script', categoryLabel: 'Thư pháp uốn lượn', weights: '400' },
  { name: 'Ephesis', value: 'Ephesis', category: 'script', categoryLabel: 'Bay bổng nhẹ', weights: '400' },

  // --- Serif (Chân chữ sang trọng, Bolero, Ballad, Trữ tình) ---
  { name: 'Playfair Display', value: 'Playfair Display', category: 'serif', categoryLabel: 'Sang trọng tạp chí', isPopular: true, weights: '400..900' },
  { name: 'Lora', value: 'Lora', category: 'serif', categoryLabel: 'Trữ tình sâu lắng', isPopular: true, weights: '400..700' },
  { name: 'Merriweather', value: 'Merriweather', category: 'serif', categoryLabel: 'Cổ điển ấm áp', weights: '300;400;700;900' },
  { name: 'Cinzel Decorative', value: 'Cinzel Decorative', category: 'serif', categoryLabel: 'Hoàng gia điện ảnh', isPopular: true, weights: '700' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond', category: 'serif', categoryLabel: 'Lãng mạn quý tộc', weights: '400;600;700' },
  { name: 'Prata', value: 'Prata', category: 'serif', categoryLabel: 'Thanh lịch tối tân', weights: '400' },
  { name: 'Faustina', value: 'Faustina', category: 'serif', categoryLabel: 'Truyền thống mềm', weights: '400..800' },
  { name: 'Spectral', value: 'Spectral', category: 'serif', categoryLabel: 'Thơ mộng tinh tế', weights: '400;600;700' },
  { name: 'Old Standard TT', value: 'Old Standard TT', category: 'serif', categoryLabel: 'Hoài niệm cổ xưa', weights: '400;700' },
  { name: 'Vollkorn', value: 'Vollkorn', category: 'serif', categoryLabel: 'Trầm ấm hoài cổ', weights: '400..900' },

  // --- Display & Impact (Tiêu đề nổi bật, Remix, EDM, TikTok) ---
  { name: 'Bebas Neue', value: 'Bebas Neue', category: 'display', categoryLabel: 'Chữ hoa cao khỏe', isPopular: true, weights: '400' },
  { name: 'Oswald', value: 'Oswald', category: 'display', categoryLabel: 'Chắc nịch hiện đại', isPopular: true, weights: '400..700' },
  { name: 'Anton', value: 'Anton', category: 'display', categoryLabel: 'Siêu dày bùng nổ', isPopular: true, weights: '400' },
  { name: 'Teko', value: 'Teko', category: 'display', categoryLabel: 'Cao gầy sắc nét', weights: '400..700' },
  { name: 'Bungee', value: 'Bungee', category: 'display', categoryLabel: 'Khối 3D mạnh mẽ', weights: '400' },
  { name: 'Lobster', value: 'Lobster', category: 'display', categoryLabel: 'Retro nổi bật', isPopular: true, weights: '400' },
  { name: 'Russo One', value: 'Russo One', category: 'display', categoryLabel: 'Khối vuông dứt khoát', weights: '400' },
  { name: 'Righteous', value: 'Righteous', category: 'display', categoryLabel: 'Sci-Fi cổ điển', weights: '400' },
  { name: 'Coiny', value: 'Coiny', category: 'display', categoryLabel: 'Bo tròn đậm đà', weights: '400' },

  // --- Sans-Serif (Hiện đại, Tối giản, Pop, R&B, Acoustic) ---
  { name: 'Be Vietnam Pro', value: 'Be Vietnam Pro', category: 'sans', categoryLabel: 'Typography Việt chuẩn', isPopular: true, weights: '300;400;600;700;800' },
  { name: 'Montserrat', value: 'Montserrat', category: 'sans', categoryLabel: 'Thời thượng đa dụng', isPopular: true, weights: '300;400;700;900' },
  { name: 'Inter', value: 'Inter', category: 'sans', categoryLabel: 'Công nghệ tối giản', isPopular: true, weights: '300;400;600;700' },
  { name: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans', category: 'sans', categoryLabel: 'Cao cấp thời trang', isPopular: true, weights: '400;600;700;800' },
  { name: 'Roboto', value: 'Roboto', category: 'sans', categoryLabel: 'Gọn gàng hình học', weights: '300;400;700;900' },
  { name: 'Quicksand', value: 'Quicksand', category: 'sans', categoryLabel: 'Bo tròn dễ thương', isPopular: true, weights: '400..700' },
  { name: 'Nunito', value: 'Nunito', category: 'sans', categoryLabel: 'Mềm mại thân thiện', weights: '400..800' },
  { name: 'Comfortaa', value: 'Comfortaa', category: 'sans', categoryLabel: 'Tròn điệu nghệ', weights: '400..700' },
  { name: 'Titillium Web', value: 'Titillium Web', category: 'sans', categoryLabel: 'Futuristic sắc nét', weights: '300;400;600;700' },
  { name: 'Work Sans', value: 'Work Sans', category: 'sans', categoryLabel: 'Thanh lịch hiện đại', weights: '300..700' },
  { name: 'Lexend', value: 'Lexend', category: 'sans', categoryLabel: 'Dễ đọc mượt mắt', weights: '300..700' },
  { name: 'Fira Code', value: 'Fira Code', category: 'sans', categoryLabel: 'Monospace lập trình', weights: '400..700' },
  { name: 'Ubuntu', value: 'Ubuntu', category: 'sans', categoryLabel: 'Tech gọn', weights: '400;700' },
];

// Global in-memory cache to prevent duplicate network calls
const loadedFontsSet = new Set<string>(['Inter', 'sans-serif', 'monospace', 'serif']);
const pendingFontLoads = new Map<string, Promise<boolean>>();

/**
 * Lazy loads a Google Font dynamically on demand without blocking site initialization.
 */
export const lazyLoadGoogleFont = (fontFamily: string): Promise<boolean> => {
  if (!fontFamily) return Promise.resolve(false);
  const cleanFamily = fontFamily.trim();
  
  if (loadedFontsSet.has(cleanFamily)) {
    return Promise.resolve(true);
  }

  if (pendingFontLoads.has(cleanFamily)) {
    return pendingFontLoads.get(cleanFamily)!;
  }

  const loadPromise = new Promise<boolean>((resolve) => {
    try {
      const fontId = `gf-lazy-${cleanFamily.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      // Check if tag already exists in DOM
      if (document.getElementById(fontId)) {
        loadedFontsSet.add(cleanFamily);
        resolve(true);
        return;
      }

      // Check for curated font config or fallback to standard query
      const curated = CURATED_VIETNAMESE_FONTS.find(
        f => f.value.toLowerCase() === cleanFamily.toLowerCase()
      );
      
      const weights = curated?.weights 
        ? `:ital,wght@0,${curated.weights.includes('..') ? curated.weights : curated.weights.split(';').join(';0,')}` 
        : ':wght@400;700';

      const fontParam = `${encodeURIComponent(cleanFamily.replace(/\s+/g, '+'))}${weights}`;
      const fontHref = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap&subset=vietnamese`;

      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = fontHref;

      link.onload = () => {
        loadedFontsSet.add(cleanFamily);
        pendingFontLoads.delete(cleanFamily);
        // Also trigger document.fonts check if supported
        if (typeof document !== 'undefined' && 'fonts' in document) {
          (document.fonts as any).load(`16px "${cleanFamily}"`).catch(() => {});
        }
        resolve(true);
      };

      link.onerror = () => {
        pendingFontLoads.delete(cleanFamily);
        // Fallback without strict weight syntax
        const fallbackHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFamily.replace(/\s+/g, '+'))}&display=swap`;
        const fallbackLink = document.createElement('link');
        fallbackLink.id = `${fontId}-fallback`;
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = fallbackHref;
        fallbackLink.onload = () => {
          loadedFontsSet.add(cleanFamily);
          resolve(true);
        };
        fallbackLink.onerror = () => resolve(false);
        document.head.appendChild(fallbackLink);
      };

      document.head.appendChild(link);
    } catch {
      resolve(false);
    }
  });

  pendingFontLoads.set(cleanFamily, loadPromise);
  return loadPromise;
};

/**
 * Lazy loads a batch of fonts progressively in background idle slices.
 */
export const lazyLoadFontBatch = (fontNames: string[]) => {
  const toLoad = fontNames.filter(name => !loadedFontsSet.has(name));
  if (toLoad.length === 0) return;

  const loadChunk = (index: number) => {
    if (index >= toLoad.length) return;
    lazyLoadGoogleFont(toLoad[index]);
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => loadChunk(index + 1));
    } else {
      setTimeout(() => loadChunk(index + 1), 60);
    }
  };

  loadChunk(0);
};

/**
 * Load raw custom Google Font URL (supports multi-family parameter URLs)
 */
export const loadGoogleFontUrl = (url: string) => {
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('ttps://')) cleanUrl = 'h' + cleanUrl;
  if (cleanUrl.startsWith('//')) cleanUrl = 'https:' + cleanUrl;
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  // Ensure display=swap is present
  if (!cleanUrl.includes('display=')) {
    cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'display=swap';
  }

  const linkId = `google-font-custom-${btoa(cleanUrl).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = cleanUrl;
    document.head.appendChild(link);
  }
};

/**
 * Extract individual font families from complex Google Fonts URL
 */
export const extractFamiliesFromUrl = (url: string): string[] => {
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('ttps://')) cleanUrl = 'h' + cleanUrl;
  const families: string[] = [];
  const regex = /family=([^&]+)/g;
  let match;
  while ((match = regex.exec(cleanUrl)) !== null) {
    const rawFamily = match[1];
    const cleanFamily = decodeURIComponent(rawFamily.split(':')[0].replace(/\+/g, ' ').trim());
    if (cleanFamily && !families.includes(cleanFamily)) {
      families.push(cleanFamily);
    }
  }
  return families;
};
