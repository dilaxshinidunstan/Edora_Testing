import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import { ChatProvider } from './components/chat/ChatContext.jsx';
import { HistoricalChatProvider } from './components/historical/HistoricalChatContext.jsx'; // Ensure this is the correct import
import { PremiumProvider } from './components/contexts/PremiumContext.jsx';

// For Google Analytics
import ReactGA from "react-ga4"

// Initialize Google Analytics
ReactGA.initialize("G-ZHKWQGJ8KK")

// Track route changes
function Analytics() {
  const location = useLocation();
  React.useEffect(() => {
    ReactGA.send("pageview", { page: location.pathname });
  }, [location]);
  return null;
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <HistoricalChatProvider>
            <PremiumProvider>
              <Analytics />
              <App />
            </PremiumProvider>
          </HistoricalChatProvider>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
