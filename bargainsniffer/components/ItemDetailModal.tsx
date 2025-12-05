
import React from 'react';
import { ItemModel } from '../types';
import { X, ExternalLink, MapPin, Tag, Clock, ShieldCheck, Share2 } from 'lucide-react';

interface ItemDetailModalProps {
  item: ItemModel | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handleBuy = () => {
    window.open(item.itemUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Side */}
          <div className="relative h-64 md:h-auto bg-slate-100 dark:bg-slate-800">
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details Side */}
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md">
                  {item.source}
                </span>
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-md">
                  {item.condition}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                {item.title}
              </h2>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ${item.price}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <MapPin className="w-5 h-5 mr-3 text-slate-400" />
                <span>{item.location || `${item.distanceMiles} miles away`}</span>
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Clock className="w-5 h-5 mr-3 text-slate-400" />
                <span>Posted {item.postedAt}</span>
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-5 h-5 mr-3 text-slate-400" />
                <span>Safe Trade Tips Available</span>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button 
                onClick={handleBuy}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Open Listing <ExternalLink className="w-5 h-5" />
              </button>
              <button 
                onClick={() => alert("Link copied to clipboard!")}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share with Friend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
