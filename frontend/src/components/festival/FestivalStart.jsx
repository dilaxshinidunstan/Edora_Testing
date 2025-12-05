import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EdoraWordLogo from '../../assets/images/logo/edora_word_logo_white.png';

const FestivalStart = () => {
  const [nickname, setNickname] = useState('');
  const [showGames, setShowGames] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Auto-show games when nickname is entered
  useEffect(() => {
    if (nickname.trim().length > 0) {
      const timer = setTimeout(() => {
        setShowGames(true);
      }, 500); // Small delay for smooth transition
      return () => clearTimeout(timer);
    } else {
      setShowGames(false);
    }
  }, [nickname]);

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsTyping(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && nickname.trim()) {
      setShowGames(true);
    }
  };

  const handlePlayGame = async (gameType) => {
    const routes = {
      WordBuzz: '/guest/game',
      QuickQuiz: '/guest/quiz/intro',
    };
    const gameMap = {
      WordBuzz: 'wordbuzz',
      QuickQuiz: 'quiz',
    };

    try {
      await axios.post(`${apiBaseUrl}/festival/entry/`, {
        nickname: nickname.trim(),
        game: gameMap[gameType],
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      // Non-blocking: continue navigation even if tracking fails
      console.error('Failed to store festival entry', e);
    }

    const target = routes[gameType];
    if (target) {
      navigate(target);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-orange-400 relative overflow-hidden flex items-center justify-center p-5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent animate-pulse"></div>
      
      <div className="backdrop-blur-md p-10 max-w-4xl w-full text-center relative z-10">
        {/* Logo Section */}
        <div className="mb-8">
          <img 
            src={EdoraWordLogo} 
            alt="Edora" 
            className="h-16 w-auto mx-auto mb-4 animate-bounce" 
          />
        </div>

        {/* Festival Greeting */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
            Welcome to Edora Games!
          </h1>
          <p className="text-lg text-white leading-relaxed">
            Enter your nickname and choose a game. Play for 2 minutes and test your English skills!
          </p>
        </div>

        {/* Nickname Input */}
        <div className="mb-10">
          <label htmlFor="nickname" className="block text-xl font-semibold text-gray-800 mb-4">
            Enter Your Nickname
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            onKeyPress={handleKeyPress}
            onBlur={() => setIsTyping(false)}
            onFocus={() => setIsTyping(true)}
            placeholder="Type your nickname here..."
            className={`w-full max-w-xs px-5 py-4 border-3 rounded-full text-lg text-center transition-all duration-300 bg-white mx-auto ${
              isTyping 
                ? 'border-green-500 shadow-lg shadow-green-500/20' 
                : 'border-gray-200 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20'
            } focus:outline-none focus:scale-105`}
            autoFocus
          />
          {nickname.trim() && (
            <div className="mt-4 animate-fade-in">
              <span className="text-white px-5 py-2 rounded-full font-semibold inline-block">
                Hello, {nickname}! 🎊
              </span>
            </div>
          )}
        </div>

        {/* Game Options - Auto-appear after nickname */}
        <div className={`mb-10 transition-all duration-600 ease-out ${
          showGames 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            Let's play! Pick one below
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            {/* WordBuzz Game */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-3 border-green-500">
              <div className="text-5xl mb-4 animate-bounce">🎮</div>
              <h4 className="text-2xl font-bold text-gray-800 mb-3">WordBuzz</h4>
              <p className="text-gray-600 leading-relaxed mb-5">
                WordBuzz (Guess the word)
              </p>
              <button 
                className="w-full py-3 px-5 bg-primary text-white font-semibold rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => handlePlayGame('WordBuzz')}
              >
                Play Now
              </button>
            </div>

            {/* Quick Quiz Game */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-3 border-orange-500">
              <div className="text-5xl mb-4 animate-bounce">📝</div>
              <h4 className="text-2xl font-bold text-gray-800 mb-3">Quick Quiz</h4>
              <p className="text-gray-600 leading-relaxed mb-5">
                Quick Quiz (5 fun English questions)
              </p>
              <button 
                className="w-full py-3 px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => handlePlayGame('QuickQuiz')}
              >
                Play Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalStart;