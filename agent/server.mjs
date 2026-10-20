import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function createAgent({ env = process.env, fetchModel = fetch, knowledge } = {}) {
  knowledge ??= JSON.parse(await readFile(new URL('../dist/agent-knowledge.json', import.meta.url), 'utf8'));
  const origins = (env.ALLOWED_ORIGINS || 'https://tomasferrer.com,https://www.tomasferrer.com').split(',').map(value => value.trim());
  const foundation = await readFile(new URL('./prompt.txt', import.meta.url), 'utf8');
  const instructions = `${foundation}\nPUBLIC PROFILE:\n${JSON.stringify(knowledge)}`;
  let windowStart = Date.now(), requests = 0, active = 0;
  const limit = Number(env.DAILY_REQUEST_LIMIT || 200);
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('DAILY_REQUEST_LIMIT must be a positive integer');

  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, data) => { res.writeHead(status); res.end(JSON.stringify(data)); };
    if (req.url === '/health' && req.method === 'GET') return send(200, { ready: Boolean(env.GEMINI_API_KEY) });
    if (req.url !== '/chat') return send(404, { error: 'Not found' });
    if (!origins.includes(req.headers.origin)) return send(403, { error: 'Origin not allowed' });
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.writeHead(204); return res.end();
    }
    if (req.method !== 'POST') return send(405, { error: 'Use POST' });
    if (!env.GEMINI_API_KEY) return send(503, { error: 'The AI guide is not available yet. Please contact hello@tferrer.com.' });
    if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: 'Use JSON' });
    if (Date.now() - windowStart >= 86_400_000) { windowStart = Date.now(); requests = 0; }
    if (requests >= limit || active >= 2) return send(429, { error: 'The guide is busy. Please try again later or contact hello@tferrer.com.' });
    active++;
    try {
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16_384) { send(413, { error: 'Message is too large' }); return; }
        chunks.push(chunk);
      }
      let messages;
      try { ({ messages } = JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { return send(400, { error: 'Invalid JSON' }); }
      if (!Array.isArray(messages) || !messages.length || messages.length > 10 || messages.at(-1)?.role !== 'user' ||
        messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim() || m.content.length > 1500)) {
        return send(400, { error: 'Send up to 10 messages, each between 1 and 1500 characters, ending with a question.' });
      }
      if (requests >= limit) return send(429, { error: 'The daily question limit has been reached. Please contact hello@tferrer.com.' });
      requests++;
      const model = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
      const response = await fetchModel(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instructions }] },
          contents: messages.map(({ role, content }) => ({ role: role === 'assistant' ? 'model' : 'user', parts: [{ text: content }] })),
          generationConfig: { maxOutputTokens: 500, thinkingConfig: { thinkingLevel: 'MINIMAL' } },
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (response.status === 429) return send(429, { error: 'The guide has reached its Gemini quota. Please try again later or contact hello@tferrer.com.' });
      if (!response.ok) return send(502, { error: 'The AI guide is temporarily unavailable. Please try again later.' });
      const result = await response.json();
      const candidate = result.candidates?.[0];
      const answer = candidate?.finishReason === 'STOP'
        ? candidate.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('\n').trim()
        : '';
      if (!answer) return send(502, { error: 'No answer was returned. Please try again.' });
      send(200, { answer, sources: knowledge.sources });
    } catch {
      if (!res.headersSent) send(502, { error: 'The AI guide could not respond. Please try again later.' });
    } finally { active--; }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = await createAgent();
  server.requestTimeout = 30_000;
  server.listen(Number(process.env.PORT || 8080), '0.0.0.0', () => console.log('Profile agent listening'));
}
