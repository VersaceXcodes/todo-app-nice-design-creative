import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Task } from '@schema';

const fetchCompletedTasks = async (userId: string, authToken: string): Promise<Task[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks`, {
    headers: { Authorization: `Bearer ${authToken}` },
    params: { user_id: userId, is_completed: true }
  });

  return data;
};

const UV_CompletedTasks: React.FC = () => {
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const { data: completedTasks, isLoading, isError, error } = useQuery<Task[], Error>(
    ['completedTasks', currentUser?.id],
    () => fetchCompletedTasks(currentUser!.id, authToken!),
    { enabled: !!currentUser && !!authToken }
  );

  useEffect(() => {
    if (!currentUser || !authToken) {
      // Handle condition if authentication details are missing
    }
  }, [currentUser, authToken]);

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Completed Tasks Archive</h1>
          {isLoading && <div className="text-center">Loading tasks...</div>}
          {isError && <div className="text-center text-red-500">Error loading tasks: {error?.message}</div>}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul>
              {completedTasks?.map(task => (
                <li key={task.task_id} className="px-4 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">{task.name}</h2>
                  <p className="text-sm text-gray-500">{task.description || 'No description'}</p>
                  <div className="flex justify-end space-x-3 mt-2">
                    {/* Restore Task Button */}
                    <button
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none" 
                      aria-label={`Restore task ${task.name}`}
                    >
                      Restore
                    </button>
                    {/* Delete Task Button */}
                    <button
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                      aria-label={`Delete task ${task.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {completedTasks && completedTasks.length === 0 && (
              <div className="text-center text-gray-700 py-6">No completed tasks found</div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default UV_CompletedTasks;