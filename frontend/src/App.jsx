import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Historical from './components/historical/Historical';
import LandHome from './components/landing page/Home'
import Services from './components/landing page/Services';
import Downloads from './components/landing page/Downloads';
import About from './components/landing page/About';
import ELibrary from './components/landing page/ELibrary';
import Navbar from './components/landing page/Navbar';
import GeneralChat from './pages/GeneralChat';
import GeneralChatHistoryPage from './pages/GeneralChatHistoryPage';
import PastpaperCard from './pages/PastpaperCard';
import PastpaperContent from './pages/PastpaperContent';
import QuizStart from './pages/QuizStart';
import QuizContent from './pages/QuizContent';
import Legend from './pages/Legend';
import PastpaperChat from './pages/PastpaperChat';
import Blog from './components/landing page/Blog';
import QuizHistoryTablePage from './pages/QuizHistoryTablePage';
import QuizReviewPage from './pages/QuizReviewPage';
import QuizCardPage from './pages/QuizCardPage';
import LearnerHome from './pages/learner/Home';
import LearnerTools from './pages/learner/ToolsPage'
import SubjectsPage from './pages/learner/SubjectsPage';
import IdolCardPage from './pages/idol/IdolCardPage';
import IdolHistoryPage from './pages/idol/IdolHistoryPage';
import PlayCardPage from './pages/play/PlayCardPage';
import FxHangman from './components/hangman/FxHangman';
import WordbuzzPage from './pages/play/WordbuzzPage';
import SubsriptionPage from './pages/subscription/SubsriptionPage';
import AccountActivation from './pages/AccountActivation';
import PricingPage from './pages/subscription/PricingPage';
import ResetPassword from './pages/ResetPassword';

// Guest User
import GuestGeneralchatPage from './pages/guset user/GuestGeneralchatPage';
import GuestUserPastpaperCardPage from './pages/guset user/GuestUserPastpaperCardPage';
import GuestPastpaperPage from './pages/guset user/GuestPastpaperPage';
import GuestQuizIntroPage from './pages/guset user/Quiz/GuestQuizIntroPage';
import GuestQuizPage from './pages/guset user/Quiz/GuestQuizPage';
import GuestQuizResultPage from './pages/guset user/Quiz/GuestQuizResultPage';
import GuestGameCardPage from './pages/guset user/GuestGameCardPage';
import GuestGamePage from './pages/guset user/GuestGamePage';

// Festival
import FestivalStartPage from './pages/FestivalStartPage';

function App() {
    return (
        
            <Routes>              
                <Route path="/" element={<ProtectedRoute />}>
                    <Route index element={<GeneralChat />} />
                    <Route path='/generalchat/history' element={<GeneralChatHistoryPage />} />

                    {/* learner home */}
                    <Route path='/learner/home' element={<LearnerHome />} />
                    <Route path='/learner/tools' element={<LearnerTools />} />
                    <Route path='/learner/subjects' element={<SubjectsPage />} />

                    {/* general English chat  */}
                    <Route path='/generalchat' element= {<GeneralChat />} />
                    <Route path='/generalchat/:chatId' element= {<GeneralChat />} />

                    {/* pastpaper chat */}
                    <Route path='/pastpapercard' element= {<PastpaperCard />} />
                    <Route path="/pastpaper/:year/:test" element={<PastpaperContent />} />
                    <Route path='/togglebot/:year/:test' element= {<PastpaperChat />} />

                    {/* quiz */}
                    <Route path='/quiz/start' element= {<QuizStart />} />
                    <Route path='/quiz' element= {<QuizContent />} />
                    <Route path='/quiz/history/table' element={<QuizHistoryTablePage/>} />
                    <Route path='/quiz/review/:quizId' element={<QuizReviewPage />} />
                    <Route path='/quiz/card' element={<QuizCardPage />} />

                    {/* idol chat */}
                    <Route path='/legend' element= {<Legend />} />
                    <Route path='/legend/:chatId' element= {<Legend />} />
                    <Route path='/idol/card' element= {<IdolCardPage />} />
                    <Route path='/idol/history' element= {<IdolHistoryPage />} />
                    <Route path="/home/historical" element={<Historical />} />

                </Route>

                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* landing page */}
                
                <Route path="/home" element={<LandHome />} />
                <Route path="/services" element={<Services />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/about" element={<About />} />
                <Route path="/eLibrary" element={<ELibrary />} />
                <Route path="/navbar" element={<Navbar />} />
                {/*Blog*/}
                <Route path="/blog" element={<Blog/>}/>

                {/* <Route path="/admin" element={<Admin />} /> */}
                
                {/* Hangman routes */}
                <Route path='/fxhangman' element={<FxHangman />} />
                <Route path="/game/card" element={<PlayCardPage />} />
                <Route path='/wordbuzz' element={<WordbuzzPage />} />

                {/* pricing */}
                <Route path='/pricing' element={<PricingPage />} />
                <Route path='/subscribe' element={<SubsriptionPage />} />

                <Route path="/activate/:token" element={<AccountActivation />} />

                {/* guest user */}
                <Route path='/guest/generalchat' element={<GuestGeneralchatPage />} />
                <Route path='/guest/pastpaper/card' element={<GuestUserPastpaperCardPage />} />
                <Route path="/guest/pastpaper/:year/:test" element={<GuestPastpaperPage />} />
                <Route path="/guest/quiz/intro" element={<GuestQuizIntroPage />} />
                <Route path="/guest/quiz" element={<GuestQuizPage />} />
                <Route path="/guest/quiz/result" element={<GuestQuizResultPage />} />
                <Route path="/guest/game" element={<GuestGamePage />} />
                <Route path="/guest/game/card" element={<GuestGameCardPage />} />
                {/* festival */}
                <Route path='/festival/start' element={<FestivalStartPage />} />                
            </Routes>
        
    );
}

export default App;
