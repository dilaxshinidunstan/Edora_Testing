import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const TestNavbar = ({ selectedTest }) => {
    const tests = Array.from({ length: 16 }, (_, i) => `${i + 1}`)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { year } = useParams()
    const navigate = useNavigate()

    const handleClick = (test) => {
        navigate(`/pastpaper/${year}/${test}`); 
    }

    return (
        <div className="flex justify-center w-full">
            <ul className="flex">
                <li className='relative'>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                        className="flex items-center justify-between py-2 px-3 font-medium bg-white text-primary border border-primary rounded-full"
                    >
                        Tests 
                        <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                        </svg>
                    </button>
                    <div className={`absolute z-10 top-full mt-2 grid w-auto min-w-[200px] grid-cols-4 gap-2 text-sm bg-white border border-primary rounded-xl shadow-md ${isDropdownOpen ? 'block' : 'hidden'}`}>
                        <div className="p-4 text-primary pb-4 col-span-4">
                            <ul className="grid grid-cols-4 gap-2">
                                {tests.map((test, index) => (
                                    <li 
                                        key={index} 
                                        className={`cursor-pointer p-2 rounded-full text-center ${
                                            selectedTest === index + 1 ? 'bg-primary text-white' : 'bg-white'
                                        } hover:bg-secondary hover:text-primary`} 
                                        onClick={() => handleClick(test)}
                                    >
                                        {test}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default TestNavbar