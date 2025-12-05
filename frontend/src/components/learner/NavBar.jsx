import { Disclosure, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import BotLogo from '../../assets/images/bot.png'
import { usePremium } from '../contexts/PremiumContext';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../AuthContext';
import React, { useState, useEffect } from 'react';
import GetUnlimitedPlanButton from '../buttons/GetUnlimitedPlanButton';
import useFetchPremiumStatus from '../custom_hooks/useFetchPremiumStatus';
import EdoraWordLogo from '../../assets/images/logo/edora_word_logo_white.png'

// const navigation = [
//   { name: 'AI Tutoring Tools', href: '/learner/tools', current: false },
//   { name: 'Subjects', href: '/learner/subjects', current: false },
// ]

// function classNames(...classes) {
//   return classes.filter(Boolean).join(' ')
// }

const NavBar = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [initials, setInitials] = useState(username.substring(0, 2).toUpperCase())

  const { isPremium } = usePremium()
  const [loading, setLoading] = useState(true)

  useFetchPremiumStatus(setLoading)

  useEffect(() => {
    setInitials(username.substring(0, 2).toUpperCase());

  }, [username]);

  const { logout } = useAuth();

  const handleLogoClick = (e) => {
    e.preventDefault()
    navigate('/learner/home')
  }

  const handleLogout = (e) => {
    e.preventDefault();
    try {
      logout();
      navigate('/signin');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-md">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    alt="Your Company"
                    src={EdoraWordLogo}
                    className="h-5 w-auto cursor-pointer"
                    onClick={handleLogoClick}
                  />
                </div>
              </div>

              <div className="flex items-center">
                
                    <div className="hidden sm:block">
                      <GetUnlimitedPlanButton />
                    </div>

                  
                
                <Menu as="div" className="relative ml-3">
                  <div className='flex'>
                    <MenuButton className="relative flex p-2 w-10 h-10 items-center justify-center rounded-full bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      {initials}
                    </MenuButton>
                  </div>
                  <MenuItems
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="sm:hidden">
                      <MenuItem>
                        {isPremium ? (
                          <span className="block px-4 py-2 text-sm text-dark_gray">
                            Premium Learner
                          </span>
                        ) : (
                          <a href="/subscribe" className="block px-4 py-2 text-sm text-dark_gray hover:bg-gray-100">
                            Get Unlimited Plan
                          </a>
                        )}
                      </MenuItem>
                    </div>
                    <MenuItem>
                      <p onClick={handleLogout} className="block px-4 py-2 text-sm text-dark_gray hover:bg-gray-100">
                        Sign out
                      </p>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  )
}

export default React.memo(NavBar)
