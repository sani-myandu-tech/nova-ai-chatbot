/**
 * Nova Chatbot — Test Suite
 * Tests: chat engine, response matching, edge cases, analytics
 */

const { getResponse, getAnalytics } = require('../backend/utils/chatEngine');

// ── 1. Chat Engine — Known Intent Tests ──────────────────────────────────────

describe('Chat Engine — Response Matching', () => {

  // Greetings
  test('responds to "hello"', () => {
    const r = getResponse('hello');
    expect(r.response).toBeTruthy();
    expect(r.category).toBe('greeting');
    expect(r.confidence).toBeGreaterThan(0);
  });

  test('responds to "hi there"', () => {
    const r = getResponse('hi there');
    expect(r.category).toBe('greeting');
  });

  test('responds to "good morning"', () => {
    const r = getResponse('good morning');
    expect(r.category).toBe('greeting');
  });

  // Farewells
  test('responds to "bye"', () => {
    const r = getResponse('bye');
    expect(r.category).toBe('farewell');
  });

  test('responds to "goodbye"', () => {
    const r = getResponse('goodbye');
    expect(r.category).toBe('farewell');
  });

  // Identity
  test('responds to "who are you"', () => {
    const r = getResponse('who are you');
    expect(r.response).toContain('Nova');
    expect(r.category).toBe('identity');
  });

  test('responds to "what is your name"', () => {
    const r = getResponse('what is your name');
    expect(r.response.toLowerCase()).toContain('nova');
  });

  // Capabilities
  test('responds to "what can you do"', () => {
    const r = getResponse('what can you do');
    expect(r.category).toBe('capabilities');
    expect(r.response.length).toBeGreaterThan(50);
  });

  // Technology topics
  test('responds to "tell me about javascript"', () => {
    const r = getResponse('tell me about javascript');
    expect(r.category).toBe('tech');
  });

  test('responds to "explain nodejs"', () => {
    const r = getResponse('explain nodejs');
    expect(r.category).toBe('tech');
  });

  test('responds to "what is cloud deployment"', () => {
    const r = getResponse('what is cloud deployment');
    expect(r.category).toBe('cloud');
  });

  test('responds to AI question', () => {
    const r = getResponse('tell me about artificial intelligence');
    expect(r.category).toBe('ai');
  });

  test('responds to security question', () => {
    const r = getResponse('web security tips');
    expect(r.category).toBe('security');
  });

  // Fun
  test('responds to joke request', () => {
    const r = getResponse('tell me a joke');
    expect(r.category).toBe('fun');
    expect(r.response.length).toBeGreaterThan(10);
  });

  // Thanks
  test('responds to "thank you"', () => {
    const r = getResponse('thank you');
    expect(r.category).toBe('positive');
  });

  // Help
  test('responds to "help"', () => {
    const r = getResponse('help');
    expect(r.category).toBe('help');
  });
});

// ── 2. Fallback Tests ─────────────────────────────────────────────────────────

describe('Chat Engine — Fallback Handling', () => {
  test('returns fallback for unknown query', () => {
    const r = getResponse('xyzabc123 random gibberish');
    expect(r.category).toBe('fallback');
    expect(r.confidence).toBe(0);
    expect(r.response).toBeTruthy();
  });

  test('fallback response is not empty', () => {
    const r = getResponse('qwerty uiop asdf ghjkl');
    expect(r.response.length).toBeGreaterThan(10);
  });

  test('fallback still returns a string response', () => {
    const r = getResponse('supercalifragilisticexpialidocious');
    expect(typeof r.response).toBe('string');
  });
});

// ── 3. Edge Cases ─────────────────────────────────────────────────────────────

