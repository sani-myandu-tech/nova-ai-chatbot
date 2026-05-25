/**
 * chat.js — Nova chatbot frontend
 * Handles messaging, typing animation, history, analytics, and UI state.
 */

const API = '/api/chat';

let sessionId = localStorage.getItem('nova_session') || null;
let isWaiting = false;
let totalMessages = 0;
let sidebarOpen = window.innerWidth > 700;

// ── DOM refs ───────────────────────────────────────────────────
const messagesArea = document.getElementById('messagesArea');
const userInput    = document.getElementById('userInput');
const sendBtn      = document.getElementById('sendBtn');
const charCount    = document.getElementById('charCount');
const sidebarMsgs  = document.getElementById('sidebarMsgs');

// ── Init ───────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderWelcome();
  updateSidebar();

  userInput.addEventListener('input', onInputChange);
  userInput.addEventListener('keydown', onKeyDown);
});

function renderWelcome() {
  messagesArea.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-icon"><i class="bi bi-robot"></i></div>
      <div class="welcome-title">Hi, I'm Nova 👋</div>
      <div class="welcome-sub">
        Your AI-powered assistant. Ask me about technology, programming, cloud computing, or just chat — I'm here for it all.
      </div>
    </div>`;
}

// ── Input handling ─────────────────────────────────────────────
function onInputChange() {
  const val = userInput.value;
  const len = val.length;
  charCount.textContent = `${len}/500`;
  charCount.style.color = len > 450 ? 'var(--danger)' : 'var(--text-3)';
  sendBtn.disabled = val.trim().length === 0 || isWaiting;

  // Auto-resize textarea
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

function onKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) sendMessage();
  }
}

// ── Send message ───────────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isWaiting) return;

  // Clear welcome card on first message
  const welcome = messagesArea.querySelector('.welcome-card');
  if (welcome) welcome.remove();

  // Append user bubble
  appendMessage('user', text);

  // Clear input
  userInput.value = '';
  userInput.style.height = 'auto';
  charCount.textContent = '0/500';
  sendBtn.disabled = true;
  isWaiting = true;
  totalMessages++;
  updateSidebar();

  // Show typing indicator
  const typingId = showTyping();

  try {
    const res = await fetch(`${API}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId }),
    });

    const data = await res.json();

    // Simulate natural typing delay
    await delay(data.data?.typingDelay || 600);
    removeTyping(typingId);

    if (data.success) {
      sessionId = data.data.sessionId;
      localStorage.setItem('nova_session', sessionId);
      appendMessage('bot', data.data.response, data.data.category, data.data.confidence);
      totalMessages++;
      updateSidebar();
    } else {
      appendMessage('bot', `⚠️ ${data.message || 'Something went wrong. Please try again.'}`, 'error');
    }
  } catch (err) {
    removeTyping(typingId);
    appendMessage('bot', '⚠️ Network error. Please check your connection and try again.', 'error');
  } finally {
    isWaiting = false;
    sendBtn.disabled = userInput.value.trim().length === 0;
    userInput.focus();
  }
}

// ── Append message bubble ──────────────────────────────────────
function appendMessage(role, text, category = null, confidence = null) {
  const isUser = role === 'user';
  const now = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

  const row = document.createElement('div');
  row.className = `msg-row ${isUser ? 'user' : 'bot'}`;

  const avatar = `
    <div class="msg-avatar ${isUser ? 'user-av' : 'bot-av'}">
      <i class="bi bi-${isUser ? 'person-fill' : 'robot'}"></i>
    </div>`;

  const formattedText = formatMessage(text);

  const categoryBadge = (!isUser && category && category !== 'fallback' && category !== 'error')
    ? `<span class="category-badge">${categoryIcon(category)} ${category}</span>` : '';

  row.innerHTML = `
    ${avatar}
    <div class="msg-content">
      <div class="bubble ${isUser ? 'user-bubble' : 'bot-bubble'}">${formattedText}</div>
      ${categoryBadge}
      <span class="msg-time">${now}</span>
    </div>`;

  messagesArea.appendChild(row);
  scrollToBottom();
}

// ── Format message text (basic markdown) ──────────────────────
function formatMessage(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--surface-3);padding:.1em .4em;border-radius:4px;font-size:.85em;">$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function categoryIcon(cat) {
  const icons = {
    greeting: '👋', farewell: '👋', smalltalk: '💬', identity: '🤖',
    capabilities: '⚡', tech: '💻', cloud: '☁️', ai: '🧠', security: '🔐',
    general: '🌐', utility: '🕐', fun: '😄', positive: '😊', help: '💡',
    meta: '🔧', affirmation: '✅', negation: '❌',
  };
  return icons[cat] || '💬';
}

