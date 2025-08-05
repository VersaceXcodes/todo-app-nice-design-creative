import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

const GV_TopNav: React.FC = () => {
  const theme = useAppStore(state => state.user_preferences.theme);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const currentUser = useAppStore(state => state.authentication_state.current_user);

  const switchThemeMutation = useMutation(async (newTheme: string) => {
    return await axios.put(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/preferences`,
      { user_id: currentUser?.id, theme: newTheme },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
  }, {
    onSuccess: (data) => {
      // Update the global theme in the store
      useAppStore.setState({ user_preferences: { ...useAppStore.getState().user_preferences, theme: data.data.theme } });
    },
    onError: (error) => {
      console.error('Error updating theme:', error);
    }
  });

  const handleThemeSwitch = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'creative' : 'light';
    switchThemeMutation.mutate(newTheme);
  };

  return (
    <>
      <nav className="bg-gray-800 fixed top-0 left-0 w-full flex items-center justify-between px-4 py-2 shadow-md">
        {/* Home button */}
        <Link to="/dashboard" className="text-white text-xl font-semibold">
          Home
        </Link>

        {/* Search bar (placeholder) */}
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-gray-700 text-white placeholder-gray-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Theme switcher */}
        <button
          onClick={handleThemeSwitch}
          disabled={switchThemeMutation.isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200 ease-in-out"
          aria-label="Switch Theme"
        >
          {switchThemeMutation.isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          ) : (
            <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
          )}
        </button>

        {/* Profile icon */}
        <Link to="/settings" className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Settings">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 00-3.25 19.48c.51.09.69-.22.69-.49v-1.56c-2.54.55-3.08-1.22-3.08-1.22-.46-1.11-1.12-1.41-1.12-1.41-.92-.64.07-.63.07-.63 1.02.08 1.56 1.05 1.56 1.05.91 1.56 2.39 1.11 2.98.85.09-.66.35-1.1.64-1.35-2.04-.23-4.18-1.02-4.18-4.56 0-1.01.35-1.84.94-2.49-.09-.23-.41-1.14.09-2.37 0 0 .77-.25 2.53.95A8.75 8.75 0 0112 6.8a8.76 8.76 0 012.31.31c1.76-1.2 2.53-.95 2.53-.95.5 1.23.19 2.14.1 2.37.59.65.93 1.48.93 2.49 0 3.55-2.14 4.32-4.19 4.55.36.31.69.93.69 1.88v2.78c0 .27.18.59.7.49A10.02 10.02 0 0012 2z" />
          </svg>
        </Link>
      </nav>
    </>
  );
};

export default GV_TopNav;