import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { UserPreference } from '@schema';

const fetchPreferences = async (user_id: string, auth_token: string): Promise<UserPreference> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/preferences`, {
    headers: { Authorization: `Bearer ${auth_token}` },
    params: { user_id }
  });
  return data;
};

const updatePreferences = async (preferences: UserPreference, auth_token: string): Promise<UserPreference> => {
  const { data } = await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/preferences`, preferences, {
    headers: { Authorization: `Bearer ${auth_token}` }
  });
  return data;
};

const UV_Settings: React.FC = () => {
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);

  const { data: fetchedPreferences, isLoading: isFetching, isError: fetchError } = useQuery(
    ['preferences', currentUser?.id],
    () => fetchPreferences(currentUser?.id || '', authToken || ''),
    {
      enabled: !!currentUser?.id && !!authToken,
      onSuccess: data => setPreferences(data),
    }
  );

  const mutation = useMutation((newPreferences: UserPreference) => updatePreferences(newPreferences, authToken || ''));

  const handleSave = () => {
    if (preferences) {
      mutation.mutate(preferences);
    }
  };

  if (isFetching) {
    return <div className="text-center">Loading...</div>;
  }

  if (fetchError || mutation.isError) {
    return <div className="text-center text-red-500">Error fetching or updating preferences.</div>;
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">User Settings</h2>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Theme</label>
          <select
            value={preferences?.theme || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev!, theme: e.target.value }))}
            className="block w-full mt-1 rounded-md"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Default View</label>
          <select
            value={preferences?.default_view || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev!, default_view: e.target.value }))}
            className="block w-full mt-1 rounded-md"
          >
            <option value="list">List</option>
            <option value="board">Board</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={preferences?.email_notifications || false}
              onChange={(e) => setPreferences(prev => ({ ...prev!, email_notifications: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Email Notifications</span>
          </label>
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={preferences?.in_app_notifications || false}
              onChange={(e) => setPreferences(prev => ({ ...prev!, in_app_notifications: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">In-App Notifications</span>
          </label>
        </div>
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={mutation.isLoading || !preferences}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          {mutation.isSuccess && 
            <div className="mt-2 text-green-500">Preferences updated successfully!</div>
          }
        </div>
      </div>
    </>
  );
};

export default UV_Settings;