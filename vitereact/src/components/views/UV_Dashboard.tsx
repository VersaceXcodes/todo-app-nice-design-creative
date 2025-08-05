import React, { useEffect } from 'react';
import { useAppStore } from '@/store/main';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from "react-router-dom";

// Define based on your actual API response
interface Task {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  due_date?: string;
  priority: string;
  category_id?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

const fetchTasks = async (userId: string, authToken: string): Promise<Task[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks`, {
    params: { user_id: userId },
    headers: { Authorization: `Bearer ${authToken}` }
  });
  return data;
};

const Dashboard: React.FC = () => {
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const { data: tasks, isLoading, error } = useQuery<Task[], Error>(
    ['tasks', currentUser?.id],
    () => fetchTasks(currentUser?.id || '', authToken || ''),
    { enabled: !!currentUser?.id }
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation (can be replaced with company's navbar component) */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Task Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/settings" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Settings
                </Link>
                <Link to="/completed" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Completed Tasks
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center">{error.message}</div>
            ) : (
              <div>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tasks?.map(task => (
                    <li key={task.id} className="bg-white shadow rounded-lg p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{task.name}</h3>
                        <p className="text-sm text-gray-500">{task.description}</p>
                      </div>
                      <div className="mt-3">
                        <Link to={`/task/${task.id}`} className="text-blue-500 hover:text-blue-700 text-sm">View Details</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;