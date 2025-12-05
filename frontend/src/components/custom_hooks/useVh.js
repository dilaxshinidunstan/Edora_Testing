// src/hooks/useVh.js
import { useEffect } from 'react';

const useVh = () => {
  useEffect(() => {
    const updateVH = () => {
      // Update the CSS variable with the current viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Lock the body from scrolling
    document.body.style.overflow = 'hidden';

    updateVH(); // Set the initial value of --vh
    window.addEventListener('resize', updateVH); // Update on resize

    // Clean up the event listener on component unmount
    return () => {
      document.body.style.overflow = '';  
      window.removeEventListener('resize', updateVH);
    };
  }, []);
};

export default useVh;
