import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Brain, Code2, BarChart3, Home, Play, CheckCircle, Circle,
  Loader2, Zap, Lightbulb, Trophy, Clock, Target, ChevronRight,
  RotateCcw, ArrowLeft, Layers, Sparkles, FlipHorizontal,
  HelpCircle, AlignLeft, Lock
} from "lucide-react";

// FRAPPE: Import the hooks
import { useProgress, useTutorSession } from "./src/services/useFrappe.js";
// ── Design tokens ─────────────────────────────────────
const T = {
  bg: "#07080F", s1: "#0C0F1C", s2: "#111827", s3: "#182033",
  border: "rgba(255,255,255,0.07)", accent: "#5B8CF8", green: "#22C5A0",
  purple: "#9B6EF8", amber: "#F5A95B", red: "#F55B6B",
  text: "#DDE3F2", muted: "#647298", dim: "#3A4560",
};

// ── Course data ───────────────────────────────────────
// FRAPPE: Still hardcoded for now until you create courses in Frappe
const COURSE = {
  title: "Python Fundamentals", tagline: "From zero to Python hero in 5 structured modules",
  modules: [
    {
      id: "m1", title: "Getting Started", emoji: "🚀", accent: T.accent, lessons: [
        {
          id: "l1", title: "What is Python?", dur: "10 min", vid: "rfscVS0vtbw",
          overview: "Python is a versatile, high-level interpreted language known for clean readable syntax. Created by Guido van Rossum in 1991, now one of the world's most popular languages.",
          pts: ["Interpreted — runs line by line", "Dynamically typed — no declarations needed", "Cross-platform: Windows, Mac, Linux", "400,000+ packages on PyPI"]
        },
        {
          id: "l2", title: "Variables & Data Types", dur: "14 min", vid: "_uQrJ0TkZlc",
          overview: "Variables store data values. Python creates them on assignment — no declaration needed. Core types: int, float, str, bool, NoneType.",
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
      id: "m2", title: "Control Flow", emoji: "🔀", accent: T.green, lessons: [
        {
          id: "l4", title: "If / Elif / Else", dur: "13 min", vid: "DZwmZ8Usvnk",
          overview: "Conditional statements let you branch code execution based on truth conditions. Python uses indentation to define code blocks.",
          pts: ["Indentation defines the block", "==, !=, <, >, <=, >= comparisons", "and, or, not logical operators", "Ternary: x if cond else y"]
        },
        {
          id: "l5", title: "For Loops", dur: "18 min", vid: "6iF8Xb7Z3wQ",
          overview: "For loops iterate over any iterable — lists, strings, ranges, dicts. Combined with enumerate() and zip() they're extremely powerful.",
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
      id: "m3", title: "Functions", emoji: "⚙️", accent: T.amber, lessons: [
        {
          id: "l7", title: "Defining Functions", dur: "20 min", vid: "9Os0o3wzS_I",
          overview: "Functions are reusable named code blocks. def creates them. They help avoid repetition and keep programs organized and testable.",
          pts: ["def function_name(params):", "return sends back a value", "Docstrings document the function", "Functions are first-class objects"]
        },
        {
          id: "l8", title: "*args & **kwargs", dur: "17 min", vid: "tuVd3qC9P2c",
          overview: "*args captures any number of positional arguments as a tuple. **kwargs captures keyword arguments as a dict. Essential for flexible APIs.",
          pts: ["Default values: def f(x, y=10)", "*args: variable positional args", "**kwargs: variable keyword args", "Order: regular → *args → **kwargs"]
        },
        {
          id: "l9", title: "Lambda & map/filter", dur: "15 min", vid: "Sv9ZXMGbhTQ",
          overview: "Lambda creates anonymous one-line functions. map(), filter(), and sorted(key=) are higher-order functions that accept other functions.",
          pts: ["lambda x: x*2 is anonymous", "map(func, iterable) transforms each", "filter(func, iterable) keeps True items", "sorted(lst, key=lambda x: x[1])"]
        },
      ]
    },
    {
      id: "m4", title: "Data Structures", emoji: "📦", accent: T.purple, lessons: [
        {
          id: "l10", title: "Lists", dur: "22 min", vid: "W8KRzm-HUcc",
          overview: "Lists are ordered, mutable sequences — Python's most versatile structure. They hold any type and support slicing, sorting, and comprehensions.",
          pts: ["lst.append(x) adds to end", "lst.pop() removes last item", "lst[1:4] slices elements", "Nested lists for 2D structures"]
        },
        {
          id: "l11", title: "Dictionaries", dur: "20 min", vid: "daefaLgNkw0",
          overview: "Dicts store key-value pairs. Python 3.7+ maintains insertion order. Perfect for structured data, configs, and counting.",
          pts: ["d['key'] = value to set/update", "d.get('key', default) is safe", "keys(), values(), items() methods", "Dict comprehensions: {k:v for ...}"]
        },
        {
          id: "l12", title: "Tuples & Sets", dur: "16 min", vid: "TxS2HGRLSPs",
          overview: "Tuples are immutable lists. Sets are unordered collections of unique elements — great for deduplication and fast membership testing.",
          pts: ["Tuples: (x, y) — immutable", "Sets: {1, 2, 3} — unique only", "union(), intersection(), difference()", "frozenset is an immutable set"]
        },
      ]
    },
    {
      id: "m5", title: "OOP", emoji: "🏗️", accent: T.red, lessons: [
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
          overview: "Special 'dunder' methods customize built-in operations on objects — print(), len(), ==, +, and more.",
          pts: ["__str__ controls print(obj)", "__len__ controls len(obj)", "__eq__ controls == comparison", "__repr__ gives dev-friendly output"]
        },
      ]
    },
  ]
};

const ALL_LESSONS = COURSE.modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title })));

// ── API helper — calls backend proxy, never exposes key in browser ──────────
async function geminiCall(system, user, agentIndex = 0) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, user, agentIndex }),
  });
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try { const d = await res.json(); errMsg = d.error || errMsg; } catch { }
    throw new Error(errMsg);
  }
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  return d.text || '';
}

// ── On-Demand Task-Separated Agents ───────────────────

