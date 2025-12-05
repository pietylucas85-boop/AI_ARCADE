
import React from 'react';
import { SearchFilters } from '../types';
import { SlidersHorizontal, ArrowUpDown, MapPin, DollarSign } from 'lucide-react';

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, isOpen, onToggle }) => {
  
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={onToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isOpen ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Sort by:</span>
             <select 
               value={filters.sortBy}
               onChange={(e) => updateFilter('sortBy', e.target.value)}
               className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
             >
               <option value="price_asc">Lowest Price</option>
               <option value="price_desc">Highest Price</option>
               <option value="distance_asc">Closest Distance</option>
             </select>
             <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Max Price: ${filters.maxPrice || 'Any'}</label>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="10"
                value={filters.maxPrice || 1000}
                onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$0</span>
                <span>$500</span>
                <span>$1000+</span>
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Distance: {filters.maxDistance} mi</label>
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5"
                value={filters.maxDistance}
                onChange={(e) => updateFilter('maxDistance', parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5mi</span>
                <span>50mi</span>
                <span>100mi</span>
              </div>
            </div>

            {/* Condition */}
            <div>
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Condition</label>
               <div className="flex flex-wrap gap-2">
                 {['New', 'Like New', 'Used'].map(c => (
                   <button
                     key={c}
                     onClick={() => {
                        const newCond = filters.condition.includes(c) 
                          ? filters.condition.filter(x => x !== c)
                          : [...filters.condition, c];
                        updateFilter('condition', newCond);
                     }}
                     className={`px-3 py-1 text-xs rounded-full border ${filters.condition.includes(c) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400'}`}
                   >
                     {c}
                   </button>
                 ))}
               </div>
            </div>

            {/* Sources */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Marketplaces</label>
              <div className="space-y-1">
                {['Facebook', 'OfferUp', 'Craigslist', 'eBay'].map(source => (
                  <label key={source} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={(e) => {
                        const newSources = e.target.checked
                          ? [...filters.sources, source]
                          : filters.sources.filter(s => s !== source);
                        updateFilter('sources', newSources);
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{source}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
