import { Router } from 'express';
import { getAssignedItems, getCompletedTasks, getCalendarData, getGamification } from '../controllers/forYou.controller.js';

const router = Router();

router.get('/assigned-items', getAssignedItems);
router.get('/completed-tasks', getCompletedTasks);
router.get('/calendar', getCalendarData);
router.get('/gamification', getGamification);

export default router; 