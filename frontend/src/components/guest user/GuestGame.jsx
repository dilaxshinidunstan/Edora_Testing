import React from 'react'
import FxHangman from '../hangman/FxHangman'

const GuestGame = () => {
  return (
    <div>
        <FxHangman isGuest={true} />
    </div>
  )
}

export default GuestGame