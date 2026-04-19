import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

const REQUEST_TIMEOUT_MS = 8000;

class ApiService {
    private token: string | null = null;
    private tokenLoadPromise: Promise<void>;

    constructor() {
        this.tokenLoadPromise = this.loadToken();
    }

    private async loadToken() {
        try {
            this.token = await AsyncStorage.getItem('taka_token');
        } catch (error) {
            console.error('Failed to load token:', error);
        }
    }

    async setToken(token: string) {
        this.token = token;
        await AsyncStorage.setItem('taka_token', token);
    }

    async clearToken() {
        this.token = null;
        await AsyncStorage.removeItem('taka_token');
    }

    async getStoredToken() {
        await this.tokenLoadPromise;
        return this.token;
    }

    getBaseUrl() {
        return API_BASE_URL;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        await this.tokenLoadPromise;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(error.error || 'Request failed');
            }

            return response.json();
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                throw new Error(`Request timed out. Check that the backend is reachable at ${API_BASE_URL}`);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // Auth
    async register(email: string, password: string, role: string, profileData?: any) {
        const data = await this.request<{ token: string; userId: string; role: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, role, profileData }),
        });
        if (data.token) {
            await this.setToken(data.token);
        }
        return data;
    }

    async login(email: string, password: string) {
        const data = await this.request<{ token: string; userId: string; role: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            await this.setToken(data.token);
        }
        return data;
    }

    async getMe() {
        return this.request<{ userId: string; role: string; profile: any }>('/auth/me');
    }

    async logout() {
        await this.clearToken();
    }

    async healthCheck() {
        return this.request<{ status: string; message: string }>('/health');
    }

    // Influencers
    async getInfluencers(filters?: { niche?: string; minFollowers?: number; maxRate?: number; lat?: number; lng?: number; radius?: number }) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, value.toString());
            });
        }
        return this.request<any[]>(`/influencers?${params.toString()}`);
    }

    async getInfluencer(id: string) {
        return this.request<any>(`/influencers/${id}`);
    }

    async updateInfluencerProfile(updates: any) {
        return this.request<any>('/influencers/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async getInfluencerCollaborations() {
        return this.request<any[]>('/influencers/collaborations');
    }

    // Businesses
    async getBusinesses(filters?: { category?: string; lat?: number; lng?: number; radius?: number }) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, value.toString());
            });
        }
        return this.request<any[]>(`/businesses?${params.toString()}`);
    }

    async getBusiness(id: string) {
        return this.request<any>(`/businesses/${id}`);
    }

    async getMyBusiness() {
        return this.request<any>('/businesses/me');
    }

    async updateBusinessProfile(updates: any) {
        return this.request<any>('/businesses/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async createCampaign(campaign: { title: string; description: string; budget?: number }) {
        return this.request<any>('/businesses/campaigns', {
            method: 'POST',
            body: JSON.stringify(campaign),
        });
    }

    async getMyCampaigns() {
        return this.request<any[]>('/businesses/campaigns');
    }

    async sendCollaboration(collaboration: { influencerId: string; campaignId?: string; message?: string }) {
        return this.request<any>('/businesses/collaborations', {
            method: 'POST',
            body: JSON.stringify(collaboration),
        });
    }

    async getMyCollaborations() {
        return this.request<any[]>('/businesses/collaborations');
    }

    async submitOnboarding(request: any) {
        return this.request<any>('/businesses/onboarding', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Messages
    async getConversations() {
        return this.request<any[]>('/messages/conversations');
    }

    async getMessages(otherUserId: string) {
        return this.request<any[]>(`/messages/${otherUserId}`);
    }

    async sendMessage(receiverId: string, content: string) {
        return this.request<any>('/messages', {
            method: 'POST',
            body: JSON.stringify({ receiverId, content }),
        });
    }
}

export const api = new ApiService();
