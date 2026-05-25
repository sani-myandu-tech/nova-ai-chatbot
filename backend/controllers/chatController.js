const { v4: uuidv4 } = require('uuid');
const { getResponse, getAnalytics, incrementSession } = require('../utils/chatEngine');

// In-memory session store (replace with Redis/MongoDB for production scale)
const sessions = new Map();
const MAX_HISTORY = 20;
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create a session
 */
const getSession = (sessionId) => {
  if (!sessionId || !sessions.has(sessionId)) {
    const id = uuidv4();
    sessions.set(id, {
      id,
      history: [],
      createdAt: new Date(),
      lastActive: new Date(),
      messageCount: 0,
    });
    incrementSession();
    return sessions.get(id);
  }
  const session = sessions.get(sessionId);
  session.lastActive = new Date();
  return session;
};

// Periodic cleanup of expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActive.getTime() > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

/**
 * POST /api/chat/message
 * Process a user message and return bot response
 */
const sendMessage = (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    const trimmedMessage = message.trim().substring(0, 500); // cap at 500 chars
    const session = getSession(sessionId);
    session.messageCount++;

    // Add user message to history
    session.history.push({
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
    });

    // Get bot response
    const { response, category, confidence } = getResponse(trimmedMessage, session.history);

    // Add bot response to history
    session.history.push({
      role: 'bot',
      content: response,
      timestamp: new Date(),
    });

    // Keep history trimmed
    if (session.history.length > MAX_HISTORY * 2) {
      session.history = session.history.slice(-MAX_HISTORY * 2);
    }

    // Simulate typing delay based on response length (50ms per word, 200–1500ms range)
    const wordCount = response.split(' ').length;
    const typingDelay = Math.min(1500, Math.max(200, wordCount * 50));

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        response,
        category,
        confidence,
        typingDelay,
        messageCount: session.messageCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'The chatbot encountered an error. Please try again.',
    });
  }
};

/**
 * GET /api/chat/history/:sessionId
 * Retrieve chat history for a session
 */
const getHistory = (req, res) => {
  const { sessionId } = req.params;
  if (!sessions.has(sessionId)) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  const session = sessions.get(sessionId);
  return res.status(200).json({
    success: true,
    data: {
      sessionId,
      history: session.history,
      messageCount: session.messageCount,
      createdAt: session.createdAt,
    },
  });
};

/**
 * DELETE /api/chat/history/:sessionId
 * Clear chat history for a session
 */
const clearHistory = (req, res) => {
  const { sessionId } = req.params;
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    session.history = [];
    session.messageCount = 0;
  }
  return res.status(200).json({ success: true, message: 'Chat history cleared.' });
};

/**
 * GET /api/chat/analytics
 * Return chatbot usage analytics
 */
const getAnalyticsData = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      ...getAnalytics(),
      activeSessions: sessions.size,
    },
  });
};

module.exports = { sendMessage, getHistory, clearHistory, getAnalyticsData };
