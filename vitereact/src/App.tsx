import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

import GV_TopNav from '@/components/views/GV_TopNav.tsx';
import GV_Footer from '@/components/views/GV_Footer.tsx';
import GV_SideMenu from '@/components/views/GV_SideMenu.tsx';
import UV_Welcome from '@/components/views/UV_Welcome.tsx';
import UV_Onboarding from '@/components/views/UV_Onboarding.tsx';
import UV_Auth from '@/components/views/UV_Auth.tsx';
import UV_Dashboard from '@/components/views/UV_Dashboard.tsx';
import UV_TaskDetail from '@/components/views/UV_TaskDetail.tsx';
import UV_Categories from '@/components/views/UV_Categories.tsx';
import UV_Notifications from '@/components/views/UV_Notifications.tsx';
import UV_Settings from '@/components/views/UV_Settings.tsx';
import UV_CompletedTasks from '@/components/views/UV_CompletedTasks.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const initializeAuth = useAppStore(state => state.initialize_auth);
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <GV_TopNav />
        <div className="App min-h-screen flex flex-col">
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<UV_Welcome />} />
              <Route path="/auth" element={<UV_Auth />} />
              <Route path="/onboarding" element={<UV_Onboarding />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <GV_SideMenu />
                  <UV_Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/task/:task_id" element={
                <ProtectedRoute>
                  <GV_SideMenu />
                  <UV_TaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <GV_SideMenu />
                  <UV_Categories />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <UV_Notifications />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <UV_Settings />
                </ProtectedRoute>
              } />
              <Route path="/completed" element={
                <ProtectedRoute>
                  <UV_CompletedTasks />
                </ProtectedRoute>
              } />

              {/* Catch all - redirect based on auth status */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <GV_Footer />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;