import {
  Target, Layers, Zap, Lightbulb,
  HelpCircle, AlignLeft, FlipHorizontal
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────
export const T = {
  bg: "#07080F", s1: "#0C0F1C", s2: "#111827", s3: "#182033",
  border: "rgba(255,255,255,0.07)", accent: "#5B8CF8", green: "#22C5A0",
  purple: "#9B6EF8", amber: "#F5A95B", red: "#F55B6B",
  text: "#DDE3F2", muted: "#647298", dim: "#3A4560",
};

// ── Course data ───────────────────────────────────────
export const COURSE = {
  title: "Python Fundamentals", tagline: "From zero to Python hero in 5 structured modules",
  modules: [
    {
      id: "m1", title: "Getting Started", emoji: "\uD83D\uDE80", accent: T.accent, lessons: [
        {
          id: "l1", title: "What is Python?", dur: "10 min", vid: "rfscVS0vtbw",
          overview: "Python is a versatile, high-level interpreted language known for clean readable syntax. Created by Guido van Rossum in 1991, now one of the world's most popular languages.",
          pts: ["Interpreted \u2014 runs line by line", "Dynamically typed \u2014 no declarations needed", "Cross-platform: Windows, Mac, Linux", "400,000+ packages on PyPI"]
        },
        {
          id: "l2", title: "Variables & Data Types", dur: "14 min", vid: "_uQrJ0TkZlc",
          overview: "Variables store data values. Python creates them on assignment \u2014 no declaration needed. Core types: int, float, str, bool, NoneType.",
          pts: ["x = 10 creates an integer variable", "type() reveals the data type", "Python is dynamically typed", "None represents absence of value"]
        },
        {
          id: "l3", title: "Strings", dur: "16 min", vid: "k9TUPpljqLs",
          overview: "Strings are immutable sequences of characters. They support slicing, f-strings for formatting, and dozens of built-in methods.",
          pts: ["f-strings: f\"Hello {name}\"", "Slicing: s[0:5] gets first 5 chars", ".upper(), .lower(), .strip(), .split()", "len() returns string length"]
        },
      ]
    },
    {
      id: "m2", title: "Control Flow", emoji: "\uD83D\uDD00", accent: T.green, lessons: [
        {
          id: "l4", title: "If / Elif / Else", dur: "13 min", vid: "DZwmZ8Usvnk",
          overview: "Conditional statements let you branch code execution based on truth conditions. Python uses indentation to define code blocks.",
          pts: ["Indentation defines the block", "==, !=, <, >, <=, >= comparisons", "and, or, not logical operators", "Ternary: x if cond else y"]
        },
        {
          id: "l5", title: "For Loops", dur: "18 min", vid: "6iF8Xb7Z3wQ",
          overview: "For loops iterate over any iterable \u2014 lists, strings, ranges, dicts. Combined with enumerate() and zip() they're extremely powerful.",
          pts: ["range(5) generates 0,1,2,3,4", "enumerate() adds an index", "zip() pairs two iterables", "List comprehensions: [x*2 for x in lst]"]
        },
        {
          id: "l6", title: "While Loops", dur: "11 min", vid: "n1dpPT2EHRg",
          overview: "While loops run as long as a condition remains True. Always ensure the loop terminates to avoid infinite loops.",
          pts: ["while condition: block", "break exits immediately", "continue skips to next iteration", "while True: + break pattern"]
        },
      ]
    },
    {
      id: "m3", title: "Functions", emoji: "\u2699\uFE0F", accent: T.amber, lessons: [
        {
          id: "l7", title: "Defining Functions", dur: "20 min", vid: "9Os0o3wzS_I",
          overview: "Functions are reusable named code blocks. def creates them. They help avoid repetition and keep programs organized and testable.",
          pts: ["def function_name(params):", "return sends back a value", "Docstrings document the function", "Functions are first-class objects"]
        },
        {
          id: "l8", title: "*args & **kwargs", dur: "17 min", vid: "tuVd3qC9P2c",
          overview: "*args captures any number of positional arguments as a tuple. **kwargs captures keyword arguments as a dict. Essential for flexible APIs.",
          pts: ["Default values: def f(x, y=10)", "*args: variable positional args", "**kwargs: variable keyword args", "Order: regular \u2192 *args \u2192 **kwargs"]
        },
        {
          id: "l9", title: "Lambda & map/filter", dur: "15 min", vid: "Sv9ZXMGbhTQ",
          overview: "Lambda creates anonymous one-line functions. map(), filter(), and sorted(key=) are higher-order functions that accept other functions.",
          pts: ["lambda x: x*2 is anonymous", "map(func, iterable) transforms each", "filter(func, iterable) keeps True items", "sorted(lst, key=lambda x: x[1])"]
        },
      ]
    },
    {
      id: "m4", title: "Data Structures", emoji: "\uD83D\uDCE6", accent: T.purple, lessons: [
        {
          id: "l10", title: "Lists", dur: "22 min", vid: "W8KRzm-HUcc",
          overview: "Lists are ordered, mutable sequences \u2014 Python's most versatile structure. They hold any type and support slicing, sorting, and comprehensions.",
          pts: ["lst.append(x) adds to end", "lst.pop() removes last item", "lst[1:4] slices elements", "Nested lists for 2D structures"]
        },
        {
          id: "l11", title: "Dictionaries", dur: "20 min", vid: "daefaLgNkw0",
          overview: "Dicts store key-value pairs. Python 3.7+ maintains insertion order. Perfect for structured data, configs, and counting.",
          pts: ["d['key'] = value to set/update", "d.get('key', default) is safe", "keys(), values(), items() methods", "Dict comprehensions: {k:v for ...}"]
        },
        {
          id: "l12", title: "Tuples & Sets", dur: "16 min", vid: "TxS2HGRLSPs",
          overview: "Tuples are immutable lists. Sets are unordered collections of unique elements \u2014 great for deduplication and fast membership testing.",
          pts: ["Tuples: (x, y) \u2014 immutable", "Sets: {1, 2, 3} \u2014 unique only", "union(), intersection(), difference()", "frozenset is an immutable set"]
        },
      ]
    },
    {
      id: "m5", title: "OOP", emoji: "\uD83C\uDFD7\uFE0F", accent: T.red, lessons: [
        {
          id: "l13", title: "Classes & Objects", dur: "25 min", vid: "ZDa-Z5JzLYM",
          overview: "A class is a blueprint; objects are instances. OOP bundles data (attributes) with behavior (methods), modeling real-world entities.",
          pts: ["class MyClass: defines a class", "__init__ is the constructor", "self refers to the instance", "Attributes store per-instance data"]
        },
        {
          id: "l14", title: "Inheritance", dur: "22 min", vid: "RSl87lqOXDE",
          overview: "Inheritance lets a subclass reuse and extend a parent class. Models 'is-a' relationships and promotes code reuse.",
          pts: ["class Dog(Animal): inherits Animal", "super().__init__() calls parent", "Override methods to customize", "isinstance() checks the hierarchy"]
        },
        {
          id: "l15", title: "Dunder Methods", dur: "18 min", vid: "3ohzBxoFHAY",
          overview: "Special 'dunder' methods customize built-in operations on objects \u2014 print(), len(), ==, +, and more.",
          pts: ["__str__ controls print(obj)", "__len__ controls len(obj)", "__eq__ controls == comparison", "__repr__ gives dev-friendly output"]
        },
      ]
    },
  ]
};

export const ALL_LESSONS = COURSE.modules.flatMap(m =>
  m.lessons.map(l => ({ ...l, moduleTitle: m.title }))
);

// ── Agent meta (no desc – used in LessonPage) ─────────
export const AGENT_META = [
  { name: "Topic Planner",    Icon: Target,    color: T.accent },
  { name: "Requirement Dev",  Icon: Layers,    color: T.green  },
  { name: "Output Optimizer", Icon: Zap,       color: T.amber  },
  { name: "Theory Explainer", Icon: Lightbulb, color: T.purple },
];

// ── Agent meta (with desc – used in GeneralTutor) ─────
export const AGENT_META_FULL = [
  { name: "Topic Planner",    Icon: Target,    desc: "Mapping the concept",        color: T.accent },
  { name: "Requirement Dev",  Icon: Layers,    desc: "Building the structure",     color: T.green  },
  { name: "Output Optimizer", Icon: Zap,       desc: "Optimising for your style",  color: T.amber  },
  { name: "Theory Explainer", Icon: Lightbulb, desc: "Generating your answer",     color: T.purple },
];

// ── Tabs for GeneralTutor result view ─────────────────
export const TABS = [
  { id: "explanation", Icon: AlignLeft,    label: "Explanation"  },
  { id: "infographic", Icon: Zap,          label: "Infographic"  },
  { id: "quiz",        Icon: HelpCircle,   label: "Quiz"         },
  { id: "flashcards",  Icon: FlipHorizontal, label: "Flashcards" },
];

// ── API helper ────────────────────────────────────────
export async function geminiCall(system, user, agentIndex = 0) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, user, agentIndex }),
  });
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try { const d = await res.json(); errMsg = d.error || errMsg; } catch {}
    throw new Error(errMsg);
  }
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  return d.text || '';
}

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

