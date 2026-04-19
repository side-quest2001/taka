import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import influencerRoutes from './routes/influencers';
import businessRoutes from './routes/business';
import messageRoutes from './routes/messages';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TAKA API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TAKA API Server running on http://localhost:${PORT}`);
});

export default app;