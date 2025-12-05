import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupPrompt from './SignupPrompt';
import { FaLock } from 'react-icons/fa';

const pastPaperYears = [2023, 2022, 2021, 2020, 2019, 2018];

const GuestUserPastpaperCard = () => {
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (year) => {
    if (year === 2023) {
      const test = 1;
      navigate(`/guest/pastpaper/${year}/${test}`);
    } else {
      setShowSignupPrompt(true);
    }
  };

  return (
    <div className='relative'>
      <div className='flex p-4 h-screen max-w-5xl sm:mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4 sm:mt-16 mt-24 overflow-auto'>
          {pastPaperYears.map(year => (
            <div
              key={year}
              className={`relative bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer 
                         transition-shadow duration-300 group ${year !== 2023 ? 'opacity-80' : ''}`}
              onClick={() => handleCardClick(year)}
            >
              <div className='absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 
                            group-hover:opacity-50 transition-opacity duration-300 rounded-lg'>
              </div>
              
              {/* Lock Icon for Non-2023 Papers */}
              {year !== 2023 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-30 rounded-lg">
                  <FaLock size={24} className="text-white" />
                </div>
              )}

              <img
                src={`/pastpapers/thumbnails/${year}.jpg`}
                alt={`Past paper ${year}`}
                className='w-full h-36 object-cover rounded-t-lg'
              />
              <div className='p-2'>
                <h2 className='text-md text-gray-800 relative group-hover:text-white transition-colors duration-300'>
                  G.C.E O/L English Language Past Paper <span className='text-xl font-semibold'>{year}</span>
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signup Prompt Modal */}
      <SignupPrompt show={showSignupPrompt} onClose={() => setShowSignupPrompt(false)} />
    </div>
  );
};

export default GuestUserPastpaperCard;