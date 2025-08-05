import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Category, createCategoryInputSchema } from '@schema';

const UV_Categories: React.FC = () => {
  // Accessing global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // Local state for new category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch categories with React Query
  const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError, refetch } = useQuery({
    queryKey: ['categories', currentUser?.id],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/categories`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { user_id: currentUser?.id },
      });
      return data;
    },
    enabled: !!currentUser?.id,
  });

  // Mutation for creating a category
  const { mutate: createCategory, isLoading: isCreating } = useMutation({
    mutationFn: async (newCategory: { user_id: string; name: string; color_code: string }) => {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/categories`, newCategory, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['categories']),
    onError: (error: any) => {
      console.error('Error creating category:', error.message);
    },
  });

  // Mutation for deleting a category
  const { mutate: deleteCategory, isLoading: isDeleting } = useMutation({
    mutationFn: async (categoryId: string) => {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['categories']),
    onError: (error: any) => {
      console.error('Error deleting category:', error.message);
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate and create category
    const newCategory = { user_id: currentUser?.id || '', name: newCategoryName, color_code: newCategoryColor };
    const parseResult = createCategoryInputSchema.safeParse(newCategory);
    if (parseResult.success) {
      createCategory(newCategory);
      setNewCategoryName('');
      setNewCategoryColor('');
    } else {
      console.error('Invalid category input:', parseResult.error);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(categoryId);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold mb-4">Category Management</h1>
        {/* New Category Form */}
        <form onSubmit={handleCreateCategory} className="mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="w-16"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
        {/* Error handling for categories */}
        {isCategoriesError && (
          <div className="text-red-500">An error occurred while fetching categories.</div>
        )}
        {/* Categories List */}
        <div className="space-y-2">
          {isCategoriesLoading ? (
            <div>Loading...</div>
          ) : (
            categories?.map((category: Category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-white rounded shadow">
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 rounded" style={{ backgroundColor: category.color_code }}></div>
                  <div className="font-medium">{category.name}</div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default UV_Categories;