// ── Build the 4-agent pipeline prompts ────────────────
function buildAgents(topic, mode, length) {
  const LEN = {
    Short:  { words: "under 120 words",  infoCount: 3, quizCount: 2, cardCount: 2 },
    Medium: { words: "150\u2013250 words",   infoCount: 4, quizCount: 3, cardCount: 3 },
    Deep:   { words: "300\u2013500 words",   infoCount: 5, quizCount: 4, cardCount: 5 },
  }[length] || { words: "150\u2013250 words", infoCount: 4, quizCount: 3, cardCount: 3 };

  const MODE_INST = {
    Beginner:  "Explain as if the reader has zero prior knowledge. Use everyday analogies. Avoid jargon; define every technical term you use.",
    Exam:      "This is exam preparation. Highlight key facts, formulas, common misconceptions, and tricky areas students get wrong. Use memory-friendly phrasing.",
    Interview: "Format for a technical interview context. Be concise and professional. Emphasise real-world use cases, trade-offs, and edge cases interviewers probe.",
    Revision:  "Quick revision mode. Assume prior knowledge. Skip basics. Focus on key distinctions, tricky edge cases, and concise mnemonics.",
  }[mode] || "";

  return [
    {
      name: "Topic Planner",
      sys: "You are a Topic Planning Agent. Analyse learning queries. Return ONLY valid JSON, no markdown, no extra text.",
      prompt: `Topic: "${topic}"\nMode: ${mode}\nLength: ${length}\n\nReturn this JSON:\n{"coreTopics":["..."],"difficulty":"...","prerequisites":["..."],"subtopics":["..."]}`,
    },
    {
      name: "Requirement Developer",
      sys: "You are a Requirement Developer Agent. Structure learning requirements based on the planning output. Return ONLY valid JSON, no markdown.",
      prompt: `Topic: "${topic}" | Mode: ${mode} | Length: ${length}\n\nReturn this JSON:\n{"keyPoints":["..."],"examples":["..."],"misconceptions":["..."],"applications":["..."]}`,
    },
    {
      name: "Output Optimizer",
      sys: "You are an Output Optimizer Agent. Choose the best explanation format. Return ONLY valid JSON, no markdown.",
      prompt: `Mode: ${mode} | Length: ${length}\n${MODE_INST}\n\nReturn this JSON:\n{"structure":"bullets|steps|narrative","tone":"casual|technical|interview","depth":"surface|thorough","emphasis":"..."}`,
    },
    {
      name: "Theory Explainer",
      sys: `You are an expert educator generating learning content.
LEARNER MODE: ${mode} \u2014 ${MODE_INST}
LENGTH RULE: Explanation must be ${LEN.words}. Generate exactly ${LEN.infoCount} infographic points, exactly ${LEN.quizCount} quiz questions, exactly ${LEN.cardCount} flashcards.
CRITICAL: Output ONLY the labelled sections below \u2014 no preamble, no markdown code fences, no asterisks, no extra commentary.`,
      prompt: `Topic: "${topic}"

Write content following EVERY rule in your system instructions, then output it in EXACTLY this format with these exact header labels:

EXPLANATION:
[your explanation \u2014 ${LEN.words}]

KEY_CONCEPT:
[one crisp sentence capturing the most important insight]

ANALOGY:
[a memorable real-world analogy]

INFOGRAPHIC_POINTS:
- [point 1]
- [point 2]
- [point 3]${LEN.infoCount >= 4 ? "\n- [point 4]" : ""}${LEN.infoCount >= 5 ? "\n- [point 5]" : ""}

QUIZ:
Q1: [question]
A) [option A] B) [option B] C) [option C] D) [option D]
Correct: [A/B/C/D]

Q2: [question]
A) [option A] B) [option B] C) [option C] D) [option D]
Correct: [A/B/C/D]${LEN.quizCount >= 3 ? `

Q3: [question]
A) [option A] B) [option B] C) [option C] D) [option D]
Correct: [A/B/C/D]` : ""}${LEN.quizCount >= 4 ? `

