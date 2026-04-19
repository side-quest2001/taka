import Database, { Database as DatabaseType } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const db: DatabaseType = new Database('taka.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('business', 'personal', 'influencer')),
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS business_profiles (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    businessName TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    description TEXT,
    phone TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS influencer_profiles (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    niches TEXT,
    followerCount INTEGER DEFAULT 0,
    latitude REAL,
    longitude REAL,
    hourlyRate REAL DEFAULT 0,
    rating REAL DEFAULT 0,
    profileImage TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS personal_profiles (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    businessId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    budget REAL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
    createdAt TEXT NOT NULL,
    FOREIGN KEY (businessId) REFERENCES business_profiles(id)
  );

  CREATE TABLE IF NOT EXISTS collaborations (
    id TEXT PRIMARY KEY,
    businessId TEXT NOT NULL,
    influencerId TEXT NOT NULL,
    campaignId TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
    createdAt TEXT NOT NULL,
    FOREIGN KEY (businessId) REFERENCES business_profiles(id),
    FOREIGN KEY (influencerId) REFERENCES influencer_profiles(id),
    FOREIGN KEY (campaignId) REFERENCES campaigns(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    senderId TEXT NOT NULL,
    receiverId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (receiverId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS onboarding_requests (
    id TEXT PRIMARY KEY,
    businessId TEXT,
    businessName TEXT NOT NULL,
    ownerName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT,
    marketingNeeds TEXT,
    budget TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'contacted')),
    createdAt TEXT NOT NULL,
    FOREIGN KEY (businessId) REFERENCES business_profiles(id)
  );
`);

// Seed dummy data
const seedData = () => {
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (existingUsers.count > 0) return;

    console.log('Seeding dummy data...');

    // Create dummy influencers
    const influencers = [
        { name: 'Priya Sharma', bio: 'Food blogger & vlogger exploring Indore\'s culinary scene', niches: 'Food,Travel', followerCount: 45000, lat: 22.7196, lng: 75.8577, hourlyRate: 5000, rating: 4.8 },
        { name: 'Rahul Verma', bio: 'Tech reviewer and gadget enthusiast', niches: 'Tech,Reviews', followerCount: 32000, lat: 22.7245, lng: 75.8650, hourlyRate: 4000, rating: 4.6 },
        { name: 'Anjali Patel', bio: 'Fashion & lifestyle influencer', niches: 'Fashion,Beauty', followerCount: 68000, lat: 22.7312, lng: 75.8923, hourlyRate: 8000, rating: 4.9 },
        { name: 'Vikram Singh', bio: 'Fitness coach and health enthusiast', niches: 'Fitness,Health', followerCount: 28000, lat: 22.7150, lng: 75.8400, hourlyRate: 3500, rating: 4.5 },
        { name: 'Neha Gupta', bio: 'Travel photographer capturing MP\'s beauty', niches: 'Travel,Photography', followerCount: 52000, lat: 22.7420, lng: 75.8780, hourlyRate: 6000, rating: 4.7 },
        { name: 'Arjun Khanna', bio: 'Foodie exploring street food & cafes', niches: 'Food,Lifestyle', followerCount: 38000, lat: 22.7280, lng: 75.8600, hourlyRate: 4500, rating: 4.6 },
        { name: 'Shreya Jain', bio: 'Beauty tips and skincare expert', niches: 'Beauty,Fashion', followerCount: 41000, lat: 22.7350, lng: 75.8700, hourlyRate: 5000, rating: 4.8 },
        { name: 'Kunal Mishra', bio: 'Local guide showing best of Indore', niches: 'Travel,Local', followerCount: 25000, lat: 22.7100, lng: 75.8550, hourlyRate: 3000, rating: 4.4 },
        { name: 'Riya Choudhary', bio: 'Lifestyle and wellness content creator', niches: 'Lifestyle,Wellness', followerCount: 55000, lat: 22.7400, lng: 75.8820, hourlyRate: 6500, rating: 4.7 },
        { name: 'Aditya Roy', bio: 'Automotive enthusiast and car reviewer', niches: 'Automotive,Reviews', followerCount: 22000, lat: 22.7180, lng: 75.8680, hourlyRate: 4000, rating: 4.5 },
    ];

    const hashedPassword = bcrypt.hashSync('password123', 10);

    influencers.forEach((inf, index) => {
        const userId = uuidv4();
        const profileId = uuidv4();

        db.prepare(`INSERT INTO users (id, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)`)
            .run(userId, `influencer${index + 1}@taka.com`, hashedPassword, 'influencer', new Date().toISOString());

        db.prepare(`INSERT INTO influencer_profiles (id, userId, name, bio, niches, followerCount, latitude, longitude, hourlyRate, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(profileId, userId, inf.name, inf.bio, inf.niches, inf.followerCount, inf.lat, inf.lng, inf.hourlyRate, inf.rating);
    });

    // Create dummy businesses
    const businesses = [
        { name: 'Sagar Ratna', category: 'Restaurant', address: 'MG Road, Indore', lat: 22.7267, lng: 75.8654, desc: 'South Indian cuisine specialist' },
        { name: 'Coffee Culture', category: 'Cafe', address: 'Vijay Nagar, Indore', lat: 22.7450, lng: 75.8940, desc: 'Artisan coffee & snacks' },
        { name: 'Style Studio Salon', category: 'Salon', address: 'Palasia, Indore', lat: 22.7350, lng: 75.8800, desc: 'Premium hair & beauty services' },
        { name: 'FitZone Gym', category: 'Fitness', address: 'AB Road, Indore', lat: 22.7200, lng: 75.8500, desc: 'Modern fitness center' },
        { name: 'Rajwada Shopping', category: 'Shopping', address: 'Rajwada, Indore', lat: 22.7180, lng: 75.8570, desc: 'Traditional shopping destination' },
        { name: 'Spice Garden', category: 'Restaurant', address: 'Sapna Sangeeta, Indore', lat: 22.7300, lng: 75.8720, desc: 'North Indian & Mughlai' },
        { name: 'Tech Hub', category: 'Electronics', address: 'MG Road, Indore', lat: 22.7280, lng: 75.8680, desc: 'Gadgets & electronics' },
        { name: 'Wellness Spa', category: 'Spa', address: 'Vijay Nagar, Indore', lat: 22.7420, lng: 75.8900, desc: 'Relaxation & rejuvenation' },
        { name: 'Bake House', category: 'Bakery', address: 'Palasia, Indore', lat: 22.7380, lng: 75.8850, desc: 'Fresh cakes & pastries' },
        { name: 'Book Corner', category: 'Books', address: 'City Center, Indore', lat: 22.7320, lng: 75.8750, desc: 'Books & stationery' },
    ];

    businesses.forEach((biz, index) => {
        const userId = uuidv4();
        const profileId = uuidv4();

        db.prepare(`INSERT INTO users (id, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)`)
            .run(userId, `business${index + 1}@taka.com`, hashedPassword, 'business', new Date().toISOString());

        db.prepare(`INSERT INTO business_profiles (id, userId, businessName, category, address, latitude, longitude, description, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(profileId, userId, biz.name, biz.category, biz.address, biz.lat, biz.lng, biz.desc, '+91-9876543210');
    });

    // Create a personal user
    const personalUserId = uuidv4();
    db.prepare(`INSERT INTO users (id, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)`)
        .run(personalUserId, 'personal@taka.com', hashedPassword, 'personal', new Date().toISOString());

    db.prepare(`INSERT INTO personal_profiles (id, userId, name, phone) VALUES (?, ?, ?, ?)`)
        .run(uuidv4(), personalUserId, 'Test User', '+91-9876543210');

    console.log('Dummy data seeded successfully!');
};

seedData();

export default db;