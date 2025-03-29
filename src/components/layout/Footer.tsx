import React from 'react';
import { FaFacebook, FaInstagram, FaGoodreads } from 'react-icons/fa';

export default function Footer({ fixed = false }) {
  return (
    <footer className={`${fixed ? 'fixed bottom-0 left-0 w-full' : ''} bg-white border-t border-gray-200 py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="https://www.facebook.com/profile.php?id=61573006310701" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
            <FaFacebook size={24} />
          </a>
          <a href="https://www.instagram.com/ak_warnock" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500">
            <FaInstagram size={24} />
          </a>
          <a href="https://www.goodreads.com/author/show/54409774.A_K_Warnock" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-600">
            <FaGoodreads size={24} />
          </a>
        </div>
        <p className="text-gray-500">&copy; {new Date().getFullYear()} AK Warnock. All rights reserved.</p>
      </div>
    </footer>
  );
} 