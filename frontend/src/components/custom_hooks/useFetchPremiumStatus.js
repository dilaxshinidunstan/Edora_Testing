import { useEffect, useCallback } from 'react';
import { usePremium } from '../contexts/PremiumContext'
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const useFetchPremiumStatus = (setLoading = () => {}) => {
    const { setIsPremium } = usePremium();

    const fetchPremiumStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) return;

            const response = await axios.get(`${apiBaseUrl}/learner/check_premium`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const isPremiumValue = Boolean(response.data.is_premium);
            setIsPremium(isPremiumValue);

        } catch (error) {
            console.error('Error fetching premium status:', error);
        } finally {
            setLoading(false);
        }
    }, [setIsPremium, setLoading]);

    useEffect(() => {
        fetchPremiumStatus();
    }, [fetchPremiumStatus]);
};

export default useFetchPremiumStatus;