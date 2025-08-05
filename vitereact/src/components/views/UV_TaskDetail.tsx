import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Task } from '@schema';

// Define interfaces
interface UpdateTaskPayload {
  name: string;
  description?: string;
  due_date?: string;
  priority: string;
  category_id?: string | null;
  is_completed: boolean;
}

const UV_TaskDetail: React.FC = () => {
  const { task_id } = useParams<{ task_id: string }>();
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const queryClient = useQueryClient();

  const [task, setTask] = useState<Task | null>(null);
  
  // Fetch task detail
  const { isLoading, error } = useQuery<Task, Error>(
    ['task', task_id],
    async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks/${task_id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return data;
    },
    {
      enabled: !!task_id,
      onSuccess: setTask,
    }
  );

  // Update task detail
  const mutation = useMutation<void, Error, UpdateTaskPayload>(
    async (updatedTask) => {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks/${task_id}`, updatedTask, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', task_id]);
        console.log('Task updated successfully');
      },
      onError: (err) => {
        console.error('Error updating task:', err.message);
      },
    }
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!task) return;

    const updatePayload: UpdateTaskPayload = {
      name: task?.name,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
      category_id: task.category_id || null,
      is_completed: task.is_completed,
    };

    mutation.mutate(updatePayload);
  };

  if (isLoading) {
    return <div>Loading task...</div>;
  }

  if (error) {
    return <div>Error loading task: {error.message}</div>;
  }

  return (
    <>
      <div className="task-detail bg-gray-200 min-h-screen p-6">
        <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Task Details</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="task-name" className="block text-lg font-medium text-gray-700">
                Task Name
              </label>
              <input
                id="task-name"
                type="text"
                value={task?.name || ''}
                onChange={(e) => setTask({ ...task, name: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="task-desc" className="block text-lg font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="task-desc"
                rows={4}
                value={task?.description || ''}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="task-due-date" className="block text-lg font-medium text-gray-700">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={task?.due_date || ''}
                onChange={(e) => setTask({ ...task, due_date: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-lg font-medium text-gray-700">
                Priority
              </label>
              <select
                id="task-priority"
                value={task?.priority || 'low'}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="task-completed"
                type="checkbox"
                checked={task?.is_completed || false}
                onChange={(e) => setTask({ ...task, is_completed: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="task-completed" className="ml-2 block text-lg font-medium text-gray-700">
                Task Completed
              </label>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                Back to Dashboard
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_TaskDetail;