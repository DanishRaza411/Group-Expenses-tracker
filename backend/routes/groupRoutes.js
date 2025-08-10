import express from 'express';
import { createGroup, getUserGroups, getGroupById, } from '../controllers/groupController.js';
import { deleteGroup, updateGroup, addMember, removeMember } from '../controllers/groupController.js';
import { ensureAuthenticated, ensureGroupAdmin } from '../middlewares/authMiddleware.js';
import { getGroupExpenses } from '../controllers/expenseController.js';
import { checkGroupMember } from '../middlewares/checkGroupMember.js';
import Group from '../models/Group.js';

const router = express.Router();

// Middleware to fetch group by ID
router.param('groupId', async (req, res, next, id) => {
  try {
    const group = await Group.findById(id).populate('members.user', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    req.group = group;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/groups
router.post('/', ensureAuthenticated, createGroup);
router.get('/mine', ensureAuthenticated, getUserGroups);
router.get('/:groupId', ensureAuthenticated, getGroupById);
router.delete('/:groupId', ensureAuthenticated,ensureGroupAdmin, deleteGroup);
router.put('/:groupId', ensureAuthenticated, updateGroup, ensureGroupAdmin);

router.post('/:groupId/members', ensureAuthenticated,ensureGroupAdmin, addMember);
router.delete('/:groupId/members/:memberId',ensureAuthenticated, ensureGroupAdmin, removeMember);


// get expenses for a group
router.get('/:groupId/expenses', ensureAuthenticated, checkGroupMember, getGroupExpenses);


export default router;
