import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/db';
import { AuthRequest } from '../middleware/auth';

interface InfluencerProfile {
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
    profileImage: string;
}

// Get all influencers with filters
export const getInfluencers = (req: AuthRequest, res: Response) => {
    try {
        const { niche, minFollowers, maxRate, lat, lng, radius } = req.query;

        let query = 'SELECT * FROM influencer_profiles WHERE 1=1';
        const params: any[] = [];

        if (niche) {
            query += ' AND niches LIKE ?';
            params.push(`%${niche}%`);
        }
        if (minFollowers) {
            query += ' AND followerCount >= ?';
            params.push(parseInt(minFollowers as string));
        }
        if (maxRate) {
            query += ' AND hourlyRate <= ?';
            params.push(parseFloat(maxRate as string));
        }

        const influencers = db.prepare(query).all(...params) as InfluencerProfile[];

        // Filter by location if provided
        let filteredInfluencers = influencers;
        if (lat && lng && radius) {
            const userLat = parseFloat(lat as string);
            const userLng = parseFloat(lng as string);
            const radiusKm = parseFloat(radius as string);

            filteredInfluencers = influencers.filter(inf => {
                const distance = calculateDistance(userLat, userLng, inf.latitude, inf.longitude);
                return distance <= radiusKm;
            });
        }

        // Add mock verification score
        const enrichedInfluencers = filteredInfluencers.map(inf => ({
            ...inf,
            verificationScore: Math.floor(Math.random() * 20) + 80, // 80-100
            engagementRate: (Math.random() * 5 + 2).toFixed(2), // 2-7%
            isVerified: Math.random() > 0.3,
        }));

        res.json(enrichedInfluencers);
    } catch (error) {
        console.error('Get influencers error:', error);
        res.status(500).json({ error: 'Failed to get influencers' });
    }
};

// Get single influencer
export const getInfluencer = (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const influencer = db.prepare('SELECT * FROM influencer_profiles WHERE id = ?').get(id) as InfluencerProfile | undefined;

        if (!influencer) {
            return res.status(404).json({ error: 'Influencer not found' });
        }

        // Mock analytics data
        const analytics = {
            avgLikes: Math.floor(influencer.followerCount * (Math.random() * 0.1 + 0.05)),
            avgComments: Math.floor(influencer.followerCount * (Math.random() * 0.02 + 0.01)),
            avgShares: Math.floor(influencer.followerCount * (Math.random() * 0.01 + 0.005)),
            audienceDemographics: {
                '18-24': 35 + Math.floor(Math.random() * 20),
                '25-34': 25 + Math.floor(Math.random() * 20),
                '35-44': 10 + Math.floor(Math.random() * 15),
                '45+': 5 + Math.floor(Math.random() * 10),
            },
            topLocations: ['Indore', 'Bhopal', 'Ujjain', 'Mhow', 'Dewas'],
            bestPostingTimes: ['6PM', '9PM', '12PM', '8AM'],
        };

        res.json({ ...influencer, analytics });
    } catch (error) {
        console.error('Get influencer error:', error);
        res.status(500).json({ error: 'Failed to get influencer' });
    }
};

// Update influencer profile
export const updateInfluencer = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const updates = req.body;

        const existing = db.prepare('SELECT id FROM influencer_profiles WHERE userId = ?').get(userId);
        if (!existing) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'userId');
        fields.forEach(field => {
            db.prepare(`UPDATE influencer_profiles SET ${field} = ? WHERE userId = ?`)
                .run(updates[field], userId);
        });

        const profile = db.prepare('SELECT * FROM influencer_profiles WHERE userId = ?').get(userId);
        res.json(profile);
    } catch (error) {
        console.error('Update influencer error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get influencer's collaborations
export const getMyCollaborations = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const profile = db.prepare('SELECT id FROM influencer_profiles WHERE userId = ?').get(userId) as { id: string } | undefined;

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const collaborations = db.prepare(`
      SELECT c.*, bp.businessName, cam.title as campaignTitle
      FROM collaborations c
      JOIN business_profiles bp ON c.businessId = bp.id
      LEFT JOIN campaigns cam ON c.campaignId = cam.id
      WHERE c.influencerId = ?
      ORDER BY c.createdAt DESC
    `).all(profile.id);

        res.json(collaborations);
    } catch (error) {
        console.error('Get collaborations error:', error);
        res.status(500).json({ error: 'Failed to get collaborations' });
    }
};

// Helper: Calculate distance in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}