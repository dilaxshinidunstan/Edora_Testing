import React from 'react'

const Suggestions = ({ items, onItemClick, className = '' }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className={`mt-4 flex justify-center ${className}`}>
            <div className='flex flex-wrap gap-2 max-w-lg justify-center'>
                {items.map((item, index) => (
                    <button 
                        key={index} 
                        onClick={onItemClick}
                        className='
                            px-4 py-2
                            bg-gradient-to-r from-strong_cyan to-primary
                            text-white
                            rounded-full
                            text-sm
                            font-medium
                            shadow-md
                            hover:shadow-lg
                            transition-all
                            duration-200
                            hover:scale-[1.04]
                            active:scale-95
                            flex
                            items-center
                            gap-2
                        '
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Suggestions