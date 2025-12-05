
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Camera, Upload, AlertCircle, MapPin, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';
import { ItemModel, SearchState, SearchStats, SearchFilters } from './types';
import { analyzeImageForSearch, enhanceSearchQuery } from './services/geminiService';
import { searchMarketplaces } from './services/searchService';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from './services/firestoreService';
import { observeAuth, signOut } from './services/firebase';
import { User } from 'firebase/auth';

// Components
import { ResultCard } from './components/ResultCard';
import { LoadingState } from './components/LoadingState';
import { AuthModal } from './components/AuthModal';
import { FilterBar } from './components/FilterBar';
import { ItemDetailModal } from './components/ItemDetailModal';
import { InfiniteScroll } from './components/InfiniteScroll';
import { ToastContainer, ToastMessage } from './components/Toast';

const App: React.FC = () => {
  // --- STATE ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ItemModel[]>([]);
  const [status, setStatus] = useState<SearchState>(SearchState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SearchStats | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 0,
    maxDistance: 50,
    condition: [],
    sources: [],
    sortBy: 'distance_asc'
  });

  // User & Settings
  const [user, setUser] = useState<User | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [selectedItem, setSelectedItem] = useState<ItemModel | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth & Location
  useEffect(() => {
    const unsubscribe = observeAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load watchlist
        const items = await getWatchlist(currentUser.uid);
        setWatchlist(items.map(i => i.id));
      } else {
        setWatchlist([]);
      }
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location denied:", err)
      );
    }
    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---

  const addToast = (type: ToastMessage['type'], text: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const performSearch = useCallback(async (searchQuery: string, pageNum = 1, append = false) => {
    if (pageNum === 1) setStatus(SearchState.SEARCHING);
    else setStatus(SearchState.LOADING_MORE);

    try {
      const newItems = await searchMarketplaces(searchQuery, location, filters, pageNum);

      if (append) {
        setResults(prev => [...prev, ...newItems]);
      } else {
        setResults(newItems);
        // Calc Stats
        const prices = newItems.map(i => i.price);
        setStats({
          query: searchQuery,
          totalFound: newItems.length, // approximation
          minPrice: Math.min(...prices, 0),
          maxPrice: Math.max(...prices, 0)
        });
      }

      setHasMore(newItems.length > 0);
      setStatus(SearchState.COMPLETE);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results. Ensure API key is set.");
      setStatus(SearchState.ERROR);
    }
  }, [location, filters]);

  // Debounce Filter Changes
  useEffect(() => {
    if (results.length > 0 && status === SearchState.COMPLETE) {
      const timer = setTimeout(() => {
        performSearch(query, 1, false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filters]);

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setPage(1);

    // enhance only on fresh search
    setStatus(SearchState.ENHANCING_QUERY);
    try {
      const optimized = await enhanceSearchQuery(query);
      await performSearch(optimized, 1);
    } catch {
      await performSearch(query, 1);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage, true);
  };

  const handleToggleWatch = async (item: ItemModel) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const isWatching = watchlist.includes(item.id);
    if (isWatching) {
      await removeFromWatchlist(user.uid, item.id);
      setWatchlist(prev => prev.filter(id => id !== item.id));
      addToast('info', 'Removed from watchlist');
    } else {
      await addToWatchlist(user.uid, item);
      setWatchlist(prev => [...prev, item.id]);
      addToast('success', 'Added to watchlist. We will notify you of price drops!');
    }
  };

  // Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(SearchState.ANALYZING_IMAGE);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const detected = await analyzeImageForSearch(base64, file.type);
        setQuery(detected);
        await performSearch(detected, 1);
      } catch (e) {
        setError("Could not analyze image.");
        setStatus(SearchState.ERROR);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">
              BargainSniffer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
                <button onClick={() => signOut()} className="text-slate-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <UserIcon className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <FilterBar
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          filters={filters}
          onChange={setFilters}
        />
      </header>

      <main className="flex-grow flex flex-col">
        {/* Hero / Search Area */}
        <div className={`relative transition-all duration-500 ${status === SearchState.IDLE ? 'py-24 sm:py-32' : 'py-8'}`}>
          <div className="max-w-3xl mx-auto px-4 relative z-10 w-full">
            {status === SearchState.IDLE && (
              <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                  <span className="block text-slate-900 dark:text-white">Hunt smarter.</span>
                  <span className="block text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                    Pay less.
                  </span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  AI-powered search across Facebook, Craigslist, and OfferUp.
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-none border border-slate-100 dark:border-slate-700 flex gap-2 transition-all">
              <form onSubmit={handleTextSearch} className="flex-grow flex items-center px-4">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent py-3 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <Camera className="w-6 h-6" />
                </button>
                <button onClick={handleTextSearch} className="px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25">
                  Search
                </button>
              </div>
            </div>

            {status === SearchState.IDLE && location && (
              <div className="flex justify-center mt-6 text-sm text-slate-500 dark:text-slate-400 items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Searching near you
              </div>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-grow">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3 mb-8">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <LoadingState state={status} />

          {(status === SearchState.COMPLETE || status === SearchState.LOADING_MORE) && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Results <span className="text-slate-400 text-sm font-normal ml-2">({stats?.totalFound}+ items)</span>
                </h2>
                <button onClick={() => setShowFilters(!showFilters)} className="text-indigo-600 text-sm font-medium hover:underline sm:hidden">
                  Edit Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    onViewDetails={setSelectedItem}
                    isWatched={watchlist.includes(item.id)}
                    onToggleWatch={handleToggleWatch}
                  />
                ))}
                {/* Skeletons while loading more */}
                {status === SearchState.LOADING_MORE && Array.from({ length: 4 }).map((_, i) => (
                  <ResultCard key={`skel-${i}`} isLoading />
                ))}
              </div>

              <InfiniteScroll
                isLoading={status === SearchState.LOADING_MORE}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
        <p>Created by Lucas | Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
