import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/db';
import { generateToken, AuthRequest } from '../middleware/auth';

interface User {
    id: string;
    email: string;
    password: string;
    role: string;
    createdAt: string;
}

export const register = (req: AuthRequest, res: Response) => {
    try {
        const { email, password, role, profileData } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        if (!['business', 'personal', 'influencer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const userId = uuidv4();
        const hashedPassword = bcrypt.hashSync(password, 10);

        db.prepare('INSERT INTO users (id, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)')
            .run(userId, email, hashedPassword, role, new Date().toISOString());

        // Create role-specific profile
        if (role === 'business' && profileData) {
            db.prepare(`INSERT INTO business_profiles (id, userId, businessName, category, address, latitude, longitude, description, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .run(uuidv4(), userId, profileData.businessName || '', profileData.category || '',
                    profileData.address || '', profileData.latitude || 22.7196, profileData.longitude || 75.8577,
                    profileData.description || '', profileData.phone || '');
        } else if (role === 'influencer' && profileData) {
            db.prepare(`INSERT INTO influencer_profiles (id, userId, name, bio, niches, followerCount, latitude, longitude, hourlyRate, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .run(uuidv4(), userId, profileData.name || '', profileData.bio || '',
                    profileData.niches || '', profileData.followerCount || 0,
                    profileData.latitude || 22.7196, profileData.longitude || 75.8577,
                    profileData.hourlyRate || 0, profileData.rating || 0);
        } else if (role === 'personal' && profileData) {
            db.prepare('INSERT INTO personal_profiles (id, userId, name, phone) VALUES (?, ?, ?, ?)')
                .run(uuidv4(), userId, profileData.name || '', profileData.phone || '');
        }

        const token = generateToken(userId, role);
        res.status(201).json({ token, userId, role });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, userId: user.id, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const getMe = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const role = req.userRole;

        if (!userId || !role) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let profile = null;
        if (role === 'business') {
            profile = db.prepare('SELECT * FROM business_profiles WHERE userId = ?').get(userId);
        } else if (role === 'influencer') {
            profile = db.prepare('SELECT * FROM influencer_profiles WHERE userId = ?').get(userId);
        } else if (role === 'personal') {
            profile = db.prepare('SELECT * FROM personal_profiles WHERE userId = ?').get(userId);
        }

        res.json({ userId, role, profile });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
};