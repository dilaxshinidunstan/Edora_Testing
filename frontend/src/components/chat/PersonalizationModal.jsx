import React, { useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SuccessMessage from '../messages/SuccessMessage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const VALID_GRADES = [
    'Below grade 6', '6', '7', '8', '9', '10', 'O/L', 'A/L', 'Above A/L'
];

const INTEREST_OPTIONS = [
    'Drawing & Painting',
    'Reading Books',
    'Listening to Music',
    'Playing Video Games',
    'Sports & Fitness',
    'Writing Stories/Poems',
    'Singing or Playing Instruments',
    'Cooking & Baking',
    'Traveling & Exploring'
];

const PersonalizationModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        callingName: '',
        grade: '',
        interests: [],
        otherInterest: '',
        progress: {
            grammar: 0,
            vocabulary: 0,
            conversation: 0
        }
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCallingNameChange = (e) => {
        setFormData(prev => ({
            ...prev,
            callingName: e.target.value
        }));
    };

    const handleGradeChange = (e) => {
        setFormData(prev => ({
            ...prev,
            grade: e.target.value
        }));
    };

    const handleInterestChange = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleOtherInterestChange = (e) => {
        setFormData(prev => ({
            ...prev,
            otherInterest: e.target.value
        }));
    };

    const handleProgressChange = (skill, value) => {
        setFormData(prev => ({
            ...prev,
            progress: {
                ...prev.progress,
                [skill]: parseInt(value)
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsSubmitting(true);

        try {
            const interests = [
                ...formData.interests,
                ...(formData.otherInterest ? [formData.otherInterest] : [])
            ];

            const submitData = {
                calling_name: formData.callingName,
                grade: formData.grade,
                interests,
                progress: formData.progress
            };

            if (!submitData.grade) {
                throw new Error('Please select your grade');
            }
            if (interests.length === 0) {
                throw new Error('Please select at least one interest');
            }

            const response = await axios.post(
                `${apiBaseUrl}/learner/save-or-update-learner-profile/`,
                submitData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                }
            );

            if (response.data.status === 'success') {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onClose={onClose} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="min-h-full flex items-center justify-center p-4">
                        <Dialog.Panel className="mx-auto w-full max-w-4xl bg-white shadow-xl my-auto max-h-[90vh] overflow-y-auto">
                            <div className="grid md:grid-cols-2 h-full">
                                {/* Left Column - Grade and Interests */}
                                <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 md:max-h-none h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2">
                                        <Dialog.Title className="text-xl font-medium text-gray-900">
                                            Personalize Your Learning
                                        </Dialog.Title>
                                        <button onClick={onClose} className="md:hidden">
                                            <XMarkIcon className="h-6 w-6 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-primary">
                                        {/* Calling Name Field */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                What should I call you? 😊
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter your preferred name"
                                                value={formData.callingName}
                                                onChange={handleCallingNameChange}
                                                className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                                maxLength="30"
                                            />
                                        </div>

                                        {/* Grade Selection */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                What grade are you in?
                                            </label>
                                            <select
                                                value={formData.grade}
                                                onChange={handleGradeChange}
                                                className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                            >
                                                <option value="">Select your grade</option>
                                                {VALID_GRADES.map(grade => (
                                                    <option key={grade} value={grade}>{grade}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Interests Selection */}
                                        <div className="mb-6 md:mb-0">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tell us about your hobbies! 😊
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                                {INTEREST_OPTIONS.map(interest => (
                                                    <label key={interest} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.interests.includes(interest)}
                                                            onChange={() => handleInterestChange(interest)}
                                                            className="rounded text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-sm">{interest}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Other interests..."
                                                value={formData.otherInterest}
                                                onChange={handleOtherInterestChange}
                                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Progress and Submit */}
                                <div className="p-6 relative h-full flex flex-col">
                                    <button onClick={onClose} className="hidden md:block absolute top-6 right-6">
                                        <XMarkIcon className="h-6 w-6 text-gray-400" />
                                    </button>

                                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-primary">
                                        {/* Progress Sliders */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                                Can you rate your skills in these areas?
                                            </label>
                                            {Object.entries(formData.progress).map(([skill, value]) => (
                                                <div key={skill} className="mb-4">
                                                    <div className="flex justify-between mb-1">
                                                        <label className="text-sm text-gray-600 capitalize">
                                                            {skill}
                                                        </label>
                                                        <span className="text-sm text-gray-600">{value}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={value}
                                                        onChange={(e) => handleProgressChange(skill, e.target.value)}
                                                        className="w-full accent-primary"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {error && (
                                            <div className="text-red-500 text-sm mb-4">{error}</div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="w-full bg-primary text-white py-3 px-4 rounded-2xl hover:bg-strong_cyan transition-colors duration-200 disabled:opacity-50 sticky bottom-0"
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
            {success && (
                <SuccessMessage message="Preferences saved successfully!" isPersistent={false} />
            )}
        </>
    );
};

export default PersonalizationModal;