Q4: [question]
A) [option A] B) [option B] C) [option C] D) [option D]
Correct: [A/B/C/D]` : ""}

FLASHCARDS:
FRONT: [term or concept]
BACK: [definition or explanation]
---
FRONT: [term or concept]
BACK: [definition or explanation]${LEN.cardCount >= 3 ? `
---
FRONT: [term or concept]
BACK: [definition or explanation]` : ""}${LEN.cardCount >= 4 ? `
---
FRONT: [term or concept]
BACK: [definition or explanation]` : ""}${LEN.cardCount >= 5 ? `
---
FRONT: [term or concept]
BACK: [definition or explanation]` : ""}`,
    },
  ];
}

// ── Run the 4-agent pipeline ──────────────────────────
export async function run4Agents(topic, mode, length, onStep) {
  const agents  = buildAgents(topic, mode, length);
  const results = [];

  for (let i = 0; i < agents.length; i++) {
    onStep(i, "loading");
    try {
      let context = "";
      if (i > 0) {
        context = "\n\nContext from previous team members:\n" +
          results.map((res, idx) => `[${agents[idx].name} Output]:\n${res}`).join("\n\n");
      }
      const prompt = agents[i].prompt + context;
      const out    = await geminiCall(agents[i].sys, prompt, i);
      results.push(out);
      onStep(i, "done", out);
    } catch (err) {
      onStep(i, "error", err.message);
      throw err;
    }
  }

  return results[3]; // Theory Explainer output
}

