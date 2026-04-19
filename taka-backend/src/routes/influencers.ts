import { Router } from 'express';
import { getInfluencers, getInfluencer, updateInfluencer, getMyCollaborations } from '../controllers/influencerController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getInfluencers);
router.get('/collaborations', authenticate, getMyCollaborations);
router.put('/profile', authenticate, updateInfluencer);
router.get('/:id', authenticate, getInfluencer);

export default router;
