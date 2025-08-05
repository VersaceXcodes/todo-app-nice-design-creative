import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_Footer: React.FC = () => {
  const appVersion = "1.0.0"; // Example app version; could be handled via Zustand if specified in the global state.

  return (
    <>
      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="space-x-4">
            <Link to="/terms" className="text-sm text-gray-300 hover:text-white transition duration-150 ease-in-out" aria-label="Terms of Service">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-white transition duration-150 ease-in-out" aria-label="Privacy Policy">
              Privacy Policy
            </Link>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition duration-150 ease-in-out" aria-label="Facebook">
              Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition duration-150 ease-in-out" aria-label="Twitter">
              Twitter
            </a>
          </div>
          <div className="text-sm">
            <span>App Version: {appVersion}</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;