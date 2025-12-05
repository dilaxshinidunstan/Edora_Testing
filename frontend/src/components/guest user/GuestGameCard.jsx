import React from 'react'
import PlayCard from '../play/PlayCard'

const GuestGameCard = () => {
  return (
    <div>
        <PlayCard isGuest={true} />
    </div>
  )
}

export default GuestGameCard