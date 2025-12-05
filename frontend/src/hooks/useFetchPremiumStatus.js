import { useEffect } from 'react';
import { usePremium } from '../components/contexts/PremiumContext';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const useFetchPremiumStatus = () => {
    const { isPremium, setIsPremium } = usePremium();

    useEffect(() => {
        const fetchPremiumStatus = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/learner/check_premium`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                console.log('premium status', response.data);
                setIsPremium(response.data.is_premium);
            } catch (error) {
                console.error('Error fetching premium status:', error);
            }
        };

        fetchPremiumStatus();
    }, [setIsPremium]);
};

export default useFetchPremiumStatus; 