// ── Output parser ─────────────────────────────────────
export function parseOutput(text) {
  const extract = (startLabel, endLabel) => {
    const start = text.indexOf(`${startLabel}:`);
    if (start === -1) return "";
    const contentStart = start + startLabel.length + 1;
    const end = endLabel ? text.indexOf(`\n${endLabel}:`, contentStart) : -1;
    return (end === -1 ? text.slice(contentStart) : text.slice(contentStart, end)).trim();
  };

  const explanation  = extract("EXPLANATION",        "KEY_CONCEPT");
  const keyConcept   = extract("KEY_CONCEPT",        "ANALOGY");
  const analogy      = extract("ANALOGY",            "INFOGRAPHIC_POINTS");
  const infoRaw      = extract("INFOGRAPHIC_POINTS", "QUIZ");
  const quizRaw      = extract("QUIZ",               "FLASHCARDS");
  const fcRaw        = extract("FLASHCARDS",         null);

  const infoPoints = infoRaw
    .split('\n')
    .map(l => l.replace(/^[\-•*]\s*/, '').trim())
    .filter(l => l.length > 2);

  const quizQuestions = [];
  const qBlocks = quizRaw.split(/Q\d+:/i).filter(b => b.trim());
  for (const block of qBlocks) {
    const lines   = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const question = lines[0];
    const fullBlock = lines.join(' ');
    const optMatches = [...fullBlock.matchAll(/([ABCD])\)\s*([^ABCD)]+?)(?=\s+[ABCD]\)|Correct:|$)/gi)];
    const options    = optMatches.map(m => m[2].trim()).filter(Boolean);
    const correctMatch = block.match(/Correct:\s*([ABCD])/i);
    const correct      = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;
    if (question && options.length >= 2) quizQuestions.push({ question, options, correct });
  }

  const flashcards = fcRaw
    .split(/\n---+\n?/)
    .map(card => {
      const frontMatch = card.match(/FRONT:\s*(.+?)(?=\nBACK:|$)/is);
      const backMatch  = card.match(/BACK:\s*(.+?)(?=\nFRONT:|$)/is);
      const front = frontMatch?.[1]?.trim();
      const back  = backMatch?.[1]?.trim();
      return (front && back) ? { front, back } : null;
    })
    .filter(Boolean);

  return { explanation, keyConcept, analogy, infoPoints, quizQuestions, flashcards };
}

// ── Server-side Gemini call (used in API route only) ──
export async function serverGeminiCall(system, user, agentIndex, envKeys) {
  const idx     = typeof agentIndex === 'number' ? agentIndex : 0;
  const keys    = [envKeys.KEY_1, envKeys.KEY_2, envKeys.KEY_3, envKeys.KEY_4];
  const activeKey = keys[idx] || envKeys.KEY_DEFAULT;

  if (!activeKey) {
    throw new Error('Gemini API key is not configured on the server.');
  }
  if (!user) {
    throw new Error('User message is required.');
  }

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
    throw new Error(data.error.message || 'Google API error');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}
