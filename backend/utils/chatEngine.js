/**
 * chatEngine.js
 * Retrieval-based chatbot engine with pattern matching,
 * context awareness, and intelligent fallback handling.
 */

// ── Knowledge Base ─────────────────────────────────────────────────────────
const knowledgeBase = [
  // Greetings
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'yo'],
    responses: [
      "Hello! 👋 I'm Nova, your AI assistant. How can I help you today?",
      "Hi there! Great to see you. What can I do for you?",
      "Hey! I'm Nova. Ask me anything — I'm here to help!",
    ],
    category: 'greeting',
  },

  // Farewells
  {
    patterns: ['bye', 'goodbye', 'see you', 'later', 'farewell', 'cya', 'ttyl', 'take care'],
    responses: [
      "Goodbye! Have a wonderful day! 👋",
      "See you later! Feel free to come back anytime.",
      "Take care! It was great chatting with you. 😊",
    ],
    category: 'farewell',
  },

  // How are you
  {
    patterns: ['how are you', 'how do you do', "how's it going", 'what\'s up', 'you ok', 'doing well'],
    responses: [
      "I'm doing great, thanks for asking! 😊 Ready to help with anything you need.",
      "Running at 100%! How can I assist you today?",
      "All systems go! What can I help you with?",
    ],
    category: 'smalltalk',
  },

  // Who are you / About
  {
    patterns: ['who are you', 'what are you', 'your name', 'about you', 'introduce yourself', 'tell me about yourself'],
    responses: [
      "I'm Nova 🤖 — an AI-powered chatbot built with Node.js and Express.js. I can answer questions, provide information, and have intelligent conversations!",
      "My name is Nova! I'm a retrieval-based AI chatbot. I was built to demonstrate modern chatbot architecture for cloud applications.",
    ],
    category: 'identity',
  },

  // Capabilities
  {
    patterns: ['what can you do', 'your capabilities', 'help me', 'what do you know', 'features', 'abilities'],
    responses: [
      "Here's what I can help with:\n\n📚 **Answer questions** on many topics\n💻 **Tech support** & programming help\n🌦️ **General knowledge** queries\n💡 **Tips & recommendations**\n🗣️ **Casual conversation**\n\nJust ask away!",
    ],
    category: 'capabilities',
  },

  // Programming / Tech
  {
    patterns: ['javascript', 'python', 'java', 'coding', 'programming', 'developer', 'software', 'code', 'debug'],
    responses: [
      "I love talking tech! 💻 JavaScript and Python are among the most popular languages right now. Are you looking for help with a specific language or concept?",
      "Programming is fascinating! Whether it's frontend, backend, or full-stack — I can point you in the right direction. What are you working on?",
    ],
    category: 'tech',
  },

  // Node.js / Express
  {
    patterns: ['nodejs', 'node js', 'express', 'expressjs', 'backend', 'server', 'api', 'rest api'],
    responses: [
      "Node.js is a powerful JavaScript runtime for building scalable backend services. Express.js makes it easy to create REST APIs with minimal boilerplate. This chatbot itself runs on Node.js + Express! 🚀",
      "Express.js is the go-to framework for Node.js backends. Key concepts: routes, middleware, controllers, and environment config. Want a specific tip?",
    ],
    category: 'tech',
  },

  // Cloud / Deployment
  {
    patterns: ['cloud', 'deploy', 'deployment', 'render', 'railway', 'aws', 'heroku', 'hosting', 'server', 'docker'],
    responses: [
      "☁️ Cloud deployment is key for modern apps! Platforms like Render, Railway, and AWS make it easy. This app can be deployed in minutes with a `render.yaml` config. Want deployment tips?",
      "For Node.js apps, Render and Railway offer free tiers with auto-deploy from GitHub. MongoDB Atlas handles your cloud database. Want a step-by-step guide?",
    ],
    category: 'cloud',
  },

  // AI / Machine Learning
  {
    patterns: ['artificial intelligence', 'machine learning', 'ai', 'ml', 'deep learning', 'neural', 'chatgpt', 'openai', 'llm'],
    responses: [
      "AI is transforming everything! 🤖 From large language models like GPT-4 to computer vision and recommendation systems. I'm a retrieval-based chatbot — a simpler but effective form of AI. What aspect of AI interests you?",
      "Machine learning involves training models on data to make predictions. Deep learning uses neural networks for complex tasks like image recognition and NLP. Exciting field! Any specific topic?",
    ],
    category: 'ai',
  },

  // Database
  {
    patterns: ['database', 'mongodb', 'sql', 'mysql', 'postgres', 'nosql', 'data storage', 'mongoose'],
    responses: [
      "Great question on databases! MongoDB is a NoSQL document database — perfect for flexible, scalable apps. SQL databases like PostgreSQL are ideal for structured relational data. The choice depends on your use case!",
      "MongoDB + Mongoose is a popular combo for Node.js apps. It lets you define schemas and interact with your database in an object-oriented way. Need specific help?",
    ],
    category: 'tech',
  },

  // Security
  {
    patterns: ['security', 'hacking', 'sql injection', 'xss', 'jwt', 'authentication', 'password', 'encryption'],
    responses: [
      "🔐 Security is critical in web development! Key practices include: input validation, parameterized queries (prevent SQL injection), JWT for auth, bcrypt for password hashing, and HTTPS everywhere.",
      "Web security essentials: sanitize all user input, use HTTPS, implement rate limiting, hash passwords with bcrypt, and always validate on the server side — never trust the client.",
    ],
    category: 'security',
  },

  // Weather
  {
    patterns: ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'climate'],
    responses: [
      "I don't have real-time weather data, but you can check weather.com or simply Google your city's forecast! 🌤️ Want to know how to build a weather app with a free API?",
    ],
    category: 'general',
  },

  // Time / Date
  {
    patterns: ['time', 'date', 'today', 'what day', 'current time'],
    responses: [
      `The current date/time on this server is: **${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}** (SAST). 🕐`,
    ],
    category: 'utility',
  },

  // Jokes
  {
    patterns: ['joke', 'funny', 'make me laugh', 'tell me something funny', 'humor'],
    responses: [
      "Why do programmers prefer dark mode? 🌙 Because light attracts bugs! 😄",
      "Why did the developer go broke? Because he used up all his cache! 💸",
      "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?' 😂",
      "Why do Java developers wear glasses? Because they don't C#! 🤓",
    ],
    category: 'fun',
  },

  // Thanks
  {
    patterns: ['thank you', 'thanks', 'thank', 'appreciate', 'helpful', 'great', 'awesome', 'perfect'],
    responses: [
      "You're welcome! 😊 Happy to help anytime.",
      "Glad I could help! Is there anything else you'd like to know?",
      "Anytime! That's what I'm here for. 🤖",
    ],
    category: 'positive',
  },

  // Yes / No / OK
  {
    patterns: ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'alright', 'correct', 'right'],
    responses: [
      "Great! What would you like to explore next?",
      "Awesome! Feel free to ask me anything.",
      "Perfect! What else can I help you with?",
    ],
    category: 'affirmation',
  },

  // No
  {
    patterns: ['no', 'nope', 'nah', 'not really', 'never mind', 'forget it'],
    responses: [
      "No problem at all! Let me know if you change your mind.",
      "That's fine! I'm here whenever you need me. 😊",
    ],
    category: 'negation',
  },

  // Help
  {
    patterns: ['help', 'support', 'assist', 'guide', 'tutorial', 'how to', 'explain'],
    responses: [
      "Of course! I'm here to help. 💡 You can ask me about:\n- **Technology & Programming**\n- **Cloud & Deployment**\n- **AI & Machine Learning**\n- **General knowledge**\n- **Fun & casual chat**\n\nWhat do you need?",
    ],
    category: 'help',
  },

  // About this app
  {
    patterns: ['this app', 'this chatbot', 'built with', 'tech stack', 'how were you made', 'your code'],
    responses: [
      "I was built with:\n\n🟢 **Node.js** — runtime\n⚡ **Express.js** — backend API\n🌐 **HTML/CSS/JS** — frontend\n🎨 **Custom UI** — chat interface\n☁️ **Render** — cloud deployment\n\nAll open source, fully deployable in minutes!",
    ],
    category: 'meta',
  },
];

