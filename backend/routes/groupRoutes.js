import express from 'express';
import { createGroup, getUserGroups, getGroupById, } from '../controllers/groupController.js';
import { deleteGroup, updateGroup, addMember, removeMember } from '../controllers/groupController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/groups
router.post('/', ensureAuthenticated, createGroup);
router.get('/mine', ensureAuthenticated, getUserGroups);
router.get('/:groupId', ensureAuthenticated, getGroupById);
router.delete('/:groupId', ensureAuthenticated, deleteGroup);
router.put('/:groupId', ensureAuthenticated, updateGroup);

router.post('/:groupId/members', ensureAuthenticated, addMember);
// routes/groups.js
router.delete('/:groupId/members/:memberId',ensureAuthenticated, removeMember);



export default router;
