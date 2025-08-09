import Group from '../models/Group.js';
import User from '../models/User.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = new Group({
      name,
      description,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'admin'
        }
      ]
    });

    const savedGroup = await group.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// get all groups

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ 'members.user': userId })
      .populate('members.user', 'name email') // optional: populate member info
      .populate('createdBy', 'name email')    // optional: populate creator info
      .sort({ createdAt: -1 });               // newest first

    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// get group by id
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members.user', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    res.json({group});
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// delete group by id
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if current user is the creator
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// update group name
export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    group.name = req.body.name || group.name;
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// add member to group
export const addMember = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { email } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push({ user: userToAdd._id }); // ✅
    await group.save();

    res.status(200).json({ message: 'Member added successfully' });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// remove member from group
export const removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;

  try {
    const group = await Group.findById(groupId).populate('members.user', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const currentUserId = req.user._id.toString();

    // Check if current user is an admin
    const isAdmin = group.members.some(
      m => m.user._id.toString() === currentUserId && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // If admin is trying to remove themselves
    if (memberId.toString() === currentUserId) {
      const totalAdmins = group.members.filter(m => m.role === 'admin').length;
      if (totalAdmins <= 1) {
        return res.status(400).json({
          message: 'You cannot remove yourself as the last admin of the group'
        });
      }
    }

    // Remove the member
    const before = group.members.length;
    group.members = group.members.filter(m => m.user._id.toString() !== memberId.toString());

    if (group.members.length === before) {
      return res.status(404).json({ message: 'Member not found in group' });
    }

    await group.save();

    const populatedGroup = await Group.findById(groupId).populate('members.user', 'name email');
    res.json({ group: populatedGroup });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

