import Constants from 'expo-constants';

export const COLORS = {
    primary: '#6C63FF',
    secondary: '#FF6B6B',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    border: '#E5E7EB',
    disabled: '#9CA3AF',
};

const expoHostUri =
    (Constants as any).expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
const expoHost = typeof expoHostUri === 'string' ? expoHostUri.split(':')[0] : null;
const localApiBaseUrl = expoHost ? `http://${expoHost}:3000/api` : 'http://10.227.157.119:3000/api';

// Expo Go uses the live Render API by default. Use EXPO_PUBLIC_API_BASE_URL to test a local LAN backend.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://taka-ga3d.onrender.com/api';
export const LOCAL_API_BASE_URL = localApiBaseUrl;

export const INDORE_CENTER = {
    latitude: 22.7196,
    longitude: 75.8577,
};

export const CATEGORIES = [
    'Food',
    'Fashion',
    'Beauty',
    'Fitness',
    'Travel',
    'Tech',
    'Lifestyle',
    'Photography',
    'Automotive',
    'Local',
];

export const BUSINESS_CATEGORIES = [
    'Restaurant',
    'Cafe',
    'Salon',
    'Spa',
    'Fitness',
    'Shopping',
    'Electronics',
    'Bakery',
    'Books',
    'Other',
];

export const BUDGET_RANGES = [
    'Under ₹5,000',
    '₹5,000 - ₹10,000',
    '₹10,000 - ₹25,000',
    '₹25,000 - ₹50,000',
    '₹50,000+',
];

export const ROLES = {
    BUSINESS: 'business',
    PERSONAL: 'personal',
    INFLUENCER: 'influencer',
} as const;
