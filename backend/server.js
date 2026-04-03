import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import youtubeRoutes from './routes/youtube.js';
import timelineRoutes from './routes/timeline.js';
import messagesRoutes from './routes/messages.js';
import notificationsRoutes from './routes/notifications.js';
import noteShareRoutes from './routes/noteShare.js';
import friendsRoutes from './routes/friends.js';
import { initRedis } from './lib/redis.js';
import passport from './config/passport.js';
import aiRoutes from './routes/ai.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/timeline', timelineRoutes);

app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/noteShare', noteShareRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send(' Backend is working');
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: err.message });
});

import http from 'http';
import setupSocket from './socket.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = setupSocket(server);

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

initRedis().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
  });
});
