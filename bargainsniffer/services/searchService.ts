import { ItemModel, SearchFilters } from '../types';
import { findListingsWithGemini } from './geminiService';

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1593642632823-8f785e67bf63?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
];

export const searchMarketplaces = async (
  query: string, 
  userLocation: {lat: number, lng: number} | null,
  filters: SearchFilters,
  page: number = 1
): Promise<ItemModel[]> => {
  
  // 1. Fetch Real Results
  let items: ItemModel[] = [];
  try {
    const partials = await findListingsWithGemini(query, userLocation?.lat, userLocation?.lng, page);
    
    items = partials.map((p, i) => ({
      id: `gemini-${Date.now()}-${i}-${page}`,
      title: p.title || 'Unknown Item',
      price: p.price || 0,
      currency: 'USD',
      imageUrl: MOCK_IMAGES[i % MOCK_IMAGES.length], // Fallback as Gemini Search Text doesn't guarantee images
      source: p.source || 'Web',
      distanceMiles: p.distanceMiles || 0,
      location: p.location || 'Online',
      condition: (p.condition as any) || 'Used',
      postedAt: 'Recently',
      description: `Found on ${p.source}. Click to view full details.`,
      itemUrl: p.itemUrl || '#'
    }));
  } catch (e) {
    console.warn("Search failed, using fallback", e);
    // In a real app, you might trigger the mock generator here if strict fallback is desired
  }

  // 2. Fallback to Mock if empty (for Demo purposes so user always sees something)
  if (items.length === 0) {
    items = generateMockResults(query, page, userLocation);
  }

  // 3. Client-Side Filtering
  items = items.filter(item => {
    if (item.price < filters.minPrice) return false;
    if (filters.maxPrice > 0 && item.price > filters.maxPrice) return false;
    if (filters.maxDistance > 0 && item.distanceMiles > filters.maxDistance) return false;
    if (filters.sources.length > 0 && !filters.sources.some(s => item.source.includes(s))) return false;
    // Condition fuzzy match
    if (filters.condition.length > 0) {
      const itemCond = item.condition.toLowerCase();
      const hasMatch = filters.condition.some(c => itemCond.includes(c.toLowerCase()));
      if (!hasMatch) return false;
    }
    return true;
  });

  // 4. Sorting
  items.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'distance_asc': return a.distanceMiles - b.distanceMiles;
      case 'date_desc': return 0; // Already roughly sorted by recency
      default: return 0;
    }
  });

  return items;
};

const generateMockResults = (query: string, page: number, loc: any): ItemModel[] => {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `mock-${page}-${i}-${Date.now()}`,
    title: `${query} - Great Condition ${page * 10 + i}`,
    price: Math.floor(Math.random() * 200) + 15,
    currency: 'USD',
    imageUrl: `https://picsum.photos/seed/${query}${page}${i}/400/300`,
    source: ['Facebook', 'OfferUp', 'Craigslist'][Math.floor(Math.random() * 3)],
    distanceMiles: Math.floor(Math.random() * 30),
    location: loc ? 'Nearby' : 'Online',
    condition: 'Good',
    postedAt: `${Math.floor(Math.random() * 10)}h ago`,
    itemUrl: `https://google.com/search?q=${query}`,
    description: "This is a simulated item description for demonstration purposes."
  }));
};