import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { OnboardingData, VoiceTargetField } from '../types';
import { UploadIcon, SparklesIcon, MicrophoneIcon, ErrorIcon } from './IconComponents';
import ToggleSwitch from './ToggleSwitch';

interface OnboardingFormProps {
    onSubmit: (data: OnboardingData) => void;
    isGenerating: boolean;
    initialName: string;
    initialDescription: string;
    isVoiceControlEnabled: boolean;
    onVoiceControlToggle: () => void;
    voiceTargetField: VoiceTargetField;
    onFieldVoiceActivate: (field: 'name' | 'description') => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const OnboardingForm: React.FC<OnboardingFormProps> = ({
    onSubmit,
    isGenerating,
    initialName,
    initialDescription,
    isVoiceControlEnabled,
    onVoiceControlToggle,
    voiceTargetField,
    onFieldVoiceActivate,
}) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [files, setFiles] = useState<File[]>([]);
    const [usePlaceholders, setUsePlaceholders] = useState(false);
    const [fileErrors, setFileErrors] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    const validateFiles = useCallback((newFiles: FileList | null) => {
        const currentFiles = Array.from(newFiles || []);
        const errors: string[] = [];
        const validFiles: File[] = [];

        currentFiles.forEach(file => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: Exceeds 10MB limit.`);
            } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                errors.push(`${file.name}: Invalid file type (only JPG, PNG, GIF).`);
            } else {
                validFiles.push(file);
            }
        });

        setFileErrors(errors);
        return validFiles;
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const validFiles = validateFiles(event.target.files);
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }, [validateFiles]);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const validFiles = validateFiles(event.dataTransfer.files);
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }, [validateFiles]);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const removeFile = useCallback((index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    }, []);

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        if (files.length === 0 && !usePlaceholders) {
            setFileErrors(["Please upload at least one artwork image or enable AI placeholders."]);
            return;
        }
        setFileErrors([]);
        onSubmit({ name, description, files, usePlaceholders });
    }, [name, description, files, usePlaceholders, onSubmit]);

    const canSubmit = useMemo(() => {
        return name.trim() && description.trim() && (files.length > 0 || usePlaceholders) && !isGenerating;
    }, [name, description, files, usePlaceholders, isGenerating]);

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
            <h1 className="text-3xl font-bold text-center mb-2 text-purple-300">Create Your Digital Portfolio</h1>
            <p className="text-center text-gray-400 mb-6">Tell us about yourself and upload your art, or let AI generate placeholders!</p>

            <div className="flex justify-center mb-6">
                <ToggleSwitch
                    isEnabled={isVoiceControlEnabled}
                    onToggle={onVoiceControlToggle}
                    label="Voice Control"
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Artist Name</label>
                    <div className="relative">
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Vincent van Gogh"
                            className={`w-full bg-gray-700 border ${voiceTargetField === 'name' ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-600'} rounded-md p-3 text-white focus:ring-purple-500 focus:border-purple-500 transition duration-200`}
                            required
                        />
                        {isVoiceControlEnabled && (
                            <button
                                type="button"
                                onClick={() => onFieldVoiceActivate('name')}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${voiceTargetField === 'name' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-purple-500'}`}
                                aria-label="Activate voice for name"
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">About the Artist / Art Style</label>
                    <div className="relative">
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your art, influences, and what makes your work unique..."
                            rows={5}
                            className={`w-full bg-gray-700 border ${voiceTargetField === 'description' ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-600'} rounded-md p-3 text-white focus:ring-purple-500 focus:border-purple-500 transition duration-200`}
                            required
                        />
                        {isVoiceControlEnabled && (
                            <button
                                type="button"
                                onClick={() => onFieldVoiceActivate('description')}
                                className={`absolute right-2 top-3 p-1.5 rounded-full ${voiceTargetField === 'description' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-purple-500'}`}
                                aria-label="Activate voice for description"
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Upload Your Artwork (JPG, PNG, GIF - max 10MB each)</label>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 ${isDragging ? 'border-purple-500 bg-gray-700' : 'border-gray-600 border-dashed'} rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition duration-200 relative`}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            multiple
                            onChange={handleFileChange}
                            accept={ALLOWED_FILE_TYPES.join(',')}
                            className="hidden"
                            disabled={usePlaceholders}
                        />
                        <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-full ${usePlaceholders ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">Max 10MB per file</p>
                        </label>
                    </div>
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-gray-300">Selected files:</h4>
                            {files.map((file, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded-md text-sm">
                                    <span className="text-gray-300 truncate w-4/5">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-300 font-bold">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {fileErrors.length > 0 && (
                        <div className="mt-4 space-y-1">
                            {fileErrors.map((error, index) => (
                                <p key={index} className="text-red-400 text-sm flex items-center"><ErrorIcon className="w-4 h-4 mr-1" /> {error}</p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center space-x-3 bg-gray-700 p-3 rounded-md">
                    <input
                        type="checkbox"
                        id="usePlaceholders"
                        checked={usePlaceholders}
                        onChange={(e) => setUsePlaceholders(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500 bg-gray-600"
                    />
                    <label htmlFor="usePlaceholders" className="text-sm font-medium text-gray-300">
                        No artwork? Let AI generate placeholders based on your description.
                    </label>
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isGenerating ? 'Generating...' : 'Create My Portfolio'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OnboardingForm;
