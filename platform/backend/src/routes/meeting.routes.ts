// Meeting Routes
import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Meeting CRUD
router.post('/', (req, res) => meetingController.createMeeting(req, res));
router.get('/', (req, res) => meetingController.listMeetings(req, res));
router.get('/stats', (req, res) => meetingController.getMeetingStats(req, res));
router.get('/:id', (req, res) => meetingController.getMeeting(req, res));
router.patch('/:id', (req, res) => meetingController.updateMeeting(req, res));
router.delete('/:id', (req, res) => meetingController.deleteMeeting(req, res));

// Meeting actions
router.post('/:id/end', (req, res) => meetingController.endMeeting(req, res));

export default router;
