import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/db';
import { AuthRequest } from '../middleware/auth';

interface BusinessProfile {
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

// Get all businesses
export const getBusinesses = (req: AuthRequest, res: Response) => {
    try {
        const { category, lat, lng, radius } = req.query;

        let query = 'SELECT * FROM business_profiles WHERE 1=1';
        const params: any[] = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        const businesses = db.prepare(query).all(...params) as BusinessProfile[];

        // Filter by location if provided
        let filteredBusinesses = businesses;
        if (lat && lng && radius) {
            const userLat = parseFloat(lat as string);
            const userLng = parseFloat(lng as string);
            const radiusKm = parseFloat(radius as string);

            filteredBusinesses = businesses.filter(biz => {
                const distance = calculateDistance(userLat, userLng, biz.latitude, biz.longitude);
                return distance <= radiusKm;
            });
        }

        res.json(filteredBusinesses);
    } catch (error) {
        console.error('Get businesses error:', error);
        res.status(500).json({ error: 'Failed to get businesses' });
    }
};

// Get single business
export const getBusiness = (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const business = db.prepare('SELECT * FROM business_profiles WHERE id = ?').get(id) as BusinessProfile | undefined;

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        res.json(business);
    } catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({ error: 'Failed to get business' });
    }
};

// Get my business profile
export const getMyBusiness = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const business = db.prepare('SELECT * FROM business_profiles WHERE userId = ?').get(userId) as BusinessProfile | undefined;

        if (!business) {
            return res.status(404).json({ error: 'Business profile not found' });
        }

        res.json(business);
    } catch (error) {
        console.error('Get my business error:', error);
        res.status(500).json({ error: 'Failed to get business' });
    }
};

// Update business profile
export const updateBusiness = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const updates = req.body;

        const existing = db.prepare('SELECT id FROM business_profiles WHERE userId = ?').get(userId);
        if (!existing) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'userId');
        fields.forEach(field => {
            db.prepare(`UPDATE business_profiles SET ${field} = ? WHERE userId = ?`)
                .run(updates[field], userId);
        });

        const profile = db.prepare('SELECT * FROM business_profiles WHERE userId = ?').get(userId);
        res.json(profile);
    } catch (error) {
        console.error('Update business error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Create campaign
export const createCampaign = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { title, description, budget } = req.body;

        const business = db.prepare('SELECT id FROM business_profiles WHERE userId = ?').get(userId) as { id: string } | undefined;
        if (!business) {
            return res.status(404).json({ error: 'Business profile not found' });
        }

        const campaignId = uuidv4();
        db.prepare(`INSERT INTO campaigns (id, businessId, title, description, budget, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run(campaignId, business.id, title, description, budget || 0, 'active', new Date().toISOString());

        const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
        res.status(201).json(campaign);
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

// Get my campaigns
export const getMyCampaigns = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const business = db.prepare('SELECT id FROM business_profiles WHERE userId = ?').get(userId) as { id: string } | undefined;

        if (!business) {
            return res.status(404).json({ error: 'Business profile not found' });
        }

        const campaigns = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM collaborations WHERE campaignId = c.id) as collaborationCount
      FROM campaigns c
      WHERE c.businessId = ?
      ORDER BY c.createdAt DESC
    `).all(business.id);

        res.json(campaigns);
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to get campaigns' });
    }
};

// Send collaboration request
export const sendCollaboration = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { influencerId, campaignId, message } = req.body;

        const business = db.prepare('SELECT id FROM business_profiles WHERE userId = ?').get(userId) as { id: string } | undefined;
        if (!business) {
            return res.status(404).json({ error: 'Business profile not found' });
        }

        // Check if request already exists
        const existing = db.prepare(`
      SELECT id FROM collaborations 
      WHERE businessId = ? AND influencerId = ? AND campaignId = ?
    `).get(business.id, influencerId, campaignId || null);

        if (existing) {
            return res.status(400).json({ error: 'Collaboration request already sent' });
        }

        const collabId = uuidv4();
        db.prepare(`INSERT INTO collaborations (id, businessId, influencerId, campaignId, message, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run(collabId, business.id, influencerId, campaignId || null, message || '', 'pending', new Date().toISOString());

        const collaboration = db.prepare('SELECT * FROM collaborations WHERE id = ?').get(collabId);
        res.status(201).json(collaboration);
    } catch (error) {
        console.error('Send collaboration error:', error);
        res.status(500).json({ error: 'Failed to send collaboration request' });
    }
};

// Get my collaborations (as business)
export const getMyCollaborations = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const business = db.prepare('SELECT id FROM business_profiles WHERE userId = ?').get(userId) as { id: string } | undefined;

        if (!business) {
            return res.status(404).json({ error: 'Business profile not found' });
        }

        const collaborations = db.prepare(`
      SELECT c.*, ip.name as influencerName, ip.niches, ip.followerCount, ip.rating
      FROM collaborations c
      JOIN influencer_profiles ip ON c.influencerId = ip.id
      WHERE c.businessId = ?
      ORDER BY c.createdAt DESC
    `).all(business.id);

        res.json(collaborations);
    } catch (error) {
        console.error('Get collaborations error:', error);
        res.status(500).json({ error: 'Failed to get collaborations' });
    }
};

// Submit onboarding request
export const submitOnboarding = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { businessName, ownerName, email, phone, category, marketingNeeds, budget } = req.body;

        let businessId = null;
        if (userId) {
            const business = db.prepare('SELECT id FROM business_profiles WHERE userId = ?').get(userId) as { id: string } | undefined;
            businessId = business?.id || null;
        }

        const onboardingId = uuidv4();
        db.prepare(`INSERT INTO onboarding_requests 
      (id, businessId, businessName, ownerName, email, phone, category, marketingNeeds, budget, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(onboardingId, businessId, businessName, ownerName, email, phone, category || '',
                marketingNeeds || '', budget || '', 'pending', new Date().toISOString());

        res.status(201).json({
            message: 'Onboarding request submitted successfully',
            id: onboardingId
        });
    } catch (error) {
        console.error('Submit onboarding error:', error);
        res.status(500).json({ error: 'Failed to submit onboarding request' });
    }
};

// Helper: Calculate distance in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}