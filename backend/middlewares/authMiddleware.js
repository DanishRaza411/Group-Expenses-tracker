import Group from "../models/Group.js";

export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};


export const ensureGroupAdmin = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isAdmin = group.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only group admins can perform this action' });
    }

    // Optionally attach group to req for later handlers
    req.group = group;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