async function generateExplanation(topic, mode, length) {
  const LEN = {
    Short: { words: "under 120 words" },
    Medium: { words: "150–250 words" },
    Deep: { words: "300–500 words" },
  }[length] || { words: "150–250 words" };

  const MODE_INST = {
    Beginner: "Explain as if the reader has zero prior knowledge. Use everyday analogies. Avoid jargon; define every technical term you use.",
    Exam: "This is exam preparation. Highlight key facts, formulas, common misconceptions, and tricky areas students get wrong. Use memory-friendly phrasing.",
    Interview: "Format for a technical interview context. Be concise and professional. Emphasise real-world use cases, trade-offs, and edge cases interviewers probe.",
    Revision: "Quick revision mode. Assume prior knowledge. Skip basics. Focus on key distinctions, tricky edge cases, and concise mnemonics.",
  }[mode] || "";

  const sys = `You are a Theory Explainer Agent. You act as an expert educator generating learning content.
LEARNER MODE: ${mode} — ${MODE_INST}
LENGTH RULE: The explanation must be ${LEN.words}.
CRITICAL: Output ONLY the labeled sections below — no preamble, no markdown code fences, no asterisks, no extra commentary.`;

  const prompt = `Topic: "${topic}"

Write content following your instructions, then output it in EXACTLY this format with these exact headers:

EXPLANATION:
[your explanation — ${LEN.words}]

KEY_CONCEPT:
[one crisp sentence capturing the most important insight]

ANALOGY:
[a memorable real-world analogy]`;

  const out = await geminiCall(sys, prompt, 0);
  return out;
}

async function generateInfographics(explanationText, length) {
  const LEN = {
    Short: { infoCount: 2 },
    Medium: { infoCount: 4 },
    Deep: { infoCount: 5 },
  }[length] || { infoCount: 4 };

  const sys = `You are an Infographics Maker Agent. Your task is to summarize learning explanations into key infographic bullet points.
CRITICAL: Generate exactly ${LEN.infoCount} infographic points. Output ONLY the labeled section below — no preamble, no markdown, no extra text.`;

  const prompt = `Explanation Context:
"${explanationText}"

Generate exactly ${LEN.infoCount} infographic points summarizing this context. Output in EXACTLY this format:

INFOGRAPHIC_POINTS:
- [point 1]
- [point 2]${LEN.infoCount >= 3 ? "\n- [point 3]" : ""}${LEN.infoCount >= 4 ? "\n- [point 4]" : ""}${LEN.infoCount >= 5 ? "\n- [point 5]" : ""}`;

  const out = await geminiCall(sys, prompt, 1);
  return out;
}

async function generateQuiz(contextText, mode, length) {
  const LEN = {
    Short: { quizCount: 2 },
    Medium: { quizCount: 3 },
    Deep: { quizCount: 4 },
  }[length] || { quizCount: 3 };

  const sys = `You are a Quiz Maker Agent. Your task is to write multiple-choice questions to test understanding of a topic.
CRITICAL: Write exactly ${LEN.quizCount} quiz questions. Output ONLY the labeled section below — no preamble, no markdown.`;

  const prompt = `Context / Topic Details:
"${contextText}"

Generate exactly ${LEN.quizCount} quiz questions based on the context. Each question must have exactly 4 options (A, B, C, D) and specify the correct answer. Output in EXACTLY this format:

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
Correct: [A/B/C/D]` : ""}`;

  const out = await geminiCall(sys, prompt, 2);
  return out;
}

async function generateFlashcards(explanationText, length) {
  const LEN = {
    Short: { cardCount: 2 },
    Medium: { cardCount: 3 },
    Deep: { cardCount: 5 },
  }[length] || { cardCount: 3 };

  const sys = `You are a Flashcard Maker Agent. Your task is to generate flashcards with a FRONT (concept/question) and BACK (definition/answer).
CRITICAL: Generate exactly ${LEN.cardCount} flashcards. Output ONLY the labeled section below — no preamble, no markdown.`;

  const prompt = `Explanation Context:
"${explanationText}"

Generate exactly ${LEN.cardCount} flashcards based on the context. Output in EXACTLY this format:

