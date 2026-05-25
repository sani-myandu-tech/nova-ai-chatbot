const express = require('express');
const { body, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { sendMessage, getHistory, clearHistory, getAnalyticsData } = require('../controllers/chatController');

const router = express.Router();

// Per-IP rate limiter for chat messages
const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 60,
  message: {
    success: false,
    message: 'Too many messages. Please slow down a little! 😅',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Message validation
const messageValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
    .escape(),
  body('sessionId')
    .optional()
    .isUUID().withMessage('Invalid session ID'),
];

// Routes
router.post('/message', chatLimiter, messageValidation, sendMessage);
router.get('/history/:sessionId', param('sessionId').isUUID(), getHistory);
router.delete('/history/:sessionId', param('sessionId').isUUID(), clearHistory);
router.get('/analytics', getAnalyticsData);

module.exports = router;
