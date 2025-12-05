
export interface ItemModel {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  source: 'Facebook' | 'OfferUp' | 'Craigslist' | 'eBay' | 'Mercari' | 'Unknown' | string;
  distanceMiles: number;
  location: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Used' | 'Unknown';
  postedAt: string; // ISO date or relative string
  description?: string;
  itemUrl: string;
}

export interface SearchFilters {
  minPrice: number;
  maxPrice: number;
  maxDistance: number;
  condition: string[]; // e.g. ['New', 'Like New']
  sources: string[];
  sortBy: 'price_asc' | 'price_desc' | 'distance_asc' | 'date_desc';
}

export interface UserProfile {
  uid: string;
  email: string;
  watchlist: string[]; // Array of Item IDs
  preferences: {
    darkMode: boolean;
    maxDistance: number;
  };
}

export enum SearchState {
  IDLE = 'IDLE',
  ANALYZING_IMAGE = 'ANALYZING_IMAGE',
  ENHANCING_QUERY = 'ENHANCING_QUERY',
  SEARCHING = 'SEARCHING',
  LOADING_MORE = 'LOADING_MORE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface SearchStats {
  query: string;
  totalFound: number;
  minPrice: number;
  maxPrice: number;
}
