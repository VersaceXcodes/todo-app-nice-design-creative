import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { UpdateUserPreferenceInput } from '@schema';

interface Slide {
  title: string;
  content: string;
}

const slides: Slide[] = [
  { title: "Welcome!", content: "Explore the features of Creative ToDo App." },
  { title: "Task Management", content: "Create, edit, and organize your tasks efficiently." },
  { title: "Customizations", content: "Choose light or dark mode and set your default view." },
  { title: "Notifications", content: "Stay updated with task reminders." },
];

const UV_Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState('light');
  const [defaultView, setDefaultView] = useState('list');
  const navigate = useNavigate();

  const auth_token = useAppStore(state => state.authentication_state.auth_token);
  const current_user = useAppStore(state => state.authentication_state.current_user);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UpdateUserPreferenceInput) => {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/preferences`, preferences, {
        headers: {
          Authorization: `Bearer ${auth_token}`
        }
      });
      return response.data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Failed to update preferences:', error.response?.data?.message || error.message);
    }
  });

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleFinish = () => {
    if (!current_user?.id) return; // Prevent action if user is not authenticated

    updatePreferencesMutation.mutate({
      user_id: current_user.id,
      theme,
      default_view: defaultView,
    });
  };

  return (
    <>
      <div className="h-screen flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md p-8 space-y-6">
          <h2 className="text-center text-2xl font-bold">{slides[currentSlide].title}</h2>
          <p className="text-center">{slides[currentSlide].content}</p>

          {currentSlide === slides.length - 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="creative">Creative</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 mt-4">Default View</label>
              <select value={defaultView} onChange={(e) => setDefaultView(e.target.value)} className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md">
                <option value="list">List</option>
                <option value="board">Board</option>
              </select>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={handleSkip} className="text-blue-600 hover:text-blue-500">
              Skip
            </button>

            {currentSlide < slides.length - 1 ? (
              <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Next
              </button>
            ) : (
              <button onClick={handleFinish} className="bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-500" disabled={updatePreferencesMutation.isLoading}>
                {updatePreferencesMutation.isLoading ? 'Saving...' : 'Finish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Onboarding;