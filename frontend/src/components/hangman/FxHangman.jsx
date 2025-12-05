import { useEffect, useState } from 'react'; 
import Heading2 from '../Heading2';
import ConfimationModal from '../ConfimationModal';
import { useNavigate } from 'react-router-dom';

import Level1 from '../../assets/images/games/balloon/level1.gif';
import Level2 from '../../assets/images/games/balloon/level2.gif';
import Level3 from '../../assets/images/games/balloon/level3.gif';
import Level4 from '../../assets/images/games/balloon/level4.gif';
import Level5 from '../../assets/images/games/balloon/level5.gif';
import Lose1 from '../../assets/images/games/balloon/lose1.gif';
import Lose2 from '../../assets/images/games/balloon/lose2.gif';
import Lose3 from '../../assets/images/games/balloon/lose3.gif';
import Lose4 from '../../assets/images/games/balloon/lose4.gif';
import Lose5 from '../../assets/images/games/balloon/lose5.gif';

import { randomWord } from "./Words";

const FxHangman = ({ maxWrong = 5, levelImages = [Level1, Level2, Level3, Level4, Level5], loseImages = [Lose1, Lose2, Lose3, Lose4, Lose5], isGuest = false }) => {
    const [nWrong, setNWrong] = useState(0);
    const [guessed, setGuessed] = useState(new Set());
    const [group, setGroup] = useState('colors');
    const [answer, setAnswer] = useState(randomWord());
    const [showLoseGif, setShowLoseGif] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showGif, setShowGif] = useState(true);

    const navigate = useNavigate();

    const reset = () => { 
        setNWrong(0);
        setGuessed(new Set());
        setAnswer(randomWord());
        setGroup('colors');
        setShowGif(true);
        setShowLoseGif(false);
    };

    const guessedWord = () => {
        return answer.split("").map(ltr => (guessed.has(ltr) ? ltr : "_"));
    };

    const handleGuess = (e) => {
        let ltr = e.target.value;
        const updatedSet = new Set([...guessed, ltr]);
        setGuessed(updatedSet);
        setNWrong(nWrong + (answer.includes(ltr) ? 0 : 1));

        if (!answer.includes(ltr)) {
            setShowLoseGif(true);
            setTimeout(() => {
                if (nWrong + 1 >= maxWrong) {
                    setShowGif(false);
                    setShowConfirmationModal(true);
                } else {
                    setShowLoseGif(false);
                }
            }, 2700);
        }
    };

    const handleRestart = () => {
        setShowConfirmationModal(false);
        reset();
    };

    const handleQuit = () => {
        setShowConfirmationModal(false);
        if (isGuest) {
            navigate('/festival/start');
        } else {
            navigate('/game/card');
        }
    };

    const generateButtons = () => {
        return "abcdefghijklmnopqrstuvwxyz".split("").map(ltr => (
            <button
                key={ltr}
                value={ltr}
                onClick={handleGuess}
                disabled={guessed.has(ltr)}
                className="bg-primary text-white rounded-sm sm:w-10 sm:h-10 w-8 h-8 text-sm hover:bg-gray-600 disabled:bg-gray-200 disabled:text-gray-600 shadow-md transition-all">
                {ltr}
                <br/>
            </button>
        ));
    };

    const handleChange = (e) => { 
        const { value } = e.target;
        setGroup(value);
        setAnswer(randomWord(value));
        setNWrong(0);
        setGuessed(new Set());
    };

    let alt = `${nWrong}/${maxWrong} guesses`;
    let isWinner = guessedWord().join("") === answer;
    let gameOver = nWrong >= maxWrong;
    let gameState = generateButtons();
    if (isWinner) gameState = "You Won!";
    if (gameOver) gameState = "You Lost!";

    useEffect(() => {
        if (isWinner) {
            setShowConfirmationModal(true);
        }
    }, [isWinner]);

    const remainingChances = maxWrong - nWrong;
    const warningMessage = remainingChances <= 1 
        ? `Only one chance left!`
        : `${remainingChances} chances left`;

    return (
        <div className="Hangman container mx-auto px-4 md:mt-16 mt-20">
            <Heading2 text="Word Buzz" />
            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                {showGif && (
                    <div className="flex flex-col items-center w-full lg:w-1/2">
                        <div className="flex justify-center w-full max-w-[300px] sm:max-w-[400px] ">
                            <img 
                                src={gameOver ? loseImages[4] : showLoseGif ? loseImages[nWrong - 1] : levelImages[nWrong]}
                                alt={alt}
                                className="w-full h-auto object-contain"
                            />
                        </div>

                        <p className={`${remainingChances <= 1 ? "text-red-600" : "text-green-700"} mt-2 text-lg font-semibold`}>{gameOver ? "Game Over!" : warningMessage}</p>
                    </div>
                )}
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                    <div className="flex justify-center">
                        <select 
                                    name="group" 
                                    id="group" 
                            value={group} 
                            onChange={handleChange}
                            className="w-52 h-10 p-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500">
                            <option value="colors">Colors</option>
                            <option value="countries">Countries</option>
                            <option value="animals">Animals</option>
                        </select>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-2xl sm:text-4xl tracking-wide mb-4">{gameOver ? answer : guessedWord().join(" ")}</p>
                        <div className="grid grid-cols-8 gap-4 max-w-full p-4 bg-none rounded-lg shadow-md">
                            {typeof gameState === 'string' ? (
                                <p className="col-span-full justify-center text-center text-lg font-bold">{gameState}</p>
                            ) : (
                                gameState
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showConfirmationModal && (
                <ConfimationModal 
                    isOpen={showConfirmationModal}
                    onClose={handleQuit}
                    onConfirm={handleRestart}
                    message={`${isWinner ? "Congratulations! Restart or quit?" : "Game Over! Restart or quit?"}`}
                    confirmText="Restart"
                    cancelText="Quit"
                />
            )}
        </div>
    );
};

export default FxHangman;