describe('Chat Engine — Edge Cases', () => {
  test('handles empty string', () => {
    const r = getResponse('');
    expect(r.response).toBeTruthy();
    expect(typeof r.response).toBe('string');
  });

  test('handles null input', () => {
    const r = getResponse(null);
    expect(r.response).toBeTruthy();
  });

  test('handles undefined input', () => {
    const r = getResponse(undefined);
    expect(r.response).toBeTruthy();
  });

  test('handles very long input (500+ chars)', () => {
    const long = 'hello '.repeat(200);
    expect(() => getResponse(long)).not.toThrow();
    const r = getResponse(long);
    expect(r.response).toBeTruthy();
  });

  test('handles all-caps input', () => {
    const r = getResponse('HELLO HOW ARE YOU');
    expect(r.category).toBeTruthy();
  });

  test('handles mixed case input', () => {
    const r = getResponse('HeLLo ThErE');
    expect(r.category).toBe('greeting');
  });

  test('handles input with special characters', () => {
    const r = getResponse('hello!!! how are you???');
    expect(() => getResponse('hello!!! how are you???')).not.toThrow();
  });

  test('handles numbers in input', () => {
    const r = getResponse('12345');
    expect(typeof r.response).toBe('string');
  });

  test('handles emojis in input', () => {
    const r = getResponse('hello 👋 how are you');
    expect(typeof r.response).toBe('string');
  });

  test('handles single character input', () => {
    const r = getResponse('h');
    expect(typeof r.response).toBe('string');
  });
});

// ── 4. Response Quality Tests ─────────────────────────────────────────────────

describe('Chat Engine — Response Quality', () => {
  test('response is always a string', () => {
    const inputs = ['hello', 'bye', 'help', 'xyz', '', null];
    inputs.forEach(input => {
      const r = getResponse(input);
      expect(typeof r.response).toBe('string');
    });
  });

  test('response is never empty', () => {
    const inputs = ['hello', 'bye', 'what is nodejs', 'tell me a joke', 'abc xyz 123'];
    inputs.forEach(input => {
      const r = getResponse(input);
      expect(r.response.trim().length).toBeGreaterThan(0);
    });
  });

  test('confidence is a number between 0 and 100', () => {
    const r = getResponse('hello');
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(100);
  });

  test('category is always a string', () => {
    const r = getResponse('tell me about AI');
    expect(typeof r.category).toBe('string');
  });

  test('matched response has confidence > 0', () => {
    const r = getResponse('hello');
    expect(r.confidence).toBeGreaterThan(0);
  });

  test('fallback has confidence of 0', () => {
    const r = getResponse('flurgleborg snazzwick tremblox vunderplix');
    expect(r.confidence).toBe(0);
    expect(r.category).toBe('fallback');
  });
});

// ── 5. Analytics Tests ────────────────────────────────────────────────────────

describe('Analytics', () => {
  test('getAnalytics returns an object', () => {
    const a = getAnalytics();
    expect(typeof a).toBe('object');
  });

  test('analytics has required fields', () => {
    const a = getAnalytics();
    expect(a).toHaveProperty('totalMessages');
    expect(a).toHaveProperty('matchedResponses');
    expect(a).toHaveProperty('fallbackCount');
    expect(a).toHaveProperty('matchRate');
    expect(a).toHaveProperty('topQueries');
    expect(a).toHaveProperty('categoryBreakdown');
    expect(a).toHaveProperty('knowledgeBaseSize');
  });

  test('knowledge base size is greater than 0', () => {
    const a = getAnalytics();
    expect(a.knowledgeBaseSize).toBeGreaterThan(0);
  });

  test('match rate is a number 0-100', () => {
    const a = getAnalytics();
    expect(a.matchRate).toBeGreaterThanOrEqual(0);
    expect(a.matchRate).toBeLessThanOrEqual(100);
  });

  test('topQueries is an array', () => {
    const a = getAnalytics();
    expect(Array.isArray(a.topQueries)).toBe(true);
  });

  test('analytics updates after a message', () => {
    const before = getAnalytics().totalMessages;
    getResponse('hello');
    const after = getAnalytics().totalMessages;
    expect(after).toBeGreaterThan(before);
  });
});