FLASHCARDS:
FRONT: [concept/question]
BACK: [definition/answer]
---
FRONT: [concept/question]
BACK: [definition/answer]${LEN.cardCount >= 3 ? `
---
FRONT: [concept/question]
BACK: [definition/answer]` : ""}${LEN.cardCount >= 4 ? `
---
FRONT: [concept/question]
BACK: [definition/answer]` : ""}${LEN.cardCount >= 5 ? `
---
FRONT: [concept/question]
BACK: [definition/answer]` : ""}`;

  const out = await geminiCall(sys, prompt, 3);
  return out;
}

// ── Specialized output parsers ────────────────────────

function parseOutput(text) {
  const extract = (startLabel, endLabel) => {
    const start = text.indexOf(`${startLabel}:`);
    if (start === -1) return "";
    const contentStart = start + startLabel.length + 1;
    const end = endLabel ? text.indexOf(`\n${endLabel}:`, contentStart) : -1;
    return (end === -1 ? text.slice(contentStart) : text.slice(contentStart, end)).trim();
  };

  const explanation = extract("EXPLANATION", "KEY_CONCEPT");
  const keyConcept = extract("KEY_CONCEPT", "ANALOGY");
  const analogy = extract("ANALOGY", null);

  return { explanation, keyConcept, analogy };
}

function parseInfographics(text) {
  const raw = text.replace("INFOGRAPHIC_POINTS:", "").trim();
  return raw
    .split('\n')
    .map(l => l.replace(/^[\-•*]\s*/, '').trim())
    .filter(l => l.length > 2);
}

function parseQuiz(text) {
  const quizQuestions = [];
  const qBlocks = text.split(/Q\d+:/i).filter(b => b.trim());
  for (const block of qBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const question = lines[0];

    const fullBlock = lines.join(' ');
    const optMatches = [...fullBlock.matchAll(/([ABCD])\)\s*([^ABCD)]+?)(?=\s+[ABCD]\)|Correct:|$)/gi)];
    const options = optMatches.map(m => m[2].trim()).filter(Boolean);

    const correctMatch = block.match(/Correct:\s*([ABCD])/i);
    const correct = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;

    if (question && options.length >= 2) {
      quizQuestions.push({ question, options, correct });
    }
  }
  return quizQuestions;
}

function parseFlashcards(text) {
  const raw = text.replace("FLASHCARDS:", "").trim();
  return raw
    .split(/\n---+\n?/)
    .map(card => {
      const frontMatch = card.match(/FRONT:\s*(.+?)(?=\nBACK:|$)/is);
      const backMatch = card.match(/BACK:\s*(.+?)(?=\nFRONT:|$)/is);
      const front = frontMatch?.[1]?.trim();
      const back = backMatch?.[1]?.trim();
      return (front && back) ? { front, back } : null;
    })
    .filter(Boolean);
}

// ── Sidebar ──────────────────────────────────────────
function Sidebar({ page, setPage }) {
  const NAV = [
    { id: "dashboard", Icon: Home, label: "Dashboard" },
    { id: "courses", Icon: BookOpen, label: "Courses" },
    { id: "general-tutor", Icon: Brain, label: "General Tutor" },
    { id: "coding-tutor", Icon: Code2, label: "Coding Tutor" },
    { id: "progress", Icon: BarChart3, label: "Progress" },
  ];
  return (
    <div style={{ width: 220, minHeight: "100vh", background: T.s1, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}>
      <div style={{ padding: "0 20px 28px", borderBottom: `1px solid ${T.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.accent}22`, border: `1px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color={T.accent} />
          </div>
          <div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>LMS AI</div>
            <div style={{ color: T.muted, fontSize: 11 }}>Learning Platform</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "0 12px" }}>
        {NAV.map(({ id, Icon, label }) => {
          const active = page === id;
          return (
            <button key={id} onClick={() => setPage(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 9, marginBottom: 3, background: active ? `${T.accent}18` : "transparent", border: active ? `1px solid ${T.accent}30` : "1px solid transparent", color: active ? T.accent : T.muted, cursor: "pointer", fontSize: 13.5, fontWeight: active ? 600 : 400, letterSpacing: "-0.01em", transition: "all 0.15s" }}>
              <Icon size={16} />{label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${T.purple}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.purple, fontWeight: 700 }}>S</div>
          <div><div style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>Student</div><div style={{ color: T.muted, fontSize: 11 }}>Free Plan</div></div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────
// FRAPPE: Now receives completed from props (from useProgress)
function Dashboard({ setPage, completed }) {
  const total = ALL_LESSONS.length;
  const done = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  return (
    <div style={{ padding: "32px 36px", maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: T.text, fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.04em" }}>Build understanding,<br /><span style={{ color: T.accent }}>not just notes.</span></h1>
        <p style={{ color: T.muted, marginTop: 8, fontSize: 15 }}>Your AI-powered learning workspace is ready.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Lessons Completed", val: `${done}/${total}`, sub: `${pct}% done`, color: T.accent, Icon: CheckCircle },
          { label: "Modules Available", val: "5", sub: "Python Fundamentals", color: T.green, Icon: BookOpen },
          { label: "AI Tools Ready", val: "2", sub: "General + Coding Tutor", color: T.purple, Icon: Brain },
        ].map(({ label, val, sub, color, Icon }) => (
          <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={14} color={color} /></div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: "-0.04em" }}>{val}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>Python Fundamentals</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>5 modules · 15 lessons</div>
          <div style={{ background: T.s3, borderRadius: 99, height: 6, marginBottom: 8 }}>
            <div style={{ background: T.accent, height: 6, borderRadius: 99, width: `${pct}%`, transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <span style={{ fontSize: 12, color: T.muted }}>{pct}% complete</span>
            <button onClick={() => setPage("courses")} style={{ background: T.accent, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>Continue <ChevronRight size={13} /></button>
          </div>
        </div>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>General Tutor</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>Ask anything · Infographics · Quiz · Flashcards</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {["Beginner", "Exam", "Interview", "Revision"].map(m => (
              <span key={m} style={{ fontSize: 11, color: T.purple, background: `${T.purple}18`, padding: "3px 10px", borderRadius: 20, border: `1px solid ${T.purple}30` }}>{m}</span>
            ))}
          </div>
          <button onClick={() => setPage("general-tutor")} style={{ background: T.purple, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>Open Tutor <ChevronRight size={13} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Course List ───────────────────────────────────────
// FRAPPE: Now receives completed from props (from useProgress)
function CoursePage({ completed, setPage, setLesson }) {
  const total = ALL_LESSONS.length;
  const done = Object.values(completed).filter(Boolean).length;
  return (
    <div style={{ padding: "32px 36px", maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{COURSE.title}</h2>
        <p style={{ color: T.muted, margin: 0, fontSize: 14 }}>{COURSE.tagline} · {done}/{total} lessons completed</p>
        <div style={{ background: T.s3, borderRadius: 99, height: 5, marginTop: 12, width: "100%" }}>
          <div style={{ background: T.accent, height: 5, borderRadius: 99, width: `${Math.round((done / total) * 100)}%`, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {COURSE.modules.map((mod, mi) => {
          const modDone = mod.lessons.filter(l => completed[l.id]).length;
          return (
            <div key={mod.id} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${mod.accent}18`, border: `1px solid ${mod.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{mod.emoji}</div>
                  <div>
                    <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{mi + 1}. {mod.title}</div>
                    <div style={{ color: T.muted, fontSize: 12 }}>{mod.lessons.length} lessons · {modDone} completed</div>
                  </div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: "50%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="36" height="36" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke={T.s3} strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke={mod.accent} strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - modDone / mod.lessons.length)}`}
                      strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 10, color: mod.accent, fontWeight: 700, position: "relative" }}>{Math.round((modDone / mod.lessons.length) * 100)}%</span>
                </div>
              </div>
              <div>
                {mod.lessons.map((lesson, li) => (
                  <button key={lesson.id} onClick={() => { setLesson(lesson); setPage("lesson"); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", background: "transparent", border: "none", borderBottom: li < mod.lessons.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.s3}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {completed[lesson.id] ? <CheckCircle size={16} color={T.green} /> : <Circle size={16} color={T.dim} />}
                      <div>
                        <div style={{ color: T.text, fontSize: 13.5, fontWeight: 500 }}>{lesson.title}</div>
                        <div style={{ color: T.muted, fontSize: 12, marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}><Clock size={11} />{lesson.dur}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {completed[lesson.id] && <span style={{ fontSize: 11, color: T.green, background: `${T.green}18`, padding: "2px 8px", borderRadius: 20 }}>Done</span>}
                      <Play size={14} color={T.muted} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Lesson View ───────────────────────────────────────
// FRAPPE: Now receives onComplete from props (calls markComplete)
function LessonPage({ lesson, completed, onComplete, setPage }) {
  const allIds = ALL_LESSONS.map(l => l.id);
  const idx = allIds.indexOf(lesson.id);
  const next = ALL_LESSONS[idx + 1];
  const mod = COURSE.modules.find(m => m.lessons.some(l => l.id === lesson.id));

  // Quiz states
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [agents, setAgents] = useState([{ s: "idle" }, { s: "idle" }, { s: "idle" }, { s: "idle" }]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState(null);

  useEffect(() => {
    setQuiz(null);
    setLoading(false);
    setErr("");
    setAgents([{ s: "idle" }, { s: "idle" }, { s: "idle" }, { s: "idle" }]);
    setQuizIdx(0);
    setQuizAns(null);
  }, [lesson.id]);

  const handleGenerateQuiz = async () => {
    setErr("");
    setLoading(true);
    setAgents([
      { s: "loading" },
      { s: "idle" },
      { s: "idle" },
      { s: "idle" }
    ]);
    
    const topicText = `Python lesson: ${lesson.title}. Overview: ${lesson.overview}. Key points: ${lesson.pts.join(", ")}`;
    
    let apiPromiseResolved = false;
    let apiError = null;
    let finalText = "";

    const apiCall = generateQuiz(topicText, "Beginner", "Medium")
      .then(res => {
        finalText = res;
        apiPromiseResolved = true;
      })
      .catch(err => {
        apiError = err;
        apiPromiseResolved = true;
      });

    try {
      // Step 1: Planner
      await new Promise(r => setTimeout(r, 450));
      setAgents([
        { s: "done" },
        { s: "loading" },
        { s: "idle" },
        { s: "idle" }
      ]);

      // Step 2: Requirement Dev
      await new Promise(r => setTimeout(r, 450));
      setAgents([
        { s: "done" },
        { s: "done" },
        { s: "loading" },
        { s: "idle" }
      ]);

      // Step 3: Output Optimizer
      await new Promise(r => setTimeout(r, 450));
      setAgents([
        { s: "done" },
        { s: "done" },
        { s: "done" },
        { s: "loading" }
      ]);

      // Step 4: Wait for API call
      await apiCall;

      if (apiError) throw apiError;

      setAgents([
        { s: "done" },
        { s: "done" },
        { s: "done" },
        { s: "done", out: finalText }
      ]);

      const parsedQuestions = parseQuiz(finalText);
      if (!parsedQuestions || parsedQuestions.length === 0) {
        throw new Error("No quiz questions were returned by the AI. Please try again.");
      }
      setQuiz({ quizQuestions: parsedQuestions });
      setQuizIdx(0);
      setQuizAns(null);
    } catch (e) {
      setAgents(prev => prev.map(a => a.s === "loading" ? { s: "error", out: e.message } : a));
      setErr(e.message || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const AGENT_META_LOCAL = [
    { name: "Topic Planner", Icon: Target, color: T.accent },
    { name: "Requirement Dev", Icon: Layers, color: T.green },
    { name: "Output Optimizer", Icon: Zap, color: T.amber },
    { name: "Theory Explainer", Icon: Lightbulb, color: T.purple },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900 }}>
      <button onClick={() => setPage("courses")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, marginBottom: 22, padding: 0 }}>
        <ArrowLeft size={15} /> Back to Course
      </button>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: mod?.accent || T.accent, background: `${mod?.accent || T.accent}18`, padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>{mod?.emoji} {mod?.title}</span>
        </div>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{lesson.title}</h2>
        <div style={{ color: T.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} />{lesson.dur}</div>
      </div>
      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 22 }}>
        <iframe width="100%" height="400" src={`https://www.youtube.com/embed/${lesson.vid}`} title={lesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: "block" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Overview</div>
          <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{lesson.overview}</p>
        </div>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Key Points</div>
          {lesson.pts.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 9 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${mod?.accent || T.accent}22`, border: `1px solid ${mod?.accent || T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, color: mod?.accent || T.accent, fontWeight: 700 }}>{i + 1}</span>
              </div>
              <span style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Practice Quiz */}
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Brain size={16} color={T.purple} />
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>Interactive AI Practice Quiz</div>
          </div>
          {!quiz && !loading && (
            <button onClick={handleGenerateQuiz} style={{ background: T.purple, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={13} /> Generate Quiz
            </button>
          )}
        </div>

        {loading && (
          <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.05em" }}>GENERATING LESSON QUIZ...</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {AGENT_META_LOCAL.map((ag, i) => {
                const s = agents[i]?.s;
                const { Icon } = ag;
                const isActive = s === "loading";
                const isDone = s === "done";
                return (
                  <div key={i} style={{ background: isDone ? `${ag.color}10` : isActive ? `${ag.color}08` : T.s3, border: `1px solid ${isDone ? ag.color + "40" : isActive ? ag.color + "30" : T.border}`, borderRadius: 10, padding: "10px 12px", transition: "all 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: `${ag.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={11} color={ag.color} />
                      </div>
                      {isDone ? <CheckCircle size={12} color={T.green} /> :
                        isActive ? <Loader2 size={12} color={ag.color} style={{ animation: "spin 1s linear infinite" }} /> :
                          <Circle size={12} color={T.dim} />}
                    </div>
                    <div style={{ fontSize: 11, color: isDone ? T.text : T.muted, fontWeight: isDone || isActive ? 600 : 400, lineHeight: 1.2 }}>{ag.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {err && <div style={{ color: T.red, fontSize: 12, background: `${T.red}12`, padding: "8px 12px", borderRadius: 7 }}>⚠️ {err}</div>}

        {quiz && quiz.quizQuestions?.length > 0 && (
          <div>
            {(() => {
              const q = quiz.quizQuestions[quizIdx];
              return q ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: T.muted }}>Question {quizIdx + 1} of {quiz.quizQuestions.length}</div>
                    <button onClick={() => { setQuizIdx(0); setQuizAns(null); }}
                      style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <RotateCcw size={10} /> Reset
                    </button>
                  </div>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>{q.question}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = quizAns === oi;
                      const isCorrect = oi === q.correct;
                      const showResult = quizAns !== null;
                      let bg = T.s3, border = T.border, color = T.muted;
                      if (showResult && isCorrect) { bg = `${T.green}18`; border = `${T.green}50`; color = T.green; }
                      else if (showResult && isSelected) { bg = `${T.red}18`; border = `${T.red}50`; color = T.red; }
                      else if (!showResult && isSelected) { bg = `${T.accent}18`; border = `${T.accent}50`; color = T.accent; }
                      return (
                        <button key={oi} onClick={() => { if (quizAns === null) setQuizAns(oi); }}
                          disabled={quizAns !== null}
                          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "10px 14px", color, fontSize: 12.5, cursor: quizAns !== null ? "default" : "pointer", textAlign: "left", transition: "all 0.2s" }}>
                          <span style={{ fontWeight: 700, marginRight: 8 }}>{"ABCD"[oi]})</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizAns !== null && (
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: quizAns === q.correct ? T.green : T.red, fontWeight: 600 }}>
                        {quizAns === q.correct ? "✓ Correct!" : `✗ Incorrect — correct answer: ${"ABCD"[q.correct]}`}
                      </span>
                      {quizIdx < quiz.quizQuestions.length - 1 && (
                        <button onClick={() => { setQuizIdx(i => i + 1); setQuizAns(null); }}
                          style={{ background: T.accent, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          Next <ChevronRight size={12} />
                        </button>
                      )}
                      {quizIdx === quiz.quizQuestions.length - 1 && (
                        <span style={{ fontSize: 12, color: T.muted }}>Quiz complete! 🎉</span>
                      )}
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        {!quiz && !loading && !err && (
          <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "10px 0" }}>
            Test your understanding of this lesson by generating a custom quiz!
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {completed[lesson.id] ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.green, fontSize: 14, fontWeight: 600 }}>
            <CheckCircle size={18} /> Completed!
          </div>
        ) : (
          <button onClick={() => onComplete(lesson.id)} style={{ background: T.green, color: "#000", border: "none", padding: "11px 24px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <CheckCircle size={15} /> Mark as Complete
          </button>
        )}
        {next && (
          <button onClick={() => setPage("courses")} style={{ background: T.s3, border: `1px solid ${T.border}`, color: T.text, padding: "11px 20px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            Next: {next.title} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── General Tutor ─────────────────────────────────────
// FRAPPE: Added useTutorSession hook to save sessions
const AGENT_META = [
  { name: "Topic Planner", Icon: Target, desc: "Mapping the concept", color: T.accent },
  { name: "Requirement Dev", Icon: Layers, desc: "Building the structure", color: T.green },
  { name: "Output Optimizer", Icon: Zap, desc: "Optimising for your style", color: T.amber },
  { name: "Theory Explainer", Icon: Lightbulb, desc: "Generating your answer", color: T.purple },
];

function GeneralTutor() {
  // FRAPPE: Hook to save tutor sessions
  const { save: saveSession } = useTutorSession("General");

  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("Beginner");
  const [length, setLength] = useState("Medium");
  const [agents, setAgents] = useState([{ s: "idle" }, { s: "idle" }, { s: "idle" }, { s: "idle" }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("explanation");
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState(null);
  const [fcIdx, setFcIdx] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [tabLoading, setTabLoading] = useState({ infographic: false, quiz: false, flashcards: false });
  const resultsRef = useRef(null);

  const loadInfographics = async () => {
    setTabLoading(prev => ({ ...prev, infographic: true }));
    setErr("");
    try {
      const text = await generateInfographics(result.explanation, length);
      const points = parseInfographics(text);
      setResult(prev => ({ ...prev, infoPoints: points }));
    } catch (e) {
      setErr(e.message || "Failed to load infographic points.");
    } finally {
      setTabLoading(prev => ({ ...prev, infographic: false }));
    }
  };

  const loadQuiz = async () => {
    setTabLoading(prev => ({ ...prev, quiz: true }));
    setErr("");
    try {
      const text = await generateQuiz(result.explanation, mode, length);
      const questions = parseQuiz(text);
      setResult(prev => ({ ...prev, quizQuestions: questions }));
      setQuizIdx(0);
      setQuizAns(null);
    } catch (e) {
      setErr(e.message || "Failed to load quiz.");
    } finally {
      setTabLoading(prev => ({ ...prev, quiz: false }));
    }
  };

  const loadFlashcards = async () => {
    setTabLoading(prev => ({ ...prev, flashcards: true }));
    setErr("");
    try {
      const text = await generateFlashcards(result.explanation, length);
      const cards = parseFlashcards(text);
      setResult(prev => ({ ...prev, flashcards: cards }));
      setFcIdx(0);
      setFcFlipped(false);
    } catch (e) {
      setErr(e.message || "Failed to load flashcards.");
    } finally {
      setTabLoading(prev => ({ ...prev, flashcards: false }));
    }
  };

  useEffect(() => {
    if (!result) return;
    if (tab === "infographic" && !result.infoPoints && !tabLoading.infographic) {
      loadInfographics();
    } else if (tab === "quiz" && !result.quizQuestions && !tabLoading.quiz) {
      loadQuiz();
    } else if (tab === "flashcards" && !result.flashcards && !tabLoading.flashcards) {
      loadFlashcards();
    }
  }, [tab, result]);

  const handleGenerate = async () => {
    if (!topic.trim()) return setErr("Please enter a topic.");
    setErr(""); setResult(null); setLoading(true);
    setAgents([
      { s: "loading" },
      { s: "idle" },
      { s: "idle" },
      { s: "idle" }
    ]);

    let apiPromiseResolved = false;
    let apiError = null;
    let finalText = "";

    const apiCall = generateExplanation(topic.trim(), mode, length)
      .then(res => {
        finalText = res;
        apiPromiseResolved = true;
      })
      .catch(err => {
        apiError = err;
        apiPromiseResolved = true;
      });

    try {
      // Step 1: Planner
      await new Promise(r => setTimeout(r, 450));
      setAgents(prev => [
        { s: "done" },
        { s: "loading" },
        { s: "idle" },
        { s: "idle" }
      ]);

      // Step 2: Requirement Dev
      await new Promise(r => setTimeout(r, 450));
      setAgents(prev => [
        { s: "done" },
        { s: "done" },
        { s: "loading" },
        { s: "idle" }
      ]);

      // Step 3: Output Optimizer
      await new Promise(r => setTimeout(r, 450));
      setAgents(prev => [
        { s: "done" },
        { s: "done" },
        { s: "done" },
        { s: "loading" }
      ]);

      // Step 4: Wait for Explainer API call
      await apiCall;

      if (apiError) throw apiError;

      setAgents(prev => [
        { s: "done" },
        { s: "done" },
        { s: "done" },
        { s: "done", out: finalText }
      ]);

      const parsed = parseOutput(finalText);
      if (!parsed.explanation && !parsed.keyConcept) {
        throw new Error("The AI returned an unexpected format. Please try again.");
      }

      setResult({
        explanation: parsed.explanation,
        keyConcept: parsed.keyConcept,
        analogy: parsed.analogy,
        infoPoints: null,
        quizQuestions: null,
        flashcards: null
      });
      setTab("explanation");
      setQuizIdx(0); setQuizAns(null); setFcIdx(0); setFcFlipped(false);

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);

      // FRAPPE: Save tutor session to Frappe
      saveSession(topic, [
        { role: "user", content: topic },
        { role: "ai", content: finalText }
      ]);

    } catch (e) {
      setAgents(prev => prev.map(a => a.s === "loading" ? { s: "error", out: e.message } : a));
      setErr(e.message || "Error reaching the backend. Make sure the server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const MODES = ["Beginner", "Exam", "Interview", "Revision"];
  const LENGTHS = ["Short", "Medium", "Deep"];
  const modeColors = { Beginner: T.green, Exam: T.accent, Interview: T.amber, Revision: T.purple };
  const TABS = [
    { id: "explanation", Icon: AlignLeft, label: "Explanation" },
    { id: "infographic", Icon: Sparkles, label: "Infographic" },
    { id: "quiz", Icon: HelpCircle, label: "Quiz" },
    { id: "flashcards", Icon: FlipHorizontal, label: "Flashcards" },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${T.purple}22`, border: `1px solid ${T.purple}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={16} color={T.purple} />
          </div>
          <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.03em" }}>General Tutor</h2>
        </div>
        <p style={{ color: T.muted, margin: 0, fontSize: 13.5 }}>4-agent AI pipeline · Explanations · Infographics · Quizzes · Flashcards</p>
      </div>

      {/* Backend status pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "6px 12px", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, width: "fit-content" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} />
        <span style={{ fontSize: 12, color: T.muted }}>API key loaded from server · model: gemini-3.5-flash</span>
        <Lock size={11} color={T.dim} />
      </div>

      {/* Input card */}
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <textarea
          value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="What do you want to learn? e.g. 'Binary Search Trees', 'How does TCP/IP work?', 'Explain recursion'..."
          rows={3}
          style={{ width: "100%", background: T.s3, border: `1px solid ${T.border}`, borderRadius: 9, padding: "11px 14px", color: T.text, fontSize: 14, resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
          onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") handleGenerate(); }}
        />

        <div style={{ display: "flex", gap: 20, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
          {/* Mode selector */}
          <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.06em" }}>MODE</div>
            <div style={{ display: "flex", gap: 6 }}>
              {MODES.map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${mode === m ? modeColors[m] + "60" : T.border}`, background: mode === m ? `${modeColors[m]}18` : "transparent", color: mode === m ? modeColors[m] : T.muted, cursor: "pointer", fontSize: 12, fontWeight: mode === m ? 600 : 400, transition: "all 0.15s" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Depth selector */}
          <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.06em" }}>DEPTH</div>
            <div style={{ display: "flex", gap: 6 }}>
              {LENGTHS.map(l => (
                <button key={l} onClick={() => setLength(l)}
                  style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${length === l ? T.accent + "60" : T.border}`, background: length === l ? `${T.accent}18` : "transparent", color: length === l ? T.accent : T.muted, cursor: "pointer", fontSize: 12, fontWeight: length === l ? 600 : 400, transition: "all 0.15s" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Active settings preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: T.dim, background: T.s3, padding: "3px 8px", borderRadius: 5, border: `1px solid ${T.border}` }}>
              {mode} · {length}
            </span>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerate} disabled={loading}
            style={{ marginLeft: "auto", background: loading ? T.dim : T.purple, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}>
            {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={15} />}
            {loading ? "Thinking..." : "Generate"}
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 10, color: T.red, fontSize: 12, background: `${T.red}12`, padding: "8px 12px", borderRadius: 7, lineHeight: 1.5 }}>
            ⚠️ {err}
          </div>
        )}
      </div>

      {/* Agent pipeline status */}
      {(loading || result) && (
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.07em" }}>4-AGENT PIPELINE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {AGENT_META.map((ag, i) => {
              const s = agents[i]?.s;
              const { Icon } = ag;
              const isActive = s === "loading";
              const isDone = s === "done";
              return (
                <div key={i} style={{ background: isDone ? `${ag.color}10` : isActive ? `${ag.color}08` : T.s3, border: `1px solid ${isDone ? ag.color + "40" : isActive ? ag.color + "30" : T.border}`, borderRadius: 10, padding: "12px 14px", transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${ag.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={13} color={ag.color} /></div>
                    {isDone ? <CheckCircle size={14} color={T.green} /> :
                      isActive ? <Loader2 size={14} color={ag.color} style={{ animation: "spin 1s linear infinite" }} /> :
                        <Circle size={14} color={T.dim} />}
                  </div>
                  <div style={{ fontSize: 12, color: isDone ? T.text : T.muted, fontWeight: isDone || isActive ? 600 : 400, lineHeight: 1.3 }}>{ag.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{ag.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultsRef} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          {/* Key concept banner */}
          {result.keyConcept && (
            <div style={{ background: `${T.purple}14`, borderBottom: `1px solid ${T.purple}25`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <Lightbulb size={15} color={T.purple} />
              <span style={{ fontSize: 13, color: T.purple, fontWeight: 600 }}>{result.keyConcept}</span>
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, padding: "0 8px" }}>
            {TABS.map(({ id, Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 14px", background: "transparent", border: "none", borderBottom: `2px solid ${tab === id ? T.accent : "transparent"}`, color: tab === id ? T.accent : T.muted, cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 600 : 400, transition: "all 0.15s" }}>
                <Icon size={14} />{label}
                {id === "quiz" && result.quizQuestions?.length > 0 && <span style={{ fontSize: 10, background: `${T.accent}25`, color: T.accent, borderRadius: 9, padding: "1px 6px" }}>{result.quizQuestions.length}</span>}
                {id === "flashcards" && result.flashcards?.length > 0 && <span style={{ fontSize: 10, background: `${T.green}25`, color: T.green, borderRadius: 9, padding: "1px 6px" }}>{result.flashcards.length}</span>}
              </button>
            ))}
          </div>

          <div style={{ padding: "20px" }}>
            {/* ── Explanation tab ── */}
            {tab === "explanation" && (
              <div>
                <div style={{ color: T.text, fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", marginBottom: 16 }}>
                  {result.explanation || <span style={{ color: T.muted, fontStyle: "italic" }}>No explanation returned. Try again.</span>}
                </div>
                {result.analogy && (
                  <div style={{ background: `${T.amber}10`, border: `1px solid ${T.amber}25`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>💡</span>
                    <div>
                      <div style={{ fontSize: 12, color: T.amber, fontWeight: 600, marginBottom: 4 }}>ANALOGY</div>
                      <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.65 }}>{result.analogy}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Infographic tab ── */}
            {tab === "infographic" && (
              <div>
                {tabLoading.infographic ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 12 }}>
                    <Loader2 size={24} color={T.accent} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 13, color: T.muted }}>Generating infographic points...</span>
                  </div>
                ) : result.infoPoints?.length > 0 ? (
                  <>
                    <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Key concepts at a glance</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {result.infoPoints.map((pt, i) => {
                        const colors = [T.accent, T.green, T.purple, T.amber, T.red];
                        const icons = ["🎯", "📌", "⚡", "🔑", "🌟", "💎", "🧩", "🚀"];
                        const c = colors[i % colors.length];
                        return (
                          <div key={i} style={{ background: T.s3, border: `1px solid ${c}25`, borderRadius: 11, padding: "16px", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -12, right: -12, width: 64, height: 64, borderRadius: "50%", background: `${c}08` }} />
                            <div style={{ fontSize: 22, marginBottom: 8 }}>{icons[i % icons.length]}</div>
                            <div style={{ color: T.text, fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>{pt}</div>
                            <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: "100%", background: `linear-gradient(90deg,${c},transparent)` }} />
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                    No infographic points were generated. Try regenerating with a different depth.
                  </div>
                )}
              </div>
            )}
            
            {/* ── Quiz tab ── */}
            {tab === "quiz" && (
              <div>
                {tabLoading.quiz ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 12 }}>
                    <Loader2 size={24} color={T.purple} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 13, color: T.muted }}>Generating practice quiz...</span>
                  </div>
                ) : result.quizQuestions?.length > 0 ? (() => {
                  const q = result.quizQuestions[quizIdx];
                  return (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 13, color: T.muted }}>Question {quizIdx + 1} of {result.quizQuestions.length}</div>
                        <button onClick={() => { setQuizIdx(0); setQuizAns(null); }}
                          style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                          <RotateCcw size={11} />Reset
                        </button>
                      </div>
                      <div style={{ color: T.text, fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{q.question}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.options.map((opt, oi) => {
                          const isSelected = quizAns === oi;
                          const isCorrect = oi === q.correct;
                          const showResult = quizAns !== null;
                          let bg = T.s3, border = T.border, color = T.muted;
                          if (showResult && isCorrect) { bg = `${T.green}18`; border = `${T.green}50`; color = T.green; }
                          else if (showResult && isSelected) { bg = `${T.red}18`; border = `${T.red}50`; color = T.red; }
                          else if (!showResult && isSelected) { bg = `${T.accent}18`; border = `${T.accent}50`; color = T.accent; }
                          return (
                            <button key={oi} onClick={() => { if (quizAns === null) setQuizAns(oi); }}
                              disabled={quizAns !== null}
                              style={{ background: bg, border: `1px solid ${border}`, borderRadius: 9, padding: "11px 16px", color, fontSize: 13, cursor: quizAns !== null ? "default" : "pointer", textAlign: "left", transition: "all 0.2s" }}>
                              <span style={{ fontWeight: 700, marginRight: 8 }}>{"ABCD"[oi]})</span>{opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizAns !== null && (
                        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: quizAns === q.correct ? T.green : T.red, fontWeight: 600 }}>
                            {quizAns === q.correct ? "✓ Correct!" : `✗ Incorrect — correct answer: ${"ABCD"[q.correct]}`}
                          </span>
                          {quizIdx < result.quizQuestions.length - 1 && (
                            <button onClick={() => { setQuizIdx(i => i + 1); setQuizAns(null); }}
                              style={{ background: T.accent, color: "#fff", border: "none", padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                              Next <ChevronRight size={13} />
                            </button>
                          )}
                          {quizIdx === result.quizQuestions.length - 1 && (
                            <span style={{ fontSize: 12, color: T.muted }}>Quiz complete! 🎉</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                    No quiz questions were generated. Try regenerating.
                  </div>
                )}
              </div>
            )}

            {/* ── Flashcards tab ── */}
            {tab === "flashcards" && (
              <div>
                {tabLoading.flashcards ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 12 }}>
                    <Loader2 size={24} color={T.amber} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 13, color: T.muted }}>Generating flashcards...</span>
                  </div>
                ) : result.flashcards?.length > 0 ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: T.muted }}>Card {fcIdx + 1} of {result.flashcards.length}</div>
                      <button onClick={() => { setFcIdx(0); setFcFlipped(false); }}
                        style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                        <RotateCcw size={11} />Reset
                      </button>
                    </div>
                    <div onClick={() => setFcFlipped(!fcFlipped)} style={{ cursor: "pointer" }}>
                      <div style={{ background: fcFlipped ? `${T.purple}15` : T.s3, border: `1px solid ${fcFlipped ? T.purple + "40" : T.border}`, borderRadius: 14, padding: "36px 28px", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", transition: "all 0.3s" }}>
                        <div style={{ fontSize: 11, color: T.muted, letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>
                          {fcFlipped ? "Answer" : "Question — click to reveal"}
                        </div>
                        <div style={{ fontSize: 16, color: T.text, fontWeight: fcFlipped ? 400 : 600, lineHeight: 1.6 }}>
                          {fcFlipped ? result.flashcards[fcIdx]?.back : result.flashcards[fcIdx]?.front}
                        </div>
                        {!fcFlipped && <div style={{ marginTop: 14, fontSize: 11, color: T.dim }}>tap to flip</div>}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14 }}>
                      <button onClick={() => { setFcIdx(i => (i - 1 + result.flashcards.length) % result.flashcards.length); setFcFlipped(false); }}
                        style={{ background: T.s3, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>
                        ← Prev
                      </button>
                      <button onClick={() => { setFcIdx(i => (i + 1) % result.flashcards.length); setFcFlipped(false); }}
                        style={{ background: T.s3, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>
                        Next →
                      </button>
                    </div>
                    {/* Dot indicators */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                      {result.flashcards.map((_, i) => (
                        <div key={i} onClick={() => { setFcIdx(i); setFcFlipped(false); }}
                          style={{ width: 7, height: 7, borderRadius: "50%", background: fcIdx === i ? T.purple : T.dim, cursor: "pointer", transition: "all 0.2s" }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                    No flashcards were generated. Try regenerating.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

// ── Coding Tutor (placeholder) ────────────────────────
function CodingTutor() {
  return (
    <div style={{ padding: "32px 36px", maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${T.amber}22`, border: `1px solid ${T.amber}30`, display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={16} color={T.amber} /></div>
        <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.03em" }}>Coding Tutor</h2>
      </div>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>DSA visualisations · Code execution tracer · Step-by-step animations</p>
      <div style={{ background: T.s2, border: `1px solid ${T.amber}30`, borderRadius: 14, padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <div style={{ color: T.text, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Coming in MVP2</div>
        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 20px" }}>
          The Coding Tutor will feature sandboxed code execution, step-by-step DSA visualisations for arrays, trees, graphs, sorting algorithms, and more.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {["Binary Search", "Bubble Sort", "Linked Lists", "Binary Trees", "BFS/DFS", "Recursion", "Stacks & Queues", "Hash Tables"].map(f => (
            <span key={f} style={{ fontSize: 12, color: T.amber, background: `${T.amber}15`, padding: "5px 12px", borderRadius: 20, border: `1px solid ${T.amber}25` }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Progress ──────────────────────────────────────────
function ProgressPage({ completed }) {
  const total = ALL_LESSONS.length;
  const done = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  return (
    <div style={{ padding: "32px 36px", maxWidth: 860 }}>
      <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.03em" }}>Progress Dashboard</h2>
      <p style={{ color: T.muted, margin: "0 0 24px", fontSize: 14 }}>Your Python Fundamentals journey at a glance.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Lessons Done", val: done, total, color: T.accent, Icon: CheckCircle },
          { label: "Completion", val: `${pct}%`, total: null, color: T.green, Icon: Trophy },
          { label: "Modules Started", val: COURSE.modules.filter(m => m.lessons.some(l => completed[l.id])).length, total: 5, color: T.purple, Icon: BookOpen },
          { label: "Remaining", val: total - done, total, color: T.amber, Icon: Clock },
        ].map(({ label, val, total: t, color, Icon }) => (
          <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={12} color={color} /></div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-0.04em" }}>{val}</div>
            {t && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>of {t}</div>}
          </div>
        ))}
      </div>
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Module Progress</div>
        {COURSE.modules.map(mod => {
          const modDone = mod.lessons.filter(l => completed[l.id]).length;
          const modPct = Math.round((modDone / mod.lessons.length) * 100);
          return (
            <div key={mod.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.text }}>{mod.emoji} {mod.title}</span>
                <span style={{ fontSize: 12, color: T.muted }}>{modDone}/{mod.lessons.length} · {modPct}%</span>
              </div>
              <div style={{ background: T.s3, borderRadius: 99, height: 7 }}>
                <div style={{ background: mod.accent, height: 7, borderRadius: 99, width: `${modPct}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>Lesson Status</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
          {ALL_LESSONS.map(l => (
            <div key={l.id} title={l.title}
              style={{ background: completed[l.id] ? `${T.green}18` : T.s3, border: `1px solid ${completed[l.id] ? T.green + "40" : T.border}`, borderRadius: 7, padding: "8px", textAlign: "center" }}>
              {completed[l.id]
                ? <CheckCircle size={12} color={T.green} style={{ display: "block", margin: "0 auto 3px" }} />
                : <Circle size={12} color={T.dim} style={{ display: "block", margin: "0 auto 3px" }} />}
              <div style={{ fontSize: 10, color: completed[l.id] ? T.green : T.muted, lineHeight: 1.2 }}>
                {l.title.slice(0, 12)}{l.title.length > 12 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [completed, setCompleted] = useState({});
  const [activeLesson, setActiveLesson] = useState(ALL_LESSONS[0]);

  useEffect(() => {
    const el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(el);

    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      body, button, input, textarea, select {
        font-family: 'Outfit', 'Segoe UI', sans-serif !important;
      }
    `;
    document.head.appendChild(styleEl);
  }, []);

  const onComplete = (id) => setCompleted(p => ({ ...p, [id]: true }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Outfit','Segoe UI',sans-serif", color: T.text }}>
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard setPage={setPage} completed={completed} />}
        {page === "courses" && <CoursePage completed={completed} setPage={setPage} setLesson={setActiveLesson} />}
        {page === "lesson" && activeLesson && <LessonPage lesson={activeLesson} completed={completed} onComplete={onComplete} setPage={setPage} />}
        {page === "general-tutor" && <GeneralTutor />}
        {page === "coding-tutor" && <CodingTutor />}
        {page === "progress" && <ProgressPage completed={completed} />}
      </div>
    </div>
  );
}