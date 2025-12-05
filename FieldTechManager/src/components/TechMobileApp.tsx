import React, { useState, useEffect } from 'react';
import { Job, JobStatus, QCData, SafetyChecklistItem, PriorityLevel, QCPhoto, Message } from '../types';
import { SAFETY_CHECKLIST_TEMPLATE } from '../constants';
import { analyzeQCPhotos } from '../services/geminiService';
import { VoiceCommander } from './VoiceCommander';
import { OnboardingTour } from './OnboardingTour';
import { Wifi, WifiOff, CheckCircle, MessageSquare, Send, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TechAppProps {
    techId: string;
    allJobs: Job[];
    updateJob: (job: Job) => void;
    messages: Message[];
    sendMessage: (text: string, senderId: string, receiverId: string) => void;
}

const markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const TechMobileApp: React.FC<TechAppProps> = ({ techId, allJobs, updateJob, messages, sendMessage }) => {
    // Offline State
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [pendingUpdates, setPendingUpdates] = useState<Job[]>([]);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const [view, setView] = useState<'list' | 'job' | 'qc' | 'safety' | 'messages' | 'photos'>('list');
    const [messageInput, setMessageInput] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        sendMessage(messageInput, techId, 'OFFICE');
        setMessageInput('');
    };
    const [safetyChecklist, setSafetyChecklist] = useState<SafetyChecklistItem[]>(SAFETY_CHECKLIST_TEMPLATE);
    const [qcData, setQcData] = useState<QCData>({ photos: [], notes: '' });
    const [showTour, setShowTour] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        setJobs(allJobs.filter(j => j.assignedTech === techId && j.status !== JobStatus.COMPLETED));
    }, [allJobs, techId]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            syncPendingUpdates();
        };
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [pendingUpdates]);

    useEffect(() => {
        const tourShown = localStorage.getItem('techTourShown');
        if (!tourShown) setShowTour(true);
    }, []);

    const handleTourComplete = () => {
        localStorage.setItem('techTourShown', 'true');
        setShowTour(false);
    };

    const syncPendingUpdates = async () => {
        if (isOffline || pendingUpdates.length === 0 || isSyncing) return;
        setIsSyncing(true);
        console.log("Syncing pending updates:", pendingUpdates);
        const updatesToSync = [...pendingUpdates];
        setPendingUpdates([]);

        try {
            // Simulate API call to sync updates
            await new Promise(resolve => setTimeout(resolve, 1000));
            updatesToSync.forEach(updatedJob => {
                updateJob(updatedJob); // Update the main state via prop
            });
            console.log("Sync successful");
            setJobs(prevJobs => prevJobs.map(j => updatesToSync.find(uj => uj.id === j.id) || j));
        } catch (error) {
            console.error("Sync failed, requeuing updates:", error);
            setPendingUpdates(prev => [...updatesToSync, ...prev]); // Add back if failed
        }
        setIsSyncing(false);
    };

    const updateJobStatus = (jobId: string, status: JobStatus) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            const updatedJob = { ...job, status };
            if (isOffline) {
                setPendingUpdates(prev => [...prev.filter(j => j.id !== jobId), { ...updatedJob, status: JobStatus.SYNC_PENDING }]);
                setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...updatedJob, status: JobStatus.SYNC_PENDING } : j));
            } else {
                updateJob(updatedJob);
                setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? updatedJob : j));
            }
            if (status === JobStatus.COMPLETED) {
                setCurrentJob(null);
                setView('list');
            }
        }
    };

    const selectJob = (job: Job) => {
        setCurrentJob(job);
        setView('job');
        setSafetyChecklist(SAFETY_CHECKLIST_TEMPLATE.map((item: SafetyChecklistItem) => ({ ...item, checked: false })));
        setQcData({ photos: [], notes: '' });
    };

    const handleSafetyCheck = (index: number, checked: boolean) => {
        const newChecklist = [...safetyChecklist];
        newChecklist[index].checked = checked;
        setSafetyChecklist(newChecklist);
    };

    const handleTakePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const newPhotos: QCPhoto[] = files.map(file => ({
                id: Date.now() + file.name,
                url: URL.createObjectURL(file),
                file: file,
                analysis: 'Analyzing...'
            }));
            setQcData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));

            newPhotos.forEach(async (photo) => {
                if (photo.file) {
                    try {
                        const analysis = await analyzeQCPhotos(photo.file);
                        setQcData(prev => ({
                            ...prev,
                            photos: prev.photos.map(p => p.id === photo.id ? { ...p, analysis } : p)
                        }));
                    } catch (error) {
                        console.error("Photo analysis error:", error);
                        setQcData(prev => ({
                            ...prev,
                            photos: prev.photos.map(p => p.id === photo.id ? { ...p, analysis: 'Analysis failed' } : p)
                        }));
                    }
                }
            });
        }
    };

    const allSafetyChecked = safetyChecklist.every(item => item.checked);

    if (!jobs.length && view === 'list') {
        return <div className="p-4 text-center">No jobs assigned or all completed.</div>;
    }

    return (
        <div className="font-sans max-w-md mx-auto bg-gray-50 h-screen flex flex-col overflow-hidden">
            <div className="p-4 flex-none bg-white shadow-sm z-10">
                {showTour && <OnboardingTour tourId="TECH" onComplete={handleTourComplete} />}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Tech App</h1>
                    <div className={`flex items-center gap-1 p-1 rounded ${isOffline ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
                        <span>{isOffline ? 'Offline' : 'Online'} {pendingUpdates.length > 0 ? `(${pendingUpdates.length})` : ''}</span>
                        {!isOffline && pendingUpdates.length > 0 && <button onClick={syncPendingUpdates} disabled={isSyncing}>{isSyncing ? 'Syncing...' : 'Sync Now'}</button>}
                        <button onClick={() => setView('messages')} className="ml-2 p-1 bg-blue-100 text-blue-700 rounded"><MessageSquare size={18} /></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {view === 'list' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">My Jobs</h2>
                        {jobs.map(job => (
                            <div key={job.id} onClick={() => selectJob(job)} className="bg-white p-3 mb-3 rounded shadow cursor-pointer">
                                <p className="font-semibold">{job.customerName} <span className={`text-sm font-medium p-1 rounded ${job.priority === PriorityLevel.HIGH ? 'bg-red-100 text-red-700' : job.priority === PriorityLevel.MEDIUM ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>{job.priority}</span></p>
                                <p className="text-sm text-gray-600">{job.address}</p>
                                <p className={`text-sm font-medium ${job.status === JobStatus.SYNC_PENDING ? 'text-blue-600' : 'text-orange-600'}`}>{job.status}</p>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'job' && currentJob && (
                    <div className="bg-white p-4 rounded shadow">
                        <button onClick={() => setView('list')} className="mb-4 text-blue-600">&lt; Back to List</button>
                        <h2 className="text-xl font-semibold mb-2">{currentJob.customerName}</h2>
                        <p className="text-sm text-gray-600 mb-2">{currentJob.address}</p>
                        <div className="h-40 w-full mb-4 rounded overflow-hidden">
                            <MapContainer center={[currentJob.location.lat, currentJob.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[currentJob.location.lat, currentJob.location.lng]} icon={markerIcon}>
                                    <Popup>{currentJob.address}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <p className="mb-4">Status: {currentJob.status}</p>
                        <div className="flex flex-col space-y-2">
                            <button onClick={() => updateJobStatus(currentJob.id, JobStatus.EN_ROUTE)} className="bg-blue-500 text-white p-2 rounded disabled:opacity-50" disabled={currentJob.status !== JobStatus.DISPATCHED}>Start Travel (En Route)</button>
                            <button onClick={() => setView('safety')} className="bg-yellow-500 text-white p-2 rounded disabled:opacity-50" disabled={currentJob.status !== JobStatus.EN_ROUTE}>Arrived - Start Safety Check</button>
                            <button onClick={() => updateJobStatus(currentJob.id, JobStatus.IN_PROGRESS)} className="bg-green-500 text-white p-2 rounded disabled:opacity-50" disabled={currentJob.status !== JobStatus.EN_ROUTE || !allSafetyChecked}>Start Work (In Progress)</button>
                            <button onClick={() => setView('photos')} className="bg-indigo-500 text-white p-2 rounded flex items-center justify-center gap-2"><Camera size={18} /> Job Photos ({qcData.photos.length})</button>
                            <button onClick={() => setView('qc')} className="bg-purple-500 text-white p-2 rounded disabled:opacity-50" disabled={currentJob.status !== JobStatus.IN_PROGRESS}>Work Done - Start QC</button>
                            <button onClick={() => updateJobStatus(currentJob.id, JobStatus.COMPLETED)} className="bg-gray-500 text-white p-2 rounded disabled:opacity-50" disabled={currentJob.status !== JobStatus.QC_CHECK}>Complete Job</button>
                        </div>
                        <VoiceCommander onCommand={(command) => {
                            if (command.includes("start travel")) updateJobStatus(currentJob.id, JobStatus.EN_ROUTE);
                            else if (command.includes("safety check")) setView('safety');
                            else if (command.includes("start work")) updateJobStatus(currentJob.id, JobStatus.IN_PROGRESS);
                            else if (command.includes("quality check")) setView('qc');
                            else if (command.includes("complete job")) updateJobStatus(currentJob.id, JobStatus.COMPLETED);
                        }} />
                    </div>
                )}

                {view === 'safety' && currentJob && (
                    <div className="bg-white p-4 rounded shadow">
                        <button onClick={() => setView('job')} className="mb-4 text-blue-600">&lt; Back to Job</button>
                        <h2 className="text-xl font-semibold mb-2">Safety Checklist</h2>
                        {safetyChecklist.map((item, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input type="checkbox" id={`safety-${index}`} checked={item.checked} onChange={(e) => handleSafetyCheck(index, e.target.checked)} className="mr-2" />
                                <label htmlFor={`safety-${index}`}>{item.text}</label>
                            </div>
                        ))}
                        {allSafetyChecked && <p className="text-green-600 font-semibold mt-2 flex items-center gap-1"><CheckCircle size={16} /> Safety check complete!</p>}
                    </div>
                )}

                {view === 'photos' && currentJob && (
                    <div className="bg-white p-4 rounded shadow">
                        <button onClick={() => setView('job')} className="mb-4 text-blue-600">&lt; Back to Job</button>
                        <h2 className="text-xl font-semibold mb-2">Job Photos</h2>

                        <div className="mb-4 sticky top-0 bg-white pt-2 pb-2 z-10">
                            <div className="flex gap-2">
                                <label htmlFor="job-photos" className="flex-1 bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg">
                                    <Camera size={32} />
                                    <span className="font-bold text-xl">Take Photo</span>
                                </label>
                                <input
                                    type="file"
                                    id="job-photos"
                                    multiple
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleTakePhoto}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {qcData.photos.map(photo => (
                                <div key={photo.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                                    <img src={photo.url} alt="Job Photo" className="w-full h-full object-cover" />
                                    <div className={`absolute bottom-0 left-0 right-0 p-1 text-xs text-white ${photo.analysis === 'Analyzing...' ? 'bg-blue-600/80' : photo.analysis !== 'OK' ? 'bg-red-600/80' : 'bg-green-600/80'}`}>
                                        {photo.analysis}
                                    </div>
                                </div>
                            ))}
                            {qcData.photos.length === 0 && (
                                <div className="col-span-2 text-center text-gray-400 py-10 border-2 border-dashed rounded-lg">
                                    No photos yet. Tap the button above to start documenting.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'qc' && currentJob && (
                    <div className="bg-white p-4 rounded shadow">
                        <button onClick={() => setView('job')} className="mb-4 text-blue-600">&lt; Back to Job</button>
                        <h2 className="text-xl font-semibold mb-2">Quality Check</h2>
                        <div className="mb-4">
                            <label htmlFor="qc-notes" className="block mb-1 font-medium">Notes:</label>
                            <textarea id="qc-notes" value={qcData.notes} onChange={(e) => setQcData({ ...qcData, notes: e.target.value })} className="w-full p-2 border rounded" rows={3}></textarea>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium mb-2">Photos ({qcData.photos.length})</h3>
                            <button onClick={() => setView('photos')} className="w-full p-2 border border-blue-500 text-blue-600 rounded flex items-center justify-center gap-2 mb-2">
                                <Camera size={16} /> Manage Photos
                            </button>
                        </div>

                        <button onClick={() => updateJobStatus(currentJob.id, JobStatus.QC_CHECK)} className="bg-green-500 text-white p-2 rounded w-full">Submit QC</button>
                    </div>
                )}

                {view === 'messages' && (
                    <div className="bg-white p-4 rounded shadow h-[calc(100vh-100px)] flex flex-col">
                        <button onClick={() => setView('list')} className="mb-4 text-blue-600">&lt; Back to List</button>
                        <h2 className="text-xl font-semibold mb-2">Messages with Office</h2>
                        <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-gray-50 rounded mb-4">
                            {messages.filter(m => (m.senderId === 'OFFICE' && m.receiverId === techId) || (m.senderId === techId && m.receiverId === 'OFFICE')).map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === techId ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg ${msg.senderId === techId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-xs mt-1 ${msg.senderId === techId ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                            {messages.filter(m => (m.senderId === 'OFFICE' && m.receiverId === techId) || (m.senderId === techId && m.receiverId === 'OFFICE')).length === 0 && (
                                <p className="text-center text-gray-400 mt-10">No messages yet.</p>
                            )}
                        </div>
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                className="flex-1 border p-2 rounded"
                                placeholder="Type a message..."
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"><Send size={20} /></button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechMobileApp;
