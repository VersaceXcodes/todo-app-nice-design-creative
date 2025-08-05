import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Category } from '@schema';

const fetchCategories = async (userId: string, authToken: string): Promise<Category[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
    params: { user_id: userId },
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return data.map((cat: any) => ({
    category_id: cat.category_id,
    name: cat.name,
    color_code: cat.color_code,
  }));
};

const GV_SideMenu: React.FC = () => {
  const userId = useAppStore(state => state.authentication_state.current_user?.id);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const setCategories = useAppStore(state => state.setCategories);
  
  const { data: categories, error, isLoading } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(userId ?? '', authToken ?? ''),
    onSuccess: (data) => setCategories(data),
  });

  return (
    <>
      <nav className="w-64 h-full shadow-md bg-white">
        <div className="flex flex-col">
          <Link to="/dashboard" className="py-2 px-4 hover:bg-gray-100 focus:bg-gray-200">
            Dashboard
          </Link>
          <Link to="/categories" className="py-2 px-4 hover:bg-gray-100 focus:bg-gray-200">
            Categories
          </Link>
          <Link to="/notifications" className="py-2 px-4 hover:bg-gray-100 focus:bg-gray-200">
            Notifications
          </Link>
          <Link to="/settings" className="py-2 px-4 hover:bg-gray-100 focus:bg-gray-200">
            Settings
          </Link>
          <div className="py-2 px-4 mt-4 text-lg font-semibold">Categories</div>
          {isLoading ? (
            <div className="py-2 px-4">Loading...</div>
          ) : error ? (
            <div className="py-2 px-4 bg-red-100 text-red-600" aria-live="polite">
              Error loading categories
            </div>
          ) : (
            categories?.map(category => (
              <div key={category.category_id} className="flex items-center py-2 px-4 hover:bg-gray-100">
                <span className="w-3 h-3 mr-2" style={{ backgroundColor: category.color_code }}></span>
                {category.name}
              </div>
            ))
          )}
        </div>
      </nav>
    </>
  );
};

export default GV_SideMenu;