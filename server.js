const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { WebSocketServer } = require('ws');
const { GoogleGenAI, Modality } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ── Gemini Client (Live API) ──
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for Live API.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return aiClient;
}

// ── Sentiment Analysis ──
function analyzeSentiment(text) {
  const lowercase = text.toLowerCase();
  const confusedWords = ["don't understand","do not understand","dont understand","not sure","confused","cannot get","cant get","difficult","hard","stuck","doubt","explain again","unclear","lost","struggling","help","confusing","అర్థం కాలేదు","కష్టంగా ఉంది","సందేహం","తెలియదు","మళ్ళీ చెప్పండి","కన్ఫ్యూజ్","ardham raledu","artham kaledu","kashtanga undi","malli cheppandi","samajh nahi","mushkil","kathin","shanka","phirse","phir se","pareshani","confuse","sandeha"];
  const positiveWords = ["understand","got it","easy","awesome","perfect","clear","great","wow","fantastic","amazing","makes sense","thank you","thanks","excellent","brilliant","అర్థమైంది","సులభంగా ఉంది","చాలా బాగుంది","థాంక్స్","సూపర్","అవును","ardhamaindi","sulabhanga undi","chala bagundi","samajh gaya","samajh gya","aasan","saral","badhiya","bahut achha","clear hai","dhanyawad","shukriya"];
  const curiousWords = ["what is","how do","tell me about","why is","curious","interested","learn","know","question","ఏమిటి","ఎలా","ఎందుకు","తెలుసుకోవాలి","emiti","ela","enduku","telusukovali","kya hai","kaise","kyun","jaan na"];
  let confusedCount = 0, positiveCount = 0, curiousCount = 0;
  for (const w of confusedWords) { if (lowercase.includes(w)) confusedCount++; }
  for (const w of positiveWords) { if (lowercase.includes(w)) positiveCount++; }
  for (const w of curiousWords) { if (lowercase.includes(w)) curiousCount++; }
  if (confusedCount > positiveCount && confusedCount >= curiousCount) {
    return { label: 'Struggling / Confused', score: -0.6, color: 'text-amber-500', emoji: '\uD83D\uDE1F' };
  } else if (positiveCount > confusedCount && positiveCount >= curiousCount) {
    return { label: 'Happy / Confident', score: 0.8, color: 'text-emerald-500', emoji: '\uD83D\uDE0A' };
  } else if (curiousCount > confusedCount && curiousCount > positiveCount) {
    return { label: 'Curious / Inquisitive', score: 0.4, color: 'text-blue-500', emoji: '\uD83E\uDD14' };
  }
  return { label: 'Calm / Conversational', score: 0.0, color: 'text-slate-500', emoji: '\uD83D\uDE10' };
}

// ── Existing Gemin REST API endpoint ──
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
            const unit = match[2].toLowerCase();
            waitTime = unit === 'ms' ? value + 200 : (value * 1000) + 1500;
            console.log(`[Backend] Parsed rate limit wait time from Google: ${waitTime}ms`);
          }
        }
        console.warn(`[Backend] Transient error (${response.status}) hit. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        delay *= 1.5;
        continue;
      }

      return { response, data };
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`[Backend] Network error occurred. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5;
    }
  }
  throw new Error('Max retries exceeded');
}

