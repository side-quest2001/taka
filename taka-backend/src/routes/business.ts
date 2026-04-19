import { Router } from 'express';
import {
    getBusinesses,
    getBusiness,
    getMyBusiness,
    updateBusiness,
    createCampaign,
    getMyCampaigns,
    sendCollaboration,
    getMyCollaborations,
    submitOnboarding
} from '../controllers/businessController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getBusinesses);
router.get('/me', authenticate, getMyBusiness);
router.post('/campaigns', authenticate, createCampaign);
router.get('/campaigns', authenticate, getMyCampaigns);
router.post('/collaborations', authenticate, sendCollaboration);
router.get('/collaborations', authenticate, getMyCollaborations);
router.post('/onboarding', authenticate, submitOnboarding);
router.put('/profile', authenticate, updateBusiness);
router.get('/:id', getBusiness);

export default router;
