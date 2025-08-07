import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    req.login(user, err => {
      if (err) return res.status(500).json({ message: 'Login after register failed' });
      return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = (req, res) => {
  res.status(200).json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
};

export const logoutUser = (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

export const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    const { _id, name, email } = req.user;
    return res.status(200).json({ user: { id: _id, name, email } });
  } else {
    return res.status(401).json({ message: 'Not authenticated' });
  }
};
