import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { generateTasksFromGoal } from '../services/geminiService';
import { Plus, CheckCircle, Circle, BrainCircuit, Trash2, Layout, List, AlertCircle } from 'lucide-react';

export const Taskanator: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'demo-1', title: 'Initialize DigiMaster Protocol', status: TaskStatus.COMPLETED, priority: 'critical', tags: ['system'] },
    { id: 'demo-2', title: 'Calibrate Quantum Sensors', status: TaskStatus.IN_PROGRESS, priority: 'high', tags: ['ai'] }
  ]);
  const [goalInput, setGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTasks = async () => {
    if (!goalInput.trim()) return;
    setIsGenerating(true);
    try {
      const newTasks = await generateTasksFromGoal(goalInput);
      setTasks(prev => [...prev, ...newTasks]);
      setGoalInput('');
    } catch (e) { alert("Failed to decompose goal."); } finally { setIsGenerating(false); }
  };

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: t.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED };
    }));
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'text-neon-pink bg-neon-pink/10 border-neon-pink/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 animate-fade-in">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-neon-pink/10 to-purple-900/40 border border-neon-pink/20 rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/20 blur-[100px] -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none group-hover:bg-neon-pink/30 transition-colors" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-3">
              <BrainCircuit className="text-neon-pink w-8 h-8" />
              TASKANATOR AUTO-AGENT
            </h2>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
              Autonomous project decomposition engine. Enter a high-level objective, and the system will break it down into actionable directives using Gemini logical reasoning.
            </p>
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. Launch 'Cyber Monday' Campaign"
              className="flex-1 md:w-80 bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink outline-none transition-all placeholder-slate-600 font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateTasks()}
            />
            <button
              onClick={handleGenerateTasks}
              disabled={isGenerating}
              className="bg-neon-pink hover:bg-pink-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isGenerating ? <span className="animate-pulse">PROCESSING...</span> : <span>MATERIALIZE</span>}
            </button>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-300">ACTIVE DIRECTIVES</span>
          </div>
          <div className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded border border-white/5 text-slate-400">
            {tasks.filter(t => t.status !== TaskStatus.COMPLETED).length} PENDING
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="font-mono text-sm">NO DIRECTIVES FOUND</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-900/10 border-emerald-500/10 opacity-60' : 'bg-white/5 border-white/5 hover:border-neon-pink/30 hover:bg-white/10'}`}>
                <button onClick={() => toggleStatus(task.id)} className="mt-1 text-slate-500 hover:text-emerald-400 transition-colors">
                  {task.status === TaskStatus.COMPLETED ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  </div>
                  {task.description && <p className="text-sm text-slate-500 mb-2 font-light">{task.description}</p>}
                  <div className="flex gap-2">
                    {task.tags?.map(tag => <span key={tag} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">#{tag}</span>)}
                  </div>
                </div>
                <button onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};