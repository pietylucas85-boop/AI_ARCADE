import React from 'react';
import { Job, JobStatus, Technician } from '../types';
import { MapPin, Phone, Star, Clock } from 'lucide-react';

interface CustomerPortalProps {
    job: Job;
    tech?: Technician;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ job, tech }) => {

    const getStatusMessage = () => {
        switch (job.status) {
            case JobStatus.DISPATCHED:
                return "Technician Assigned";
            case JobStatus.EN_ROUTE:
                return "Technician En Route";
            case JobStatus.IN_PROGRESS:
                return "Work In Progress";
            case JobStatus.COMPLETED:
                return "Job Completed";
            default:
                return "Scheduling...";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                {/* Header / Map Placeholder */}
                <div className="h-64 bg-slate-200 relative">
                    {/* Mock Map Background */}
                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-73.9352,40.7306,13,0/600x400?access_token=mock')] bg-cover bg-center opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                        <h1 className="text-3xl font-bold mb-1">AI Fiber Service</h1>
                        <p className="text-lg font-light">{getStatusMessage()}</p>
                    </div>
                </div>

                {/* Job Details */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                        <MapPin className="text-indigo-600" size={20} />
                        <span className="text-slate-700">{job.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Clock className="text-indigo-600" size={20} />
                        <span className="text-slate-700">{new Date(job.appointmentTime).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-500 mb-2">Notes:</p>
                        <p className="text-slate-700">{job.notes}</p>
                    </div>
                </div>

                {/* Technician Info */}
                {tech && (job.status === JobStatus.DISPATCHED || job.status === JobStatus.EN_ROUTE || job.status === JobStatus.IN_PROGRESS) && (
                    <div className="bg-indigo-50 p-6 border-t border-indigo-100 flex items-center space-x-4">
                        <img src={`https://i.pravatar.cc/150?u=${tech.id}`} alt={tech.name} className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
                        <div>
                            <p className="font-semibold text-slate-800">{tech.name}</p>
                            <p className="text-sm text-indigo-700">Your Technician</p>
                            <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-current" />)}
                                <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                            </div>
                        </div>
                        <a href="tel:123-456-7890" className="ml-auto bg-white p-3 rounded-full shadow hover:bg-gray-50 transition">
                            <Phone size={20} className="text-indigo-600" />
                        </a>
                    </div>
                )}

                {/* Status Bar */}
                <div className="p-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Scheduled</span>
                        <span>Dispatched</span>
                        <span>En Route</span>
                        <span>Working</span>
                        <span>Done</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out ${job.status === JobStatus.DISPATCHED ? 'w-1/4' :
                                job.status === JobStatus.EN_ROUTE ? 'w-2/4' :
                                    job.status === JobStatus.IN_PROGRESS ? 'w-3/4' :
                                        job.status === JobStatus.COMPLETED ? 'w-full' : 'w-0'
                            }`}></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CustomerPortal;
