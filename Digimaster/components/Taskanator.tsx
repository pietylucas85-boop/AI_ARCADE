import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { generateTasksFromGoal } from '../services/geminiService';
import { CheckCircle, Circle, BrainCircuit, Trash2, Layout, List } from 'lucide-react';

export const Taskanator: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 'demo-1',
            title: 'Initialize DigiMaster Protocol',
            description: 'Setup the primary React environment and Tailwind bindings.',
            status: TaskStatus.COMPLETED,
            priority: 'critical',
            tags: ['system', 'core']
        },
        {
            id: 'demo-2',
            title: 'Calibrate Quantum Sensors',
            description: 'Ensure Gemini API connection is stable.',
            status: TaskStatus.IN_PROGRESS,
            priority: 'high',
            tags: ['ai', 'backend']
        }
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
        } catch (e) {
            console.error(e);
            alert("Failed to decompose goal via Taskanator AI.");
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleStatus = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            const nextStatus = t.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;
            return { ...t, status: nextStatus };
        }));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'critical': return 'text-pink-500 border-pink-500/50 bg-pink-500/10';
            case 'high': return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
            case 'medium': return 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10';
            default: return 'text-slate-400 border-slate-400/50 bg-slate-400/10';
        }
    };

    return (
        <div className="flex flex-col h-[600px] space-y-6">

            {/* AI Input Section */}
            <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-3xl -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                        <BrainCircuit className="text-pink-500" />
                        TASKANATOR AUTO-AGENT
                    </h2>
                    <p className="text-slate-400 mb-4 max-w-xl">
                        Input a high-level objective. The Taskanator will autonomously decompose it into actionable steps using the Gemini Neural Engine.
                    </p>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={goalInput}
                            onChange={(e) => setGoalInput(e.target.value)}
                            placeholder="e.g., Launch a marketing campaign for DigiMaster..."
                            className="flex-1 bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-slate-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateTasks()}
                        />
                        <button
                            onClick={handleGenerateTasks}
                            disabled={isGenerating}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            {isGenerating ? (
                                <span className="animate-pulse">DECOMPOSING...</span>
                            ) : (
                                <>
                                    <Layout className="w-5 h-5" />
                                    <span>MATERIALIZE</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                        <List className="w-5 h-5 text-cyan-400" />
                        ACTIVE DIRECTIVES
                    </h3>
                    <span className="text-xs font-mono text-slate-500">{tasks.length} TASKS REMAINING</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {tasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                            <Layout className="w-16 h-16 mb-4" />
                            <p>NO ACTIVE DIRECTIVES</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`group flex items-start gap-4 p-4 rounded-lg border transition-all ${task.status === TaskStatus.COMPLETED
                                            ? 'bg-green-900/10 border-green-500/20 opacity-60'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleStatus(task.id)}
                                        className="mt-1 text-slate-400 hover:text-cyan-400 transition-colors"
                                    >
                                        {task.status === TaskStatus.COMPLETED ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5" />
                                        )}
                                    </button>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className={`font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                                {task.title}
                                            </h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p className="text-sm text-slate-500 mb-2">{task.description}</p>
                                        )}
                                        <div className="flex gap-2">
                                            {task.tags.map(tag => (
                                                <span key={tag} className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