app.post('/api/gemini', async (req, res) => {
  const { system, user, agentIndex } = req.body;
  const idx = typeof agentIndex === 'number' ? agentIndex : 0;

  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4
  ];
  const activeKey = keys[idx] || process.env.GEMINI_API_KEY;

  console.log(`[Backend] Incoming request (Agent ${idx}). System Prompt Length: ${system ? system.length : 0}, User Prompt: "${user ? user.slice(0, 100) : ''}..."`);

  if (!activeKey) {
    console.error(`[Backend] Error: Gemini API key for agent ${idx} is not set`);
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  if (!user) {
    return res.status(400).json({ error: 'User message is required.' });
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
          generationConfig: { temperature: 0.72, maxOutputTokens: 8192 }
        })
      }
    );

    if (data.error) {
      console.error('[Backend] Google API Error:', data.error.message);
      return res.status(response.status || 500).json({ error: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`[Backend] Response success. Generated Text Length: ${text.length}. Preview: "${text.slice(0, 200)}..."`);
    res.json({ text });
  } catch (error) {
    console.error('Error in /api/gemini:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// ── WebSocket Server (Gemini Live API) ──
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    if (pathname === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch {
    socket.destroy();
  }
});

wss.on('connection', async (clientWs, request) => {
  console.log('[WS] Client connected');
  const reqUrl = new URL(request.url || '', `http://${request.headers.host}`);
  const language = reqUrl.searchParams.get('language') || 'all';
  const subject = reqUrl.searchParams.get('subject') || 'all';
  console.log(`[WS] Language=${language}, Subject=${subject}`);

  let systemInstruction =
    'You are a friendly, patient, and highly expert academic tutor supporting school students. ' +
    'Your goal is to guide students and encourage their curiosity. ' +
    'Keep answers extremely conversational and concise (usually strictly 1 to 3 sentences maximum) so that it is easy and comfortable to listen to of the speech delivery. ' +
    'Do not output long formulas or dense blocks of texts. Break it down or offer to explain details when they ask. ';

  if (language === 'telugu') {
    systemInstruction += 'You must speak in Telugu only (unless referring to specific scientific/mathematical English terms). Frame your explanations sweetly in Telugu.';
  } else if (language === 'hindi') {
    systemInstruction += 'You must speak in Hindi. Use simple, easily understandable Hindi terms with a helpful academic tutoring style.';
  } else if (language === 'english') {
    systemInstruction += 'Please speak in clear, expressive English. Keep explanations simplified and kid-friendly.';
  } else {
    systemInstruction += 'You are multilingual. Support Telugu, Hindi, and English. Respond in the exact language the student speaks to you, or blend them naturally if they use a blend.';
  }

  if (subject === 'math') {
    systemInstruction += ' Currently helping with Mathematics! Help explain concepts like addition, fractions, algebra, or geometry using simple physical analogies.';
  } else if (subject === 'science') {
    systemInstruction += ' Currently helping with Science! Help explain concepts like gravity, photosynthesis, planets, or animals with fun, exciting facts.';
  } else if (subject === 'languages') {
    systemInstruction += ' Currently helping with Languages & Reading! Help expand vocabulary, teach correct grammar, or guide reading comprehensions with interesting sentences.';
  } else {
    systemInstruction += ' You are ready to tutor on any academic school subject: math, science, history, geography, languages, or reading.';
  }

  let geminiSession = null;
  try {
    clientWs.send(JSON.stringify({ type: 'status', message: 'Establishing low-latency connection to Gemini...' }));
    const ai = getGeminiClient();
    geminiSession = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      callbacks: {
        onmessage: (message) => {
          const content = message.serverContent;
          if (!content) return;
          const parts = content.modelTurn?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              clientWs.send(JSON.stringify({ type: 'audio', data: part.inlineData.data }));
            }
          }
          if (content.outputTranscription?.text) {
            clientWs.send(JSON.stringify({ type: 'agent-transcription', text: content.outputTranscription.text }));
          }
          if (content.interrupted) {
            console.log('[Gemini Live] Response interrupted');
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
          if (content.inputTranscription?.text?.trim()) {
            const userText = content.inputTranscription.text;
            console.log(`[Gemini Live User Speech]: ${userText}`);
            const sentiment = analyzeSentiment(userText);
            clientWs.send(JSON.stringify({ type: 'user-transcription', text: userText, sentiment }));
          }
        },
        onclose: (event) => {
          console.log('[Gemini Live] Session closed');
          clientWs.send(JSON.stringify({ type: 'status', message: 'Tutor connection closed.' }));
        },
        onerror: (error) => {
          console.error('[Gemini Live] Session error:', error);
          clientWs.send(JSON.stringify({ type: 'error', message: 'An education session error occurred. Retrying...' }));
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
        systemInstruction,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
    });

    console.log('[WS] Connected with Gemini Live API');
    clientWs.send(JSON.stringify({ type: 'status', message: 'Tutor is ready! Ask your academic questions.' }));
  } catch (err) {
    console.error('[WS] Failed connecting to Gemini Live API:', err);
    clientWs.send(JSON.stringify({ type: 'error', message: `Tutoring setup failed: ${err.message || err}` }));
    clientWs.close();
    return;
  }

  clientWs.on('message', (messageBuffer) => {
    try {
      const msg = JSON.parse(messageBuffer.toString());
      if (msg.type === 'audio' && msg.data) {
        if (geminiSession) {
          geminiSession.sendRealtimeInput({
            audio: { data: msg.data, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      }
    } catch (err) {
      console.error('[WS] Error forwarding audio message:', err);
    }
  });

  clientWs.on('close', () => {
    console.log('[WS] Client disconnected');
    if (geminiSession) {
      try { geminiSession.close(); } catch (e) { console.error('[WS] Error closing Gemini session:', e); }
    }
  });
});

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT} (HTTP + WebSocket)`);
  });
}

module.exports = app;
