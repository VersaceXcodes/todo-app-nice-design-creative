import React from 'react';
import { Link } from 'react-router-dom';

const UV_Welcome: React.FC = () => (
  <>
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8 bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Creative ToDo App!</h1>
        <p className="mt-4 text-lg text-gray-600">
          Manage your tasks creatively and efficiently. Join now to start organizing your
          tasks like never before.
        </p>
        <div className="space-y-4">
          <Link to="/auth" className="block w-full py-2 px-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            Sign Up / Log In
          </Link>
        </div>
        <div className="mt-6">
          <Link to="/onboarding" className="text-sm text-gray-500 hover:text-gray-900">
            Learn more about our features &rarr;
          </Link>
        </div>
      </div>
    </div>
  </>
);

export default UV_Welcome;