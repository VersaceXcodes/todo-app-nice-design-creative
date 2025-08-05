import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { TaskReminder } from '@schema';

// Fetch notifications function
const fetchNotifications = async (userId: string, authToken: string): Promise<TaskReminder[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/task_reminders`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    params: {
      task_id: userId,
    },
  });
  // Map data to required schema
  return data.map((reminder: any) => ({
    reminder_id: reminder.reminder_id,
    task_id: reminder.task_id,
    reminder_time: reminder.reminder_time,
  }));
};

const UV_Notifications: React.FC = () => {
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TaskReminder[]>({
    queryKey: ['notifications', currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !authToken) {
        throw new Error('User not authenticated');
      }
      return fetchNotifications(currentUser.id, authToken);
    },
    enabled: !!currentUser && !!authToken,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
        <h1 className="text-2xl font-semibold text-gray-800">Notifications Center</h1>
        {isLoading ? (
          <div className="mt-4 text-blue-500">Loading notifications...</div>
        ) : isError && error instanceof Error ? (
          <div className="mt-4 text-red-500" role="alert" aria-live="assertive">{`Error: ${error.message}`}</div>
        ) : (
          <ul className="mt-4 w-full max-w-lg">
            {notifications && notifications.length > 0 ? (
              notifications.map(notification => (
                <li key={notification.reminder_id} className="border-b border-gray-300 py-2">
                  <div className="text-gray-800">
                    Task ID: {notification.task_id}
                  </div>
                  <div className="text-gray-600">
                    Reminder Time: {new Date(notification.reminder_time).toLocaleString()}
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center text-gray-600 mt-2">No notifications available</div>
            )}
          </ul>
        )}

        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => refetch()}
          disabled={isLoading || !notifications}
        >
          Refresh Notifications
        </button>
      </div>
    </>
  );
};

export default UV_Notifications;