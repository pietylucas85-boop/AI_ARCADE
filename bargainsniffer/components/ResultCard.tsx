
import React, { useState } from 'react';
import { ItemModel } from '../types';
import { ExternalLink, MapPin, Tag, Heart } from 'lucide-react';

interface ResultCardProps {
  item?: ItemModel; // Optional for skeleton mode
  isLoading?: boolean;
  onViewDetails?: (item: ItemModel) => void;
  isWatched?: boolean;
  onToggleWatch?: (item: ItemModel) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  item, 
  isLoading, 
  onViewDetails, 
  isWatched, 
  onToggleWatch 
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (isLoading || !item) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
        <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="p-4 flex-1 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
          <div className="mt-auto h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('facebook')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (s.includes('offerup')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (s.includes('craigslist')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      {/* Watch Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleWatch?.(item); }}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-sm hover:scale-110 transition-transform"
      >
        <Heart className={`w-5 h-5 ${isWatched ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
      </button>

      {/* Image */}
      <div 
        className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer"
        onClick={() => onViewDetails?.(item)}
      >
        <img 
          src={item.imageUrl} 
          alt={item.title}
          className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold shadow-sm ${getSourceColor(item.source)}`}>
            {item.source}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 
            className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => onViewDetails?.(item)}
          >
            {item.title}
          </h3>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            ${item.price.toFixed(0)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
            <Tag className="w-3 h-3 mr-1" />
            {item.condition}
          </div>
          <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
            <MapPin className="w-3 h-3 mr-1" />
            {item.distanceMiles === 0 ? 'Online' : `${item.distanceMiles} mi`}
          </div>
        </div>

        <button 
          className="mt-auto w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors active:scale-95"
          onClick={() => onViewDetails?.(item)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};
