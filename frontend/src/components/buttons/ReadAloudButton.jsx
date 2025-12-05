import React, { useState, useEffect } from 'react'
import { HiMiniSpeakerWave } from "react-icons/hi2";

const ReadAloudButton = ({ text: inputText, label }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voice, setVoice] = useState(null);

    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Female'));
        if (femaleVoice) {
            setVoice(femaleVoice);
        }
    };

    useEffect(() => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const textToSpeech = (textToSpeak) => {
        if (!textToSpeak) {
            console.error("No text provided for speech synthesis.");
            return;
        }

        // Remove emojis from the text
        const filteredText = textToSpeak
            .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
            .replace(/<[^>]*>/g, ''); // Remove HTML tags

        // Utility function to split text into chunks based on sentences
        const splitTextIntoChunks = (text, maxLength) => {
            // Split the text into sentences using regex
            const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || []; // Match sentences
            const chunks = [];
            let currentChunk = '';

            sentences.forEach(sentence => {
                // Check if adding the next sentence would exceed the maxLength
                if ((currentChunk + sentence).length <= maxLength) {
                    currentChunk += sentence; // Add sentence to current chunk
                } else {
                    // If the current chunk is not empty, push it to chunks
                    if (currentChunk) {
                        chunks.push(currentChunk);
                    }
                    currentChunk = sentence; // Start a new chunk with the current sentence
                }
            });

            // Push the last chunk if it exists
            if (currentChunk) {
                chunks.push(currentChunk);
            }

            return chunks;
        };

        // Example usage
        const maxLength = 30; // Maximum length for each chunk
        const chunks = splitTextIntoChunks(filteredText, maxLength);
        console.log(chunks);

        if ('speechSynthesis' in window) {
            let currentChunk = 0;

            const speakNextChunk = () => {
                if (currentChunk < chunks.length) {
                    const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
                    utterance.lang = 'en-US'; // Set language (adjust as needed)
                    utterance.rate = 1; // Adjust speaking rate (0.1 to 10, default is 1)
                    utterance.pitch = 1; // Adjust pitch (0 to 2, default is 1)
                    utterance.volume = 1; // Adjust volume (0 to 1, default is 1)

                    if (voice) {
                        utterance.voice = voice; // Set the selected female voice
                    }

                    utterance.onend = () => {
                        currentChunk++;
                        speakNextChunk(); // Speak the next chunk
                    };

                    window.speechSynthesis.speak(utterance);
                    setIsSpeaking(true);
                } else {
                    setIsSpeaking(false); // Reset speaking state when done
                }
            };

            speakNextChunk(); // Start speaking the first chunk
        } else {
            console.error("Text-to-Speech is not supported in this browser.");
        }
    };

    const handleReadAloud = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel(); // Stop speaking
            setIsSpeaking(false);
        } else {
            textToSpeech(inputText); // Start speaking
        }
    };

    return (
        <div className='relative group'>
            <button 
                onClick={handleReadAloud} 
                className={`flex items-center p-2 transition-transform duration-300 ease-in-out ${isSpeaking ? 'scale-125 text-dary_gray' : 'scale-100 text-primary'}`}
            >
                <HiMiniSpeakerWave size={20} />
            </button>
            <span className="absolute top-full mt-2 w-max bg-gray-800 text-secondary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                {label}
            </span>
        </div>
      )
}

export default ReadAloudButton