// ── Fallback responses ─────────────────────────────────────────────────────
const fallbackResponses = [
  "Hmm, I'm not sure about that one. 🤔 Could you rephrase or ask something else?",
  "That's a tricky one! I don't have information on that yet. Try asking about tech, coding, AI, or cloud topics!",
  "I didn't quite catch that. 🤖 I'm best at answering questions about technology, programming, and cloud computing.",
  "Interesting question! I'm still learning. For now, try asking about JavaScript, Node.js, AI, or cloud deployment.",
  "I don't have a great answer for that yet. But I'm always improving! Ask me something tech-related — I shine there. 💡",
];

// ── In-memory analytics ────────────────────────────────────────────────────
const analytics = {
  totalMessages: 0,
  matchedResponses: 0,
  fallbackCount: 0,
  categoryHits: {},
  topQueries: {},
  sessionCount: 0,
  startTime: new Date(),
};

// ── Core engine functions ──────────────────────────────────────────────────

/**
 * Normalize input for matching
 */
const normalize = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ');

/**
 * Score a knowledge base entry against the input
 */
const scoreEntry = (input, entry) => {
  const words = input.split(' ');
  let score = 0;
  for (const pattern of entry.patterns) {
    if (input.includes(pattern)) {
      score += pattern.split(' ').length * 2; // multi-word patterns score higher
    } else {
      for (const word of words) {
        if (pattern.includes(word) && word.length > 3) score += 1;
      }
    }
  }
  return score;
};

/**
 * Pick a random response from an array
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Update analytics
 */
const trackQuery = (input, category, matched) => {
  analytics.totalMessages++;
  if (matched) {
    analytics.matchedResponses++;
    analytics.categoryHits[category] = (analytics.categoryHits[category] || 0) + 1;
  } else {
    analytics.fallbackCount++;
  }
  const key = input.split(' ').slice(0, 3).join(' ');
  analytics.topQueries[key] = (analytics.topQueries[key] || 0) + 1;
};

/**
 * Main chat function — returns a response for the given input
 * @param {string} userMessage
 * @param {Array} conversationHistory  — last N messages for context
 * @returns {{ response: string, category: string, confidence: number }}
 */
const getResponse = (userMessage, conversationHistory = []) => {
  if (!userMessage || typeof userMessage !== 'string') {
    return { response: "Please send a message!", category: 'error', confidence: 0 };
  }

  const normalized = normalize(userMessage);

  // Context: check if last bot message was a question, adjust for one-word replies
  const lastBotMsg = conversationHistory.findLast?.(m => m.role === 'bot')?.content || '';
  const isShortReply = normalized.split(' ').length <= 2;

  // Score all entries
  const scored = knowledgeBase
    .map(entry => ({ entry, score: scoreEntry(normalized, entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    const best = scored[0];
    const response = pickRandom(best.entry.responses);
    trackQuery(normalized, best.entry.category, true);
    return {
      response,
      category: best.entry.category,
      confidence: Math.min(100, best.score * 20),
    };
  }

  // Fallback
  trackQuery(normalized, 'fallback', false);
  return {
    response: pickRandom(fallbackResponses),
    category: 'fallback',
    confidence: 0,
  };
};

/**
 * Get current analytics snapshot
 */
const getAnalytics = () => {
  const topQueries = Object.entries(analytics.topQueries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  const categoryBreakdown = Object.entries(analytics.categoryHits)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  const uptimeMs = Date.now() - analytics.startTime.getTime();
  const uptimeHours = (uptimeMs / 3600000).toFixed(1);

  return {
    totalMessages: analytics.totalMessages,
    matchedResponses: analytics.matchedResponses,
    fallbackCount: analytics.fallbackCount,
    matchRate: analytics.totalMessages > 0
      ? Math.round((analytics.matchedResponses / analytics.totalMessages) * 100)
      : 0,
    sessionCount: analytics.sessionCount,
    topQueries,
    categoryBreakdown,
    uptimeHours,
    knowledgeBaseSize: knowledgeBase.length,
    startTime: analytics.startTime,
  };
};

const incrementSession = () => { analytics.sessionCount++; };

module.exports = { getResponse, getAnalytics, incrementSession };
