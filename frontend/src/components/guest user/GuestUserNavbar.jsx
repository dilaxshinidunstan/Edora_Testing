import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import EdoraWordLogo from '../../assets/images/logo/edora_word_logo_white.png';

const GuestUserNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed w-full z-10 bg-[#04aaa2] px-8 py-4 flex justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center">
        <div className="flex items-center justify-center">
          <img 
            className="h-5 w-auto hover:scale-110 transition-transform duration-300" 
            src={EdoraWordLogo} 
            alt="edora" 
          />
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center justify-center flex-1 gap-5">
        <a href="/home" className="text-white font-medium hover:text-gray-200 transition-colors">Home</a>
        <a href="/about" className="text-white font-medium hover:text-gray-200 transition-colors">About</a>
        <a href="/blog" className="text-white font-medium hover:text-gray-200 transition-colors">Blog</a>
        <a href="/festival/start" className="text-white font-medium hover:text-gray-200 transition-colors" aria-label="guest">Festival</a>
      </div>

      {/* Actions */}
      <div className="flex items-center">
        <a 
          href="/signup" 
          className="bg-white text-[#107067] px-3 py-1 rounded text-sm font-semibold border border-white 
                     hover:bg-transparent hover:text-white transition-colors"
        >
          Signup
        </a>
        <button 
          className="sm:hidden ml-4 text-white hover:text-gray-200 transition-colors"
          onClick={toggleMobileMenu}
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-[300px] bg-[#04aaa2] transform transition-transform duration-300 ease-in-out
                      ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
          <button 
            className="float-right text-white hover:text-gray-200 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaTimes size={20} />
          </button>
          <div className="clear-both flex flex-col gap-4 mt-8">
            <a 
              href="/home" 
              className="text-white font-medium hover:text-gray-200 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="/about" 
              className="text-white font-medium hover:text-gray-200 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="/blog" 
              className="text-white font-medium hover:text-gray-200 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </a>
            <a 
              href="/festival/start" 
              className="text-white font-medium hover:text-gray-200 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Festival
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GuestUserNavbar;