// ── Typing indicator ───────────────────────────────────────────
function showTyping() {
  const id = 'typing-' + Date.now();
  const row = document.createElement('div');
  row.className = 'typing-row'; row.id = id;
  row.innerHTML = `
    <div class="msg-avatar bot-av"><i class="bi bi-robot"></i></div>
    <div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  messagesArea.appendChild(row);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

// ── Utility ────────────────────────────────────────────────────
function scrollToBottom() {
  messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

function updateSidebar() {
  sidebarMsgs.textContent = totalMessages;
}

// ── View switching ─────────────────────────────────────────────
function setView(name) {
  document.getElementById('viewChat').style.display      = name === 'chat' ? 'flex' : 'none';
  document.getElementById('viewAnalytics').style.display = name === 'analytics' ? 'flex' : 'none';
  document.getElementById('btnChat').classList.toggle('active', name === 'chat');
  document.getElementById('btnAnalytics').classList.toggle('active', name === 'analytics');

  if (name === 'analytics') loadAnalytics();
  if (name === 'chat') userInput.focus();
}

// ── Sidebar toggle (mobile) ────────────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (window.innerWidth <= 700) {
    sb.classList.toggle('mobile-open');
  } else {
    sb.classList.toggle('collapsed');
  }
}

// ── Inject prompt from topic chips ────────────────────────────
function injectPrompt(text) {
  userInput.value = text;
  onInputChange();
  userInput.focus();
  if (window.innerWidth <= 700) {
    document.getElementById('sidebar').classList.remove('mobile-open');
  }
}

// ── Clear chat ─────────────────────────────────────────────────
async function clearChat() {
  if (sessionId) {
    try {
      await fetch(`${API}/history/${sessionId}`, { method: 'DELETE' });
    } catch {}
  }
  messagesArea.innerHTML = '';
  totalMessages = 0;
  updateSidebar();
  renderWelcome();
}

// ── Export chat ────────────────────────────────────────────────
function exportChat() {
  const bubbles = messagesArea.querySelectorAll('.bubble');
  if (bubbles.length === 0) { alert('No messages to export.'); return; }

  const lines = [];
  const rows = messagesArea.querySelectorAll('.msg-row');
  rows.forEach(row => {
    const role = row.classList.contains('user') ? 'You' : 'Nova';
    const text = row.querySelector('.bubble')?.innerText || '';
    const time = row.querySelector('.msg-time')?.innerText || '';
    lines.push(`[${time}] ${role}: ${text}`);
  });

  const blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `nova-chat-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
}

// ── Analytics ──────────────────────────────────────────────────
async function loadAnalytics() {
  const grid = document.getElementById('analyticsGrid');
  grid.innerHTML = '<div style="color:var(--text-3);font-size:.85rem;padding:1rem;">Loading analytics…</div>';

  try {
    const res = await fetch(`${API}/analytics`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const d = data.data;
    const matchRateColor = d.matchRate >= 70 ? 'var(--accent)' : d.matchRate >= 40 ? 'var(--warning)' : 'var(--danger)';

    grid.innerHTML = `
      <!-- Stat cards -->
      <div class="analytics-card">
        <div class="ac-label">Total Messages</div>
        <div class="ac-value">${d.totalMessages.toLocaleString()}</div>
        <div class="ac-sub">All-time interactions</div>
      </div>
      <div class="analytics-card">
        <div class="ac-label">Match Rate</div>
        <div class="ac-value" style="color:${matchRateColor}">${d.matchRate}%</div>
        <div class="ac-sub">Queries answered by knowledge base</div>
      </div>
      <div class="analytics-card">
        <div class="ac-label">Sessions</div>
        <div class="ac-value">${d.sessionCount.toLocaleString()}</div>
        <div class="ac-sub">${d.activeSessions} currently active</div>
      </div>
      <div class="analytics-card">
        <div class="ac-label">Knowledge Base</div>
        <div class="ac-value">${d.knowledgeBaseSize}</div>
        <div class="ac-sub">Intent patterns loaded</div>
      </div>
      <div class="analytics-card">
        <div class="ac-label">Uptime</div>
        <div class="ac-value">${d.uptimeHours}h</div>
        <div class="ac-sub">Since ${new Date(d.startTime).toLocaleString()}</div>
      </div>
      <div class="analytics-card">
        <div class="ac-label">Fallback Responses</div>
        <div class="ac-value" style="color:var(--warning)">${d.fallbackCount}</div>
        <div class="ac-sub">Unmatched queries</div>
      </div>

      <!-- Category breakdown -->
      <div class="analytics-card full">
        <div class="ac-label" style="margin-bottom:.85rem">Response Categories</div>
        ${d.categoryBreakdown.length === 0
          ? '<div style="color:var(--text-3);font-size:.8rem">No data yet — start chatting!</div>'
          : d.categoryBreakdown.map((c, i) => {
              const pct = d.matchedResponses > 0 ? Math.round((c.count / d.matchedResponses) * 100) : 0;
              return `<div class="ac-bar-row">
                <div class="ac-bar-label">
                  <span>${categoryIcon(c.category)} ${c.category}</span>
                  <span>${c.count} (${pct}%)</span>
                </div>
                <div class="ac-bar-track">
                  <div class="ac-bar-fill" style="width:${pct}%"></div>
                </div>
              </div>`;
            }).join('')
        }
      </div>

      <!-- Top queries -->
      <div class="analytics-card full">
        <div class="ac-label" style="margin-bottom:.85rem">Top Queries</div>
        ${d.topQueries.length === 0
          ? '<div style="color:var(--text-3);font-size:.8rem">No data yet.</div>'
          : d.topQueries.map((q, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.8rem;">
              <span style="color:var(--text-2)">${i + 1}. "${q.query}…"</span>
              <span style="color:var(--accent);font-family:var(--font-display);font-weight:700">${q.count}×</span>
            </div>`).join('')
        }
      </div>`;
  } catch (e) {
    grid.innerHTML = `<div style="color:var(--danger);font-size:.85rem;padding:1rem;">Failed to load analytics: ${e.message}</div>`;
  }
}

function categoryIcon(cat) {
  const icons = {
    greeting: '👋', farewell: '👋', smalltalk: '💬', identity: '🤖',
    capabilities: '⚡', tech: '💻', cloud: '☁️', ai: '🧠', security: '🔐',
    general: '🌐', utility: '🕐', fun: '😄', positive: '😊', help: '💡',
    meta: '🔧', affirmation: '✅', negation: '❌', fallback: '🤔',
  };
  return icons[cat] || '💬';
}
