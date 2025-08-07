import express from 'express';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo'; 
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import configurePassport from './config/passport.js';


import authRoutes from './routes/authRoutes.js';


dotenv.config();
connectDB();
configurePassport(passport);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

export default app;
