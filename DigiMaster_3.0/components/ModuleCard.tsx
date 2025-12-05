import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'cyan' | 'purple' | 'pink' | 'blue';
  onClick?: () => void;
  isLocked?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, icon: Icon, color, onClick, isLocked }) => {
  const colorMap = {
    cyan: 'text-neon-cyan border-neon-cyan/30 group-hover:border-neon-cyan/60 bg-neon-cyan/5',
    purple: 'text-neon-purple border-neon-purple/30 group-hover:border-neon-purple/60 bg-neon-purple/5',
    pink: 'text-neon-pink border-neon-pink/30 group-hover:border-neon-pink/60 bg-neon-pink/5',
    blue: 'text-blue-400 border-blue-400/30 group-hover:border-blue-400/60 bg-blue-400/5',
  };

  return (
    <button 
      onClick={onClick}
      disabled={isLocked}
      className={`group relative text-left p-6 rounded-2xl glass-panel transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colorMap[color]} transition-colors`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-slate-400 leading-relaxed mb-6">
        {description}
      </p>

      {!isLocked && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      )}

      {isLocked && (
        <div className="absolute top-4 right-4 text-xs font-mono text-slate-600 border border-slate-700 px-2 py-1 rounded">
          LOCKED
        </div>
      )}
    </button>
  );
};