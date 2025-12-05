import React, { useState, useEffect } from 'react';
import OfficeDashboard from './components/OfficeDashboard';
import TechMobileApp from './components/TechMobileApp';
import CustomerPortal from './components/CustomerPortal';
import { Job, Technician, InventoryItem, UserRole, Message } from './types';
import { MOCK_JOBS, MOCK_TECHS, MOCK_INVENTORY } from './constants';
import { OnboardingTour } from './components/OnboardingTour';

const App: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
    const [techs, setTechs] = useState<Technician[]>(MOCK_TECHS);
    const [inventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.OFFICE);
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        // Check if the tour has been shown before
        const tourShown = localStorage.getItem('tourShown');
        if (!tourShown) {
            setShowTour(true);
        }
    }, []);

    const handleTourComplete = () => {
        localStorage.setItem('tourShown', 'true');
        setShowTour(false);
    };

    const updateJob = (updatedJob: Job) => {
        setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    };

    const sendMessage = (text: string, senderId: string, receiverId: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId,
            receiverId,
            text,
            timestamp: new Date().toISOString(),
            read: false
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const renderRoleSwitcher = () => (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={() => setCurrentRole(UserRole.OFFICE)} disabled={currentRole === UserRole.OFFICE}>Office View</button>
            <button onClick={() => setCurrentRole(UserRole.TECH)} disabled={currentRole === UserRole.TECH}>Tech View</button>
            <button onClick={() => setCurrentRole(UserRole.CUSTOMER)} disabled={currentRole === UserRole.CUSTOMER}>Customer View</button>
            <button onClick={() => setShowTour(true)} style={{ marginLeft: 'auto' }}>Show Tour</button>
        </div>
    );

    const renderAppByRole = () => {
        switch (currentRole) {
            case UserRole.OFFICE:
                return <OfficeDashboard
                    jobs={jobs}
                    techs={techs}
                    inventory={inventory}
                    setJobs={setJobs}
                    setTechs={setTechs}
                    updateJob={updateJob}
                    messages={messages}
                    sendMessage={sendMessage}
                />;
            case UserRole.TECH:
                // For simplicity, let's assume the first tech is logged in
                return <TechMobileApp
                    techId={techs[0].id}
                    allJobs={jobs}
                    updateJob={updateJob}
                    messages={messages}
                    sendMessage={sendMessage}
                />;
            case UserRole.CUSTOMER:
                // For simplicity, let's show the portal for the customer of the first job
                return <CustomerPortal job={jobs[0]} />;
            default:
                return <div>Select a role</div>;
        }
    };

    return (
        <div className="h-screen w-full overflow-hidden bg-gray-100 flex flex-col">
            {renderRoleSwitcher()}
            {showTour && <OnboardingTour tourId="OFFICE" onComplete={handleTourComplete} />}
            {!showTour && renderAppByRole()}
        </div>
    );
};

export default App;
