import React, { useState, useEffect, useRef } from 'react';
import { Job, Technician, JobStatus, InventoryItem, Division, PriorityLevel, Message } from '../types';
import { optimizeDispatch, chatWithAssistant, parseJobRequest, transcribeAudio } from '../services/geminiService';
import MapVisualization from './MapVisualization';
import { OnboardingTour } from './OnboardingTour';
import { Bot, LayoutDashboard, Users, Archive, FileDown, Plus, Edit, Trash2, X, MessageSquare, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
    jobs: Job[];
    techs: Technician[];
    inventory: InventoryItem[];
    setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
    setTechs: React.Dispatch<React.SetStateAction<Technician[]>>;
    updateJob: (job: Job) => void;
    messages: Message[];
    sendMessage: (text: string, senderId: string, receiverId: string) => void;
}

const OfficeDashboard: React.FC<DashboardProps> = ({ jobs, techs, inventory, setJobs, setTechs, messages, sendMessage }) => {
    const [activeTab, setActiveTab] = useState<'map' | 'inventory' | 'techs' | 'messages'>('map');
    const [sidePanelView, setSidePanelView] = useState<'jobs' | 'techs' | null>('jobs');
    const [expandedTechId, setExpandedTechId] = useState<string | null>(null);
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

    // Messaging
    const [selectedTechForMsg, setSelectedTechForMsg] = useState<string>('');
    const [messageInput, setMessageInput] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedTechForMsg) return;
        sendMessage(messageInput, 'OFFICE', selectedTechForMsg);
        setMessageInput('');
    };

    // Filters
    const [selectedDivision, setSelectedDivision] = useState<Division | 'all'>('all');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
    const [isListening, setIsListening] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Job Management
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    const handleCreateJob = () => {
        setEditingJob({
            id: `job-${Date.now()}`,
            customerName: '',
            address: '',
            location: { lat: 34.0522, lng: -118.2437 }, // Default LA
            status: JobStatus.UNASSIGNED,
            priority: PriorityLevel.MEDIUM,
            division: Division.MISC,
            assignedTech: null,
            notes: '',
            appointmentTime: new Date().toISOString()
        });
        setIsJobModalOpen(true);
    };

    const handleEditJob = (job: Job) => {
        setEditingJob({ ...job });
        setIsJobModalOpen(true);
    };

    const handleDeleteJob = (jobId: string) => {
        if (confirm('Are you sure you want to delete this job?')) {
            const jobToDelete = jobs.find(j => j.id === jobId);
            if (jobToDelete && jobToDelete.assignedTech) {
                setTechs(prev => prev.map(t => t.id === jobToDelete.assignedTech ? { ...t, currentJob: null, status: JobStatus.UNASSIGNED } : t));
            }
            setJobs(prev => prev.filter(j => j.id !== jobId));
            if (expandedJobId === jobId) setExpandedJobId(null);
        }
    };

    const handleSaveJob = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJob) return;

        // Sync Technician State
        const oldJob = jobs.find(j => j.id === editingJob.id);
        const oldTechId = oldJob?.assignedTech;
        const newTechId = editingJob.assignedTech;

        if (oldTechId !== newTechId) {
            setTechs(prevTechs => prevTechs.map(t => {
                if (t.id === oldTechId) {
                    // Free up old tech
                    return { ...t, currentJob: null, status: JobStatus.UNASSIGNED };
                }
                if (t.id === newTechId) {
                    // Assign new tech
                    return { ...t, currentJob: editingJob.id, status: JobStatus.DISPATCHED };
                }
                return t;
            }));

            // Auto-update job status
            if (newTechId && editingJob.status === JobStatus.UNASSIGNED) {
                editingJob.status = JobStatus.DISPATCHED;
            }
            if (!newTechId && editingJob.status !== JobStatus.COMPLETED && editingJob.status !== JobStatus.CANCELLED) {
                editingJob.status = JobStatus.UNASSIGNED;
            }
        }

        // Check for critical changes to alert tech
        if (newTechId && oldJob) {
            const changes: string[] = [];
            if (new Date(oldJob.appointmentTime).getTime() !== new Date(editingJob.appointmentTime).getTime()) {
                changes.push(`Time changed to ${new Date(editingJob.appointmentTime).toLocaleString()}`);
            }
            if (oldJob.address !== editingJob.address) {
                changes.push(`Address updated to ${editingJob.address}`);
            }
            if (oldJob.notes !== editingJob.notes) {
                changes.push(`Notes updated`);
            }

            if (changes.length > 0) {
                const alertMessage = `⚠️ Job Update for ${editingJob.customerName}: ${changes.join(', ')}.`;
                sendMessage(alertMessage, 'OFFICE', newTechId);
            }
        }

        setJobs(prev => {
            const exists = prev.find(j => j.id === editingJob.id);
            if (exists) {
                return prev.map(j => j.id === editingJob.id ? editingJob : j);
            } else {
                return [...prev, editingJob];
            }
        });
        setIsJobModalOpen(false);
        setEditingJob(null);
    };

    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        const tourShown = localStorage.getItem('officeTourShown');
        if (!tourShown) setShowTour(true);
    }, []);

    const handleTourComplete = () => {
        localStorage.setItem('officeTourShown', 'true');
        setShowTour(false);
    };

    const handleOptimizeDispatch = async () => {
        setIsOptimizing(true);
        try {
            const { assignments, reasoning } = await optimizeDispatch(jobs, techs);

            // Apply assignments
            const newJobs = [...jobs];
            const newTechs = [...techs];

            assignments.forEach(({ jobId, techId }) => {
                const jobIndex = newJobs.findIndex(j => j.id === jobId);
                if (jobIndex !== -1) {
                    newJobs[jobIndex] = { ...newJobs[jobIndex], assignedTech: techId, status: JobStatus.DISPATCHED };
                }

                const techIndex = newTechs.findIndex(t => t.id === techId);
                if (techIndex !== -1) {
                    newTechs[techIndex] = { ...newTechs[techIndex], currentJob: jobId, status: JobStatus.DISPATCHED };
                }
            });

            setJobs(newJobs);
            setTechs(newTechs);
            alert(`Optimization Complete: ${reasoning}`);
        } catch (error) {
            console.error("Optimization failed:", error);
            alert("Dispatch optimization failed. Please check the console.");
        }
        setIsOptimizing(false);
    };

    const handleChatSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim()) return;
        const userMessage = chatInput;
        setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
        setChatInput('');

        try {
            const botResponse = await chatWithAssistant(userMessage, jobs, techs);
            setChatHistory(prev => [...prev, { sender: 'bot', text: botResponse }]);
            if (botResponse.includes("New job created")) {
                const newJob = await parseJobRequest(userMessage);
                if (newJob) {
                    setJobs(prev => [...prev, newJob]);
                    setChatHistory(prev => [...prev, { sender: 'bot', text: `Job ${newJob.id} added based on your request.` }]);
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't process that." }]);
        }
    };

    const startListening = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setIsListening(false);
                    try {
                        const transcription = await transcribeAudio(audioBlob);
                        setChatInput(transcription);
                        handleChatSubmit();
                    } catch (error) {
                        console.error("Transcription error:", error);
                        setChatHistory(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't understand that." }]);
                    }
                };
                mediaRecorderRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone.");
            }
        } else {
            alert("Your browser does not support audio recording.");
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    const filteredJobs = jobs.filter(job => selectedDivision === 'all' || job.division === selectedDivision);
    const filteredTechs = techs.filter(tech => selectedDivision === 'all' || tech.division === selectedDivision);

    const jobsByStatus = Object.values(JobStatus).reduce((acc, status) => {
        acc[status] = filteredJobs.filter(j => j.status === status).length;
        return acc;
    }, {} as Record<JobStatus, number>);

    const data = Object.entries(jobsByStatus).map(([name, value]) => ({ name, value }));

    const downloadData = (data: any[], filename: string) => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-1 h-full bg-gray-100 font-sans text-slate-800 overflow-hidden">
            {showTour && <OnboardingTour tourId="OFFICE" onComplete={handleTourComplete} />}
            {/* Sidebar */}
            <div id="sidebar" className="w-16 bg-slate-900 text-white flex flex-col items-center py-4 space-y-6">
                <button onClick={() => setActiveTab('map')} className={`p-2 rounded-lg ${activeTab === 'map' ? 'bg-indigo-600' : ''}`} title="Dispatch Map"><LayoutDashboard /></button>
                <button onClick={() => setActiveTab('inventory')} className={`p-2 rounded-lg ${activeTab === 'inventory' ? 'bg-indigo-600' : ''}`} title="Inventory"><Archive /></button>
                <button onClick={() => setActiveTab('techs')} className={`p-2 rounded-lg ${activeTab === 'techs' ? 'bg-indigo-600' : ''}`} title="Technicians"><Users /></button>
                <button onClick={() => setActiveTab('messages')} className={`p-2 rounded-lg ${activeTab === 'messages' ? 'bg-indigo-600' : ''}`} title="Messages"><MessageSquare /></button>
                <button onClick={() => setShowChat(!showChat)} className={`p-2 rounded-lg mt-auto ${showChat ? 'bg-green-600' : ''}`} title="AI Assistant"><Bot /></button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Side Panel */}
                {(sidePanelView && activeTab === 'map') && (
                    <div className="w-80 bg-white overflow-y-auto shadow-lg p-4 space-y-4">
                        <div className="flex justify-around mb-4">
                            <button onClick={() => setSidePanelView('jobs')} className={`px-4 py-2 rounded ${sidePanelView === 'jobs' ? 'bg-indigo-100 text-indigo-700' : ''}`}>Jobs</button>
                            <button onClick={() => setSidePanelView('techs')} className={`px-4 py-2 rounded ${sidePanelView === 'techs' ? 'bg-indigo-100 text-indigo-700' : ''}`}>Techs</button>
                        </div>
                        {sidePanelView === 'jobs' && (
                            <div id="job-list">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-semibold">Jobs ({filteredJobs.length})</h3>
                                    <button onClick={handleCreateJob} className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600" title="Add Job"><Plus size={20} /></button>
                                </div>
                                <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value as Division | 'all')} className="mb-2 p-1 border rounded w-full">
                                    <option value="all">All Divisions</option>
                                    {Object.values(Division).map(div => <option key={div} value={div}>{div}</option>)}
                                </select>
                                <button onClick={handleOptimizeDispatch} disabled={isOptimizing} className="w-full bg-green-500 text-white p-2 rounded mb-2 disabled:opacity-50">
                                    {isOptimizing ? 'Optimizing...' : 'Optimize Dispatch'}
                                </button>
                                {filteredJobs.map(job => (
                                    <div key={job.id} className={`p-2 mb-2 rounded shadow cursor-pointer ${expandedJobId === job.id ? 'bg-indigo-50' : 'bg-white'}`} onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}>
                                        <p className="font-semibold">{job.customerName} ({job.priority})</p>
                                        <p className="text-sm text-gray-600">{job.address}</p>
                                        <p className={`text-sm font-medium ${job.status === JobStatus.COMPLETED ? 'text-green-600' : 'text-orange-600'}`}>{job.status}</p>
                                        {expandedJobId === job.id && (
                                            <div className="mt-2 text-sm">
                                                <p>Tech: {job.assignedTech ? techs.find(t => t.id === job.assignedTech)?.name : 'Unassigned'}</p>
                                                <p>Division: {job.division}</p>
                                                <p>Notes: {job.notes}</p>
                                                <p>Appointment: {new Date(job.appointmentTime).toLocaleString()}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditJob(job); }} className="flex-1 bg-yellow-500 text-white p-1 rounded flex items-center justify-center gap-1 hover:bg-yellow-600"><Edit size={14} /> Edit</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }} className="flex-1 bg-red-500 text-white p-1 rounded flex items-center justify-center gap-1 hover:bg-red-600"><Trash2 size={14} /> Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {sidePanelView === 'techs' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Technicians ({filteredTechs.length})</h3>
                                {filteredTechs.map(tech => (
                                    <div key={tech.id} className={`p-2 mb-2 rounded shadow cursor-pointer ${expandedTechId === tech.id ? 'bg-blue-50' : 'bg-white'}`} onClick={() => setExpandedTechId(expandedTechId === tech.id ? null : tech.id)}>
                                        <p className="font-semibold">{tech.name} ({tech.division})</p>
                                        <p className={`text-sm ${tech.status === JobStatus.UNASSIGNED ? 'text-green-600' : 'text-blue-600'}`}>{tech.status === JobStatus.UNASSIGNED ? 'Available' : tech.status}</p>
                                        {expandedTechId === tech.id && (
                                            <div className="mt-2 text-sm">
                                                <p>Current Job: {tech.currentJob || 'None'}</p>
                                                <p>Skills: {tech.skills.join(', ')}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'map' && (
                        <div className="h-full w-full relative">
                            <MapVisualization
                                jobs={filteredJobs}
                                techs={filteredTechs}
                                onJobClick={(jobId) => setExpandedJobId(jobId)}
                                selectedJobId={expandedJobId}
                                selectedTechId={expandedTechId}
                            />
                        </div>
                    )}
                    {activeTab === 'inventory' && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Inventory Management</h2>
                            <button onClick={() => downloadData(inventory, 'inventory.json')} className="mb-4 bg-blue-500 text-white p-2 rounded flex items-center gap-1"><FileDown size={16} /> Download Inventory</button>
                            <div className="bg-white p-4 rounded shadow">
                                {inventory.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-2 border-b">
                                        <span>{item.name}</span>
                                        <span>Qty: {item.quantity} {item.techId ? `(Tech: ${techs.find(t => t.id === item.techId)?.name})` : '(Main)'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'techs' && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Technician Performance</h2>
                            <button onClick={() => downloadData(techs, 'techs.json')} className="mb-4 bg-blue-500 text-white p-2 rounded flex items-center gap-1"><FileDown size={16} /> Download Tech Data</button>
                            <div className="bg-white p-4 rounded shadow mb-6">
                                <h3 className="text-xl font-semibold mb-2">Jobs per Tech</h3>
                                {/* Basic bar chart placeholder */}
                                {techs.map(tech => (
                                    <div key={tech.id} className="flex justify-between items-center p-1">
                                        <span>{tech.name}</span>
                                        <span>{jobs.filter(j => j.assignedTech === tech.id).length} jobs</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white p-4 rounded shadow">
                                <h3 className="text-xl font-semibold mb-2">Job Status Overview</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    {activeTab === 'messages' && (
                        <div className="h-full flex flex-col">
                            <h2 className="text-2xl font-semibold mb-4">Instant Messaging</h2>
                            <div className="flex-1 flex gap-4 overflow-hidden">
                                {/* Tech List for Messaging */}
                                <div className="w-64 bg-white rounded shadow overflow-y-auto">
                                    {techs.map(tech => (
                                        <div
                                            key={tech.id}
                                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedTechForMsg === tech.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                            onClick={() => setSelectedTechForMsg(tech.id)}
                                        >
                                            <p className="font-semibold">{tech.name}</p>
                                            <p className="text-xs text-gray-500">{tech.division}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Message Thread */}
                                <div className="flex-1 bg-white rounded shadow flex flex-col">
                                    {selectedTechForMsg ? (
                                        <>
                                            <div className="p-4 border-b font-semibold bg-gray-50">
                                                Chat with {techs.find(t => t.id === selectedTechForMsg)?.name}
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                {messages.filter(m => (m.senderId === 'OFFICE' && m.receiverId === selectedTechForMsg) || (m.senderId === selectedTechForMsg && m.receiverId === 'OFFICE')).map(msg => (
                                                    <div key={msg.id} className={`flex ${msg.senderId === 'OFFICE' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === 'OFFICE' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                            <p>{msg.text}</p>
                                                            <p className={`text-xs mt-1 ${msg.senderId === 'OFFICE' ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {messages.filter(m => (m.senderId === 'OFFICE' && m.receiverId === selectedTechForMsg) || (m.senderId === selectedTechForMsg && m.receiverId === 'OFFICE')).length === 0 && (
                                                    <p className="text-center text-gray-400 mt-10">No messages yet. Start the conversation!</p>
                                                )}
                                            </div>
                                            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                                                <input
                                                    type="text"
                                                    value={messageInput}
                                                    onChange={e => setMessageInput(e.target.value)}
                                                    className="flex-1 border p-2 rounded"
                                                    placeholder="Type a message..."
                                                />
                                                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"><Send size={20} /></button>
                                            </form>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-gray-400">
                                            Select a technician to message
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Chat Panel */}
                {showChat && (
                    <div className="w-[450px] bg-white shadow-lg flex flex-col p-4 border-l h-full">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bot size={20} /> AI Assistant</h3>
                        <div className="flex-1 overflow-y-auto mb-4 p-2 bg-gray-50 rounded space-y-2">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900 ml-auto' : 'bg-green-100 text-green-900'}`} style={{ maxWidth: '80%' }}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Ask or command..." />
                            <button type="button" onClick={isListening ? stopListening : startListening} className={`p-2 rounded ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                                {isListening ? 'Stop' : 'Mic'}
                            </button>
                            <button type="submit" className="bg-green-500 text-white p-2 rounded">Send</button>
                        </form>
                    </div>
                )}
            </div>

            {/* Job Modal */}
            {
                isJobModalOpen && editingJob && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                        <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">{editingJob.id.startsWith('job-') && !jobs.find(j => j.id === editingJob.id) ? 'Add New Job' : 'Edit Job'}</h3>
                                <button onClick={() => setIsJobModalOpen(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSaveJob} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium">Customer Name</label>
                                    <input type="text" required className="w-full border p-2 rounded" value={editingJob.customerName} onChange={e => setEditingJob({ ...editingJob, customerName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Address</label>
                                    <input type="text" required className="w-full border p-2 rounded" value={editingJob.address} onChange={e => setEditingJob({ ...editingJob, address: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Division</label>
                                    <select className="w-full border p-2 rounded" value={editingJob.division} onChange={e => setEditingJob({ ...editingJob, division: e.target.value as Division })}>
                                        {Object.values(Division).map(div => <option key={div} value={div}>{div}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Priority</label>
                                    <select className="w-full border p-2 rounded" value={editingJob.priority} onChange={e => setEditingJob({ ...editingJob, priority: e.target.value as PriorityLevel })}>
                                        {Object.values(PriorityLevel).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Assigned Technician</label>
                                    <select className="w-full border p-2 rounded" value={editingJob.assignedTech || ''} onChange={e => setEditingJob({ ...editingJob, assignedTech: e.target.value || null, division: editingJob.division })}>
                                        <option value="">Unassigned</option>
                                        {techs.map(tech => <option key={tech.id} value={tech.id}>{tech.name} ({tech.division})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Appointment Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={editingJob.appointmentTime ? new Date(editingJob.appointmentTime).toISOString().slice(0, 16) : ''}
                                        onChange={e => setEditingJob({ ...editingJob, appointmentTime: new Date(e.target.value).toISOString() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Notes</label>
                                    <textarea className="w-full border p-2 rounded" value={editingJob.notes} onChange={e => setEditingJob({ ...editingJob, notes: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save Job</button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default OfficeDashboard;
