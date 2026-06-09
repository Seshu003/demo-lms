import { NextResponse } from 'next/server';

// ── fetchWithRetry (server-side only) ─────────────────
async function fetchWithRetry(url, options, retries = 15, initialDelay = 2000) {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.status === 429 || response.status === 503) {
        console.log(`[Backend] Transient error response body:`, JSON.stringify(data));
        let waitTime = delay;
        if (data.error && data.error.message) {
          const match = data.error.message.match(/Please retry in (\d+\.?\d*)(m?s)/i);
          if (match) {
            const value = parseFloat(match[1]);
            const unit  = match[2].toLowerCase();
            waitTime = unit === 'ms' ? value + 200 : (value * 1000) + 1500;
            console.log(`[Backend] Parsed rate limit wait time from Google: ${waitTime}ms`);
          }
        }
        console.warn(`[Backend] Transient error (${response.status}). Retrying in ${waitTime}ms... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        delay *= 1.5;
        continue;
      }

      return { response, data };
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`[Backend] Network error. Retrying in ${delay}ms... (${i + 1}/${retries})`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5;
    }
  }
  throw new Error('Max retries exceeded');
}

// ── POST /api/gemini ──────────────────────────────────
export async function POST(request) {
  const { system, user, agentIndex } = await request.json();
  const idx = typeof agentIndex === 'number' ? agentIndex : 0;

  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ];
  const activeKey = keys[idx] || process.env.GEMINI_API_KEY;

  console.log(`[Backend] Incoming request (Agent ${idx}). System Prompt Length: ${system ? system.length : 0}, User Prompt: "${user ? user.slice(0, 100) : ''}..."`);

  if (!activeKey) {
    console.error(`[Backend] Error: Gemini API key for agent ${idx} is not set`);
    return NextResponse.json(
      { error: 'Gemini API key is not configured on the server.' },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: 'User message is required.' },
      { status: 400 }
    );
  }

  try {
    const { response, data } = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${activeKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: user }] }],
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          generationConfig: { temperature: 0.72, maxOutputTokens: 8192 },
        }),
      }
    );

    if (data.error) {
      console.error('[Backend] Google API Error:', data.error.message);
      return NextResponse.json(
        { error: data.error.message },
        { status: response.status || 500 }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`[Backend] Response success. Generated Text Length: ${text.length}. Preview: "${text.slice(0, 200)}..."`);
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in /api/gemini:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
