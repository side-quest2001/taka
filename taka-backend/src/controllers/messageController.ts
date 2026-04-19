import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/db';
import { AuthRequest } from '../middleware/auth';

// Get messages between two users
export const getMessages = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { otherUserId } = req.params;

        const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
      ORDER BY createdAt ASC
    `).all(userId, otherUserId, otherUserId, userId);

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};

// Get all conversations
export const getConversations = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        const conversations = db.prepare(`
      WITH user_messages AS (
        SELECT
          CASE WHEN senderId = ? THEN receiverId ELSE senderId END AS otherUserId,
          content,
          createdAt
        FROM messages
        WHERE senderId = ? OR receiverId = ?
      ),
      latest AS (
        SELECT otherUserId, MAX(createdAt) AS lastMessageAt
        FROM user_messages
        GROUP BY otherUserId
      )
      SELECT latest.otherUserId, user_messages.content AS lastMessage, latest.lastMessageAt
      FROM latest
      JOIN user_messages
        ON user_messages.otherUserId = latest.otherUserId
       AND user_messages.createdAt = latest.lastMessageAt
      ORDER BY latest.lastMessageAt DESC
    `).all(userId, userId, userId);

        // Enrich with user info
        const enrichedConversations = (conversations as any[]).map(conv => {
            // Check if other user is business or influencer
            let profile = db.prepare('SELECT id, userId, businessName, category FROM business_profiles WHERE userId = ?').get(conv.otherUserId);
            if (!profile) {
                profile = db.prepare('SELECT id, userId, name, niches, followerCount FROM influencer_profiles WHERE userId = ?').get(conv.otherUserId);
            }
            return { ...conv, profile };
        });

        res.json(enrichedConversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to get conversations' });
    }
};

// Send message
export const sendMessage = (req: AuthRequest, res: Response) => {
    try {
        const senderId = req.userId;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver and content are required' });
        }

        const messageId = uuidv4();
        db.prepare(`INSERT INTO messages (id, senderId, receiverId, content, createdAt)
      VALUES (?, ?, ?, ?, ?)`)
            .run(messageId, senderId, receiverId, content, new Date().toISOString());

        const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Mark messages as read
export const markAsRead = (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { otherUserId } = req.params;

        // In a real app, we'd add a 'read' column
        // For now, just return success
        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};
