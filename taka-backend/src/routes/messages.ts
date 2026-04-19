import { Router } from 'express';
import { getMessages, getConversations, sendMessage, markAsRead } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/:otherUserId', authenticate, getMessages);
router.post('/', authenticate, sendMessage);
router.put('/:otherUserId/read', authenticate, markAsRead);

export default router;