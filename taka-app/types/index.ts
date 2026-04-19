export interface User {
    id: string;
    email: string;
    role: 'business' | 'personal' | 'influencer';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface BusinessProfile {
    id: string;
    userId: string;
    businessName: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    description: string;
    phone: string;
}

export interface InfluencerProfile {
    id: string;
    userId: string;
    name: string;
    bio: string;
    niches: string;
    followerCount: number;
    latitude: number;
    longitude: number;
    hourlyRate: number;
    rating: number;
    profileImage?: string;
    verificationScore?: number;
    engagementRate?: string;
    isVerified?: boolean;
}

export interface Campaign {
    id: string;
    businessId: string;
    title: string;
    description: string;
    budget: number;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
    collaborationCount?: number;
}

export interface Collaboration {
    id: string;
    businessId: string;
    influencerId: string;
    campaignId: string | null;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
    businessName?: string;
    influencerName?: string;
    campaignTitle?: string;
    niches?: string;
    followerCount?: number;
    rating?: number;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
}

export interface Conversation {
    otherUserId: string;
    lastMessage: string;
    lastMessageAt: string;
    profile?: any;
}

export interface OnboardingRequest {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    category: string;
    marketingNeeds: string;
    budget: string;
}

export interface MapMarker {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
    type: 'influencer' | 'business';
    data?: InfluencerProfile | BusinessProfile;
}