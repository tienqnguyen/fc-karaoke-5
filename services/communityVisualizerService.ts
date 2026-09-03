import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  increment, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CUSTOM_JS_PRESETS, cleanCustomJsCode } from '../utils/customVisualizerPresets';

export interface CommunityVisualizer {
  id: string;
  name: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  code: string;
  likes: number;
  importsCount: number;
  createdAt: number;
  isFeatured?: boolean;
}

const VISUALIZERS_COLLECTION = 'visualizers';

export const VISUALIZER_CATEGORIES = [
  'Tất cả',
  'Cyberpunk & Neon',
  'EDM & Festival',
  'Lofi & Chill',
  '3D Perspective',
  'Retro & Synthwave',
  'Cosmic & Abstract',
  'Equalizer Bars'
] as const;

/**
 * Fetch all community visualizers from Firestore
 */
export async function getCommunityVisualizers(): Promise<CommunityVisualizer[]> {
  try {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }
    const q = query(
      collection(db, VISUALIZERS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const querySnapshot = await getDocs(q);
    const results: CommunityVisualizer[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let createdTime = Date.now();
      if (data.createdAt instanceof Timestamp) {
        createdTime = data.createdAt.toMillis();
      } else if (typeof data.createdAt === 'number') {
        createdTime = data.createdAt;
      }

      results.push({
        id: docSnap.id,
        name: data.name || 'Untitled Visualizer',
        author: data.author || 'Anonymous Creator',
        description: data.description || '',
        category: data.category || 'Cyberpunk & Neon',
        tags: Array.isArray(data.tags) ? data.tags : [],
        code: data.code || '',
        likes: typeof data.likes === 'number' ? data.likes : 0,
        importsCount: typeof data.importsCount === 'number' ? data.importsCount : 0,
        createdAt: createdTime,
        isFeatured: Boolean(data.isFeatured)
      });
    });

    // If Firestore collection is empty, seed with presets and return them
    if (results.length === 0) {
      await seedInitialPresets();
      return getCommunityVisualizers();
    }

    return results;
  } catch (error) {
    console.warn('Could not fetch from Firestore, falling back to local presets:', error);
    // Fallback if network or firestore error
    return CUSTOM_JS_PRESETS.map((p, idx) => ({
      id: `local-${p.id}`,
      name: p.name,
      author: 'Studio Master',
      description: p.description,
      category: p.category || 'Cyberpunk & Neon',
      tags: ['Featured', p.category || 'Visualizer'],
      code: p.code,
      likes: 42 + idx * 7,
      importsCount: 120 + idx * 15,
      createdAt: Date.now() - idx * 3600000 * 24,
      isFeatured: true
    }));
  }
}

/**
 * Publish a new visualizer to Firestore
 */
export async function publishCommunityVisualizer(data: {
  name: string;
  author: string;
  description: string;
  category: string;
  tags?: string[];
  code: string;
}): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase chưa được cấu hình. Bạn có thể xuất/lưu mã Visualizer trực tiếp từ Timeline/Preset.');
  }

  const cleanedCode = cleanCustomJsCode(data.code);
  if (!cleanedCode.trim()) {
    throw new Error('Mã JavaScript Visualizer không được để trống!');
  }
  if (!data.name.trim()) {
    throw new Error('Tên Visualizer không được để trống!');
  }

  const docData = {
    name: data.name.trim().substring(0, 100),
    author: (data.author.trim() || 'Ẩn Danh').substring(0, 50),
    description: (data.description.trim() || 'Visualizer Canvas 2D sáng tạo').substring(0, 300),
    category: data.category || 'Cyberpunk & Neon',
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean).slice(0, 6) : ['Custom', 'Community'],
    code: cleanedCode,
    likes: 1,
    importsCount: 0,
    createdAt: Date.now(),
    isFeatured: false
  };

  const docRef = await addDoc(collection(db, VISUALIZERS_COLLECTION), docData);
  return docRef.id;
}

/**
 * Like / Upvote a visualizer
 */
export async function upvoteVisualizer(id: string): Promise<void> {
  if (!isFirebaseConfigured || id.startsWith('local-')) return;
  try {
    const docRef = doc(db, VISUALIZERS_COLLECTION, id);
    await updateDoc(docRef, {
      likes: increment(1)
    });
  } catch (err) {
    console.error('Error upvoting visualizer:', err);
  }
}

/**
 * Increment visualizer import / use counter
 */
export async function incrementVisualizerImports(id: string): Promise<void> {
  if (!isFirebaseConfigured || id.startsWith('local-')) return;
  try {
    const docRef = doc(db, VISUALIZERS_COLLECTION, id);
    await updateDoc(docRef, {
      importsCount: increment(1)
    });
  } catch (err) {
    console.error('Error tracking visualizer import:', err);
  }
}

/**
 * Seed initial presets to Firestore
 */
async function seedInitialPresets(): Promise<void> {
  try {
    for (let i = 0; i < CUSTOM_JS_PRESETS.length; i++) {
      const preset = CUSTOM_JS_PRESETS[i];
      let cat = 'Cyberpunk & Neon';
      if (preset.id.includes('lofi')) cat = 'Lofi & Chill';
      else if (preset.id.includes('edm') || preset.id.includes('trap')) cat = 'EDM & Festival';
      else if (preset.id.includes('synthwave') || preset.id.includes('neon')) cat = 'Retro & Synthwave';
      else if (preset.id.includes('cosmic') || preset.id.includes('galaxy')) cat = 'Cosmic & Abstract';

      await addDoc(collection(db, VISUALIZERS_COLLECTION), {
        name: preset.name,
        author: 'Karaoke Studio Master',
        description: preset.description,
        category: cat,
        tags: ['Featured', 'Pro Quality', preset.category || 'Visualizer'],
        code: preset.code,
        likes: 25 + Math.floor(Math.random() * 50),
        importsCount: 80 + Math.floor(Math.random() * 120),
        createdAt: Date.now() - (CUSTOM_JS_PRESETS.length - i) * 86400000,
        isFeatured: true
      });
    }
  } catch (err) {
    console.warn('Initial seeding skipped:', err);
  }
}
