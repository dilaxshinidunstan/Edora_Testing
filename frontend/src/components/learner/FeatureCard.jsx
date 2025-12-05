import React from 'react'
import Card from './Card'
import { MdOutlineChatBubbleOutline, MdOutlineQuiz } from "react-icons/md";
import { IoGameControllerOutline } from "react-icons/io5";
import { GrResources } from "react-icons/gr";
import { FaUserAstronaut } from "react-icons/fa";
import Heading from './Heading';

const FeatureCard = () => {
    const features = [
        {key: "generalEnglish", icon: <MdOutlineChatBubbleOutline size={20} />, href: '/generalchat', heading: "Chat & Learn", subHeading: "Master English with Your AI Buddy", description: "Boost your English fluency effortlessly by chatting with an AI partner. Whether it’s grammar tips or conversational practice, this bot has you covered for daily improvement."},
        {key: "idol", icon: <FaUserAstronaut size={20} />, href: '/legend', heading: "Idol Talks", subHeading: "Convo with History’s Greatest Minds", description: "Step into a virtual world where you can chat with iconic figures from the past. Learn from their lives, wisdom, and experiences in an interactive way!"},
        {key: "quiz", icon: <MdOutlineQuiz size={20} />, href: '/quiz/start', heading: "Quiz", subHeading: "AI Quizzes to Level Up Your Knowledge", description: "Put your skills to the test with AI-generated quizzes tailored to your learning needs. Challenge yourself and track your progress as you conquer new topics!"},
        {key: "pastpaper", icon: <GrResources size={20} />, href: '/pastpapercard', heading: "Exam Ace", subHeading: "Ace Your Exams with Real Past Papers", description: "Sharpen your exam skills by solving past paper questions. Get real-time feedback and explanations to reinforce your knowledge and tackle your exams with confidence."},
        {key: "games", icon: <IoGameControllerOutline size={20} />, href: '/game/card', heading: "Games", subHeading: "Master English with Fun Games", description: "Improve your English skills by playing interactive games. From vocabulary challenges to grammar puzzles, enhance your language proficiency while having fun!"},
    ]
  return (
    <div>
        <div className='flex flex-col lg:mt-20 mt-4 mb-2 p-4 lg:flex-row lg:justify-between justify-center items-center lg:max-w-5xl mx-auto'>
            <Heading id="ai-tutoring-tools" heading="AI Tutoring Tools" />          
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 '>
                {
                    features.map((feature, index) => (
                        <div key={index}>
                            <Card icon={feature.icon} heading={feature.heading} subHeading={feature.subHeading} description={feature.description} href={feature.href} />
                        </div>
                    ))
                }
            </div>
        </div>
    </div>
  )
}

export default FeatureCard