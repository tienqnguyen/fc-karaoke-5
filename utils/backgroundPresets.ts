export interface BackgroundPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  type: 'image' | 'video';
}

// User requested default background image
export const DEFAULT_BG_IMAGE = 'https://images.unsplash.com/photo-1549119246-cf57ef8a17b2?q=80&w=2670&auto=format&fit=crop';

export const CURATED_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: 'default-stage',
    name: 'Concert Lights',
    category: 'Stage',
    url: 'https://images.unsplash.com/photo-1549119246-cf57ef8a17b2?q=80&w=2670&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'cyberpunk-city',
    name: 'Cyberpunk Neon',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'starry-galaxy',
    name: 'Starry Galaxy',
    category: 'Galaxy',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'sunset-coast',
    name: 'Golden Sunset',
    category: 'Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'moody-rain',
    name: 'Rainy Window',
    category: 'Moody',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'lofi-room',
    name: 'Lo-Fi Chill',
    category: 'Lo-Fi',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'neon-tokyo',
    name: 'Tokyo Night',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'misty-forest',
    name: 'Dark Forest',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'acoustic-vibe',
    name: 'Acoustic Guitar',
    category: 'Music',
    url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Lights',
    category: 'Galaxy',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'synthwave-grid',
    name: 'Purple Nebula',
    category: 'Galaxy',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'vintage-records',
    name: 'Vinyl Music',
    category: 'Music',
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'tokyo-street-night',
    name: 'Neon Street',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'mountain-mist',
    name: 'Mountain Fog',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'dj-mixer-lights',
    name: 'DJ Stage Lights',
    category: 'Stage',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop',
    type: 'image'
  }
];

export const getRandomPicsumUrl = (): string => {
  const seed = Math.floor(Math.random() * 99999);
  return `https://picsum.photos/seed/${seed}/1920/1080`;
};

export const getRandomUnsplashUrl = (): string => {
  const randomIndex = Math.floor(Math.random() * CURATED_BACKGROUNDS.length);
  return CURATED_BACKGROUNDS[randomIndex].url;
};

export const getRandomBackgroundUrl = (source: 'unsplash' | 'picsum' | 'any' = 'any'): string => {
  if (source === 'picsum') {
    return getRandomPicsumUrl();
  }
  if (source === 'unsplash') {
    return getRandomUnsplashUrl();
  }
  // Any: 50% chance curated Unsplash, 50% Picsum
  return Math.random() > 0.5 ? getRandomUnsplashUrl() : getRandomPicsumUrl();
};
