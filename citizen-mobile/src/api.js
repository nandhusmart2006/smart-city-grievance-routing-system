import axios from 'axios';

// IMPORTANT: For Android Emulator, use 10.0.2.2. For iOS Simulator, use localhost.
// For physical devices scanning Expo QR code, use your computer's local Wi-Fi IP (e.g. 192.168.1.x)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const submitGrievance = async (data) => {
    try {
        const response = await api.post('/complaint', data);
        return response.data;
    } catch (error) {
        console.error('API Error (submitGrievance):', error?.response?.data || error.message);
        throw error;
    }
};

export const getGrievanceStatus = async (ticketId) => {
    try {
        const response = await api.get(`/complaint/${ticketId}`);
        return response.data;
    } catch (error) {
        console.error('API Error (getGrievanceStatus):', error?.response?.data || error.message);
        throw error;
    }
};

export default api;
