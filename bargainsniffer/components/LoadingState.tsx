import React from 'react';
import { SearchState } from '../types';
import { Loader2, Sparkles, Search } from 'lucide-react';

interface LoadingStateProps {
  state: SearchState;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ state }) => {
  if (state === SearchState.IDLE || state === SearchState.COMPLETE || state === SearchState.ERROR) return null;

  let message = "Loading...";
  let icon = <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />;

  switch (state) {
    case SearchState.ANALYZING_IMAGE:
      message = "Gemini is analyzing your image...";
      icon = <Sparkles className="w-8 h-8 animate-pulse text-indigo-500" />;
      break;
    case SearchState.ENHANCING_QUERY:
      message = "Optimizing search terms for best deals...";
      icon = <Sparkles className="w-8 h-8 animate-pulse text-purple-500" />;
      break;
    case SearchState.SEARCHING:
      message = "Sniffing out bargains nearby...";
      icon = <Search className="w-8 h-8 animate-bounce text-emerald-500" />;
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-white p-4 rounded-full shadow-lg mb-4 ring-4 ring-indigo-50">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{message}</h3>
      <p className="text-slate-500 text-sm mt-1">This might take a moment.</p>
    </div>
  );
};