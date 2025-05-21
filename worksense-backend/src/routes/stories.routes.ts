/*
MUST BE DELETED : Esteban
*/

import { Router } from 'express';
import { getStories } from '../controllers/stories.controller.js';

const router = Router();

// Route to get stories for a specific user and project
router.get("/:userId/:projectId", getStories)