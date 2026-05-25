# 🤖 Nova — AI-Powered Chatbot

> A modern, cloud-deployable AI chatbot web application built with Node.js, Express.js, HTML/CSS/JavaScript. Features intelligent retrieval-based responses, real-time typing animations, session management, analytics dashboard, and cloud deployment readiness.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Objectives](#objectives)
- [Features](#features)
- [Technologies](#technologies)
- [Chatbot Architecture](#chatbot-architecture)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Testing](#testing)
- [Future Improvements](#future-improvements)

---

## Overview

**Nova** is a production-grade AI-powered chatbot that demonstrates modern full-stack web development principles. It uses a retrieval-based NLP approach with pattern matching to respond intelligently to user queries, with a polished animated chat interface, session persistence, and live analytics.

---

## Objectives

- Provide instant, intelligent automated responses to user queries
- Demonstrate modern Node.js/Express backend architecture
- Deliver a production-quality, responsive chat UI
- Track and display real-time usage analytics
- Be fully cloud-deployable in minutes

---

## Features

### 🤖 AI Chat Engine
- **18 intent categories** with 80+ predefined response patterns
- **Multi-word pattern scoring** — longer, more specific matches rank higher
- **Context-aware fallback** with helpful redirections
- **Case-insensitive, punctuation-tolerant** input normalization
- URL-decoded input handling for robust matching

### 💬 Chat Interface
- Smooth animated message bubbles with stagger reveal
- **Typing indicator** (3-dot animation) with delay proportional to response length
- Auto-resizing input textarea
- Character counter (500 char limit)
- `Enter` to send, `Shift+Enter` for new line
- Chat export to `.txt` file
- One-click clear chat
- **Topic chips** for quick conversation starters

### 📊 Analytics Dashboard
- Total messages, match rate, session count
- Per-category response breakdown with progress bars
- Top 10 most-asked queries
- Server uptime and knowledge base size
- Live refresh

### 🏗️ Backend Architecture
- Express.js REST API with full middleware stack
- UUID-based session management (in-memory, TTL 30 min)
- Rate limiting (60 msg/min per IP)
- Input validation and sanitization
- Helmet.js security headers
- CORS + compression

---

## Technologies

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Frontend | HTML5, CSS3, JavaScript (ES2020) |
| Fonts | Syne (display), DM Sans (body) |
| Icons | Bootstrap Icons |
| Security | Helmet.js, express-rate-limit |
| Validation | express-validator |
| Sessions | UUID v4 + in-memory Map |
| Testing | Jest |
| Deployment | Render / Railway |

---

## Chatbot Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (Frontend)                    │
│                                                           │
│   ┌─────────────┐   ┌──────────────┐   ┌─────────────┐  │
│   │  Chat UI    │   │  Analytics   │   │ Session Mgmt│  │
│   │  index.html │   │  Dashboard   │   │  (UUID)     │  │
│   └──────┬──────┘   └──────┬───────┘   └──────┬──────┘  │
│          └─────────────────┴──────────────────┘         │
│                     fetch() API calls                    │
└──────────────────────────┬───────────────────────────────┘
                            │ HTTP/JSON
┌──────────────────────────▼───────────────────────────────┐
│                  EXPRESS.JS BACKEND                       │
│                                                           │
│  ┌───────────┐  ┌───────────┐  ┌────────────────────┐   │
│  │  Helmet   │→ │   CORS    │→ │  Rate Limiter      │   │
│  └───────────┘  └───────────┘  │  (60 msg/min/IP)   │   │
│                                └──────────┬───────────┘   │
│                                           │               │
│  ┌────────────────────────────────────────▼─────────────┐ │
│  │              CHAT ROUTES (/api/chat)                 │ │
│  │   POST /message  GET /history  DELETE /history       │ │
│  │   GET /analytics                                     │ │
│  └────────────────────────────────────────┬─────────────┘ │
│                                           │               │
│  ┌────────────────────────────────────────▼─────────────┐ │
│  │              CHAT CONTROLLER                         │ │
│  │   • Session management (UUID Map, TTL 30 min)        │ │
│  │   • Message routing & history (last 20 messages)     │ │
│  │   • Typing delay calculation                         │ │
│  └────────────────────────────────────────┬─────────────┘ │
│                                           │               │
│  ┌────────────────────────────────────────▼─────────────┐ │
│  │              CHAT ENGINE (chatEngine.js)             │ │
│  │                                                      │ │
│  │  Input → normalize() → scoreEntry() → ranked list   │ │
│  │                                                      │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  KNOWLEDGE BASE (18 intent categories)       │   │ │
│  │  │  greeting · farewell · identity · tech       │   │ │
│  │  │  cloud · ai · security · fun · help · …      │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │                                                      │ │
│  │  Best match → pickRandom(responses) → return         │ │
│  │  No match   → pickRandom(fallbackResponses)          │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Matching Algorithm

```
1. Normalize input (lowercase, strip punctuation)
2. For each knowledge base entry:
   - Multi-word pattern match → score += patternWordCount × 2
   - Single word overlap → score += 1 per word (length > 2)
3. Sort entries by score descending
4. If best score > 0 → return random response from top entry
5. If no match → return random fallback response
6. Track all queries in analytics
```

---

## Installation

```bash
# Clone the repo
git clone https://github.com/your-username/nova-chatbot.git
cd nova-chatbot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# (No required vars for basic run — all optional)

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send a message, receive bot response |
| GET | `/api/chat/history/:sessionId` | Get session chat history |
| DELETE | `/api/chat/history/:sessionId` | Clear session chat history |
| GET | `/api/chat/analytics` | Usage analytics & statistics |
| GET | `/api/health` | Health check |

### POST /api/chat/message

**Request:**
```json
{
  "message": "Hello, who are you?",
  "sessionId": "optional-uuid-for-session-continuity"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-v4",
    "response": "I'm Nova 🤖 — an AI-powered chatbot built with Node.js...",
    "category": "identity",
    "confidence": 80,
    "typingDelay": 450,
    "messageCount": 1,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Deployment

### Render (Recommended — Free Tier)

1. Push to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect repo → Render detects `render.yaml` automatically
4. Deploy — live in ~2 minutes ✅

### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Local Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "backend/server.js"]
```

---

## Testing

```bash
# Run all tests
npm test

# With coverage report
npm test -- --coverage
```

**Test coverage:**
- 15 intent matching tests (greeting, farewell, tech, cloud, AI, security, jokes…)
- 3 fallback handling tests
- 10 edge case tests (null, empty, caps, emojis, long input, special chars)
- 6 response quality tests
- 6 analytics tests

**Total: 40 tests**

---

## Future Improvements

- [ ] OpenAI / Anthropic API integration for LLM-powered responses
- [ ] MongoDB persistence for chat history across restarts
- [ ] WebSocket support for true real-time streaming responses
- [ ] Multi-language support (i18n)
- [ ] Voice input/output (Web Speech API)
- [ ] Admin dashboard to add/edit knowledge base entries
- [ ] Sentiment analysis on user messages
- [ ] User authentication for personalized conversations
- [ ] Export analytics as PDF/CSV

---

## License

MIT © 2024 Nova Chatbot Project
