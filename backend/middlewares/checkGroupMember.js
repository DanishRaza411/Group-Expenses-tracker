// middlewares/checkGroupMember.js
import Group from "../models/Group.js";

export const checkGroupMember = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.body.groupId;
    const userId = req.user._id;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const group = await Group.findById(groupId).lean();
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    next();
  } catch (error) {
    console.error("checkGroupMember error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
