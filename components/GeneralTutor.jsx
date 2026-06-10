'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Brain, Loader2, Sparkles, CheckCircle, Circle,
  ChevronRight, RotateCcw, Lightbulb, Lock, FlipHorizontal,
  Paperclip, Mic, BookOpen, Image, HelpCircle, Send
} from 'lucide-react';
import { T, AGENT_META_FULL, run4Agents, parseOutput } from '@/lib/lms-data';

const MODES   = ['Beginner', 'Exam', 'Interview', 'Revision'];
const LENGTHS = ['Short', 'Medium', 'Deep'];
const modeColors = { Beginner: T.green, Exam: T.accent, Interview: T.amber, Revision: T.purple };

const QUICK_TABS = [
  { id: 'explanation',  Icon: AlignLeft,  label: 'Explanation'  },
  { id: 'infographic',  Icon: Image,      label: 'Infographic'  },
  { id: 'quiz',         Icon: HelpCircle, label: 'Quiz'         },
  { id: 'flashcards',   Icon: FlipHorizontal, label: 'Flashcards' },
];

import { AlignLeft } from 'lucide-react';
import VoiceAgentView from '@/components/voice-tutor/VoiceAgentView';
import UnifiedSidebar from '@/components/voice-tutor/UnifiedSidebar';

export default function GeneralTutor() {
  const [topic,   setTopic]   = useState('');
  const [mode,    setMode]    = useState('Beginner');
  const [length,  setLength]  = useState('Medium');
  const [agents,  setAgents]  = useState([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [tab,     setTab]     = useState('explanation');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState(null);
  const [fcIdx,   setFcIdx]   = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatRef   = useRef(null);
  const inputRef  = useRef(null);
  const [textSessions, setTextSessions] = useState([]);
  const [voiceSessions, setVoiceSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const textSessKey = 'general-tutor-sessions';
  const voiceSessKey = 'voice-tutor-sessions';

  // Load both session types from localStorage on mount
  useEffect(() => {
    try {
      const raw1 = localStorage.getItem(textSessKey);
      if (raw1) setTextSessions(JSON.parse(raw1));
      const raw2 = localStorage.getItem(voiceSessKey);
      if (raw2) setVoiceSessions(JSON.parse(raw2));
    } catch {}
  }, []);

  // Merge both session types sorted by most recent
  const mergedSessions = useMemo(() => {
    const text = (textSessions || []).map(s => ({ ...s, type: 'text' }));
    const voice = (voiceSessions || []).map(s => ({ ...s, type: 'voice' }));
    const all = [...text, ...voice];
    all.sort((a, b) => {
      const ta = new Date(a.timestamp || a.startedAt || 0).getTime();
      const tb = new Date(b.timestamp || b.startedAt || 0).getTime();
      return tb - ta;
    });
    return all;
  }, [textSessions, voiceSessions]);

  const [voiceSessionToRestore, setVoiceSessionToRestore] = useState(null);

  const handleSelectSession = useCallback((session) => {
    if (session.type === 'voice') {
      setVoiceSessionToRestore(session);
      setShowVoiceAgent(true);
      return;
    }
    setMessages(session.messages || []);
    setResult(session.result || null);
    setMode(session.mode || 'Beginner');
    setLength(session.length || 'Medium');
    setTab(session.tab || 'explanation');
    setCurrentSessionId(session.id);
    setQuizIdx(0); setQuizAns(null); setFcIdx(0); setFcFlipped(false);
    setErr(''); setAgents([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
    setTopic('');
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return setErr('Please enter a topic.');
    setErr(''); setResult(null); setLoading(true);
    setAgents([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
    setMessages(prev => [...prev, { role: 'user', text: topic.trim(), mode, length }]);
    try {
      const finalText = await run4Agents(
        topic.trim(), mode, length,
        (i, status, out) => {
          setAgents(prev => prev.map((a, idx) => idx === i ? { s: status, out } : a));
          if (status === 'done' && i === 3) {
            setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }), 200);
          }
        }
      );
      const parsed = parseOutput(finalText);
      if (!parsed.explanation && !parsed.keyConcept) {
        throw new Error('The AI returned an unexpected format. Please try again.');
      }
      setResult(parsed);
      setTab('explanation');
      setQuizIdx(0); setQuizAns(null); setFcIdx(0); setFcFlipped(false);
      const newMessages = [...messages, { role: 'user', text: topic.trim(), mode, length }, { role: 'ai', text: parsed.explanation }];
      setMessages(newMessages);
      // Save session with the new data
      const label = topic.trim().slice(0, 40) || 'Untitled';
      const sid = currentSessionId || Date.now().toString(36);
      const session = { id: sid, label, topic: topic.trim(), mode, length, messages: newMessages, result: parsed, tab: 'explanation', timestamp: new Date().toISOString() };
      const updated = [session, ...textSessions.filter(s => s.id !== sid)];
      setTextSessions(updated);
      setCurrentSessionId(sid);
      try { localStorage.setItem(textSessKey, JSON.stringify(updated)); } catch {}
    } catch (e) {
      setErr(e.message || 'Error reaching the backend.');
    } finally {
      setLoading(false);
      setTopic('');
    }
  };

  // ── Quiz answer handler ──
  const handleQuizAnswer = (oi) => {
    if (quizAns !== null) return;
    setQuizAns(oi);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' }}>

      <UnifiedSidebar
        sessions={mergedSessions}
        onSelectSession={handleSelectSession}
        currentSessionId={currentSessionId}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── HEADER ── */}
      <div style={{ padding: '14px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: T.s1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `${T.purple}18`, border: `1px solid ${T.purple}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Brain size={18} color={T.purple} />
          </div>
          <div>
            <h2 style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>General Tutor</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>AI Tutor · Online</span>
              <Lock size={10} color={T.dim} />
            </div>
          </div>
        </div>
        {/* Mode / Depth selectors moved to bottom */}
      </div>

      {/* ── CHAT AREA ── */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 16px' }}>

        {/* Welcome AI message (always visible) */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 720 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `${T.purple}25`, border: `1px solid ${T.purple}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Brain size={16} color={T.purple} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.purple, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>LMS AI TUTOR</div>
            <div style={{ color: T.text, fontSize: 14, lineHeight: 1.7 }}>
              Hello! I'm your AI learning assistant. Tell me what you'd like to learn and I'll create personalised explanations, infographics, quizzes, and flashcards just for you.
            </div>
          </div>
        </div>

        {/* Conversation messages */}
        {messages.map((msg, mi) => (
          <div key={mi} style={{ marginBottom: 20 }}>
            {msg.role === 'user' ? (
              /* ── User bubble (right-aligned) ── */
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', maxWidth: 720, marginLeft: 'auto' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 4 }}>YOU</div>
                  <div style={{
                    background: T.s3, border: `1px solid ${T.border}`, borderRadius: '14px 14px 4px 14px',
                    padding: '12px 16px', color: T.text, fontSize: 14, lineHeight: 1.65, maxWidth: 480
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: T.dim, marginTop: 4 }}>{msg.mode} · {msg.length}</div>
                </div>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: T.s3,
                  border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, fontSize: 13, color: T.muted, fontWeight: 700
                }}>S</div>
              </div>
            ) : (
              /* ── AI bubble (left-aligned) ── */
              <div style={{ display: 'flex', gap: 12, maxWidth: 720 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${T.purple}25`, border: `1px solid ${T.purple}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Brain size={16} color={T.purple} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T.purple, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>LMS AI TUTOR</div>
                  <div style={{ color: T.text, fontSize: 14, lineHeight: 1.7 }}>
                    {msg.text || "I've prepared your learning content below. Explore each section!"}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ── AGENT PIPELINE ── */}
        {loading && (
          <div style={{ maxWidth: 720, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `${T.purple}25`, border: `1px solid ${T.purple}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Brain size={16} color={T.purple} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: T.purple, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>LMS AI TUTOR</div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 10, fontWeight: 600, letterSpacing: '0.06em' }}>4-AGENT PIPELINE PROCESSING…</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {AGENT_META_FULL.map((ag, i) => {
                    const s = agents[i]?.s;
                    const { Icon } = ag;
                    const isActive = s === 'loading';
                    const isDone   = s === 'done';
                    return (
                      <div key={i} style={{
                        background: isDone ? `${ag.color}10` : isActive ? `${ag.color}08` : T.s3,
                        border: `1px solid ${isDone ? ag.color + '40' : isActive ? ag.color + '30' : T.border}`,
                        borderRadius: 10, padding: '10px 12px', transition: 'all 0.3s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: `${ag.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={11} color={ag.color} />
                          </div>
                          {isDone ? <CheckCircle size={12} color={T.green} /> :
                            isActive ? <Loader2 size={12} color={ag.color} style={{ animation: 'spin 1s linear infinite' }} /> :
                              <Circle size={12} color={T.dim} />}
                        </div>
                        <div style={{ fontSize: 11, color: isDone ? T.text : T.muted, fontWeight: isDone || isActive ? 600 : 400, lineHeight: 1.2 }}>{ag.name}</div>
                        <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{ag.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {err && (
          <div style={{ maxWidth: 720, marginBottom: 16, color: T.red, fontSize: 12, background: `${T.red}12`, padding: '10px 14px', borderRadius: 8, border: `1px solid ${T.red}30` }}>
            ⚠️ {err}
          </div>
        )}

        {/* ── RESULTS CARD ── */}
        {result && (
          <div style={{
            maxWidth: 820, background: T.s1, border: `1px solid ${T.border}`,
            borderRadius: 14, overflow: 'hidden', marginBottom: 16
          }}>
            {/* Key concept banner */}
            {result.keyConcept && (
              <div style={{ background: `${T.purple}14`, borderBottom: `1px solid ${T.purple}25`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lightbulb size={15} color={T.purple} />
                <span style={{ fontSize: 13, color: T.purple, fontWeight: 600 }}>{result.keyConcept}</span>
              </div>
            )}

            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, padding: '0 8px' }}>
              {QUICK_TABS.map(({ id, Icon, label }) => (
                <button key={id} onClick={() => setTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '12px 14px',
                    background: 'transparent', border: 'none',
                    borderBottom: `2px solid ${tab === id ? T.accent : 'transparent'}`,
                    color: tab === id ? T.accent : T.muted, cursor: 'pointer',
                    fontSize: 13, fontWeight: tab === id ? 600 : 400, transition: 'all 0.15s'
                  }}>
                  <Icon size={14} />{label}
                  {id === 'quiz' && result.quizQuestions?.length > 0 && (
                    <span style={{ fontSize: 10, background: `${T.accent}25`, color: T.accent, borderRadius: 9, padding: '1px 6px' }}>{result.quizQuestions.length}</span>
                  )}
                  {id === 'flashcards' && result.flashcards?.length > 0 && (
                    <span style={{ fontSize: 10, background: `${T.green}25`, color: T.green, borderRadius: 9, padding: '1px 6px' }}>{result.flashcards.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px' }}>
              {/* ── Explanation tab ── */}
              {tab === 'explanation' && (
                <div>
                  <div style={{ color: T.text, fontSize: 14, lineHeight: 1.85, whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                    {result.explanation || <span style={{ color: T.muted, fontStyle: 'italic' }}>No explanation returned. Try again.</span>}
                  </div>
                  {result.analogy && (
                    <div style={{ background: `${T.amber}10`, border: `1px solid ${T.amber}25`, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 10 }}>
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
              {tab === 'infographic' && (
                <div>
                  {result.infoPoints?.length > 0 ? (
                    <>
                      <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Key concepts at a glance</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {result.infoPoints.map((pt, i) => {
                          const colors = [T.accent, T.green, T.purple, T.amber, T.red];
                          const icons  = ['🎯', '📌', '⚡', '🔑', '🌟', '💎', '🧩', '🚀'];
                          const c = colors[i % colors.length];
                          return (
                            <div key={i} style={{ background: T.s3, border: `1px solid ${c}25`, borderRadius: 11, padding: '16px', position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', top: -12, right: -12, width: 64, height: 64, borderRadius: '50%', background: `${c}08` }} />
                              <div style={{ fontSize: 22, marginBottom: 8 }}>{icons[i % icons.length]}</div>
                              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>{pt}</div>
                              <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: '100%', background: `linear-gradient(90deg,${c},transparent)` }} />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                      No infographic points were generated. Try regenerating with a different depth.
                    </div>
                  )}
                </div>
              )}

              {/* ── Quiz tab ── */}
              {tab === 'quiz' && (
                <div>
                  {result.quizQuestions?.length > 0 ? (() => {
                    const q = result.quizQuestions[quizIdx];
                    return q ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div style={{ fontSize: 13, color: T.muted }}>Question {quizIdx + 1} of {result.quizQuestions.length}</div>
                          <button onClick={() => { setQuizIdx(0); setQuizAns(null); }}
                            style={{ background: 'none', border: `1px solid ${T.border}`, color: T.muted, borderRadius: 7, padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <RotateCcw size={11} />Reset
                          </button>
                        </div>
                        <div style={{ color: T.text, fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{q.question}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {q.options.map((opt, oi) => {
                            const isSelected = quizAns === oi;
                            const isCorrect  = oi === q.correct;
                            const showResult = quizAns !== null;
                            let bg = T.s3, border = T.border, color = T.muted;
                            if (showResult && isCorrect)       { bg = `${T.green}18`;  border = `${T.green}50`;  color = T.green; }
                            else if (showResult && isSelected)  { bg = `${T.red}18`;    border = `${T.red}50`;    color = T.red; }
                            else if (!showResult && isSelected) { bg = `${T.accent}18`; border = `${T.accent}50`; color = T.accent; }
                            return (
                              <button key={oi}
                                onClick={() => handleQuizAnswer(oi)}
                                disabled={quizAns !== null}
                                style={{ background: bg, border: `1px solid ${border}`, borderRadius: 9, padding: '11px 16px', color, fontSize: 13, cursor: quizAns !== null ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                                <span style={{ fontWeight: 700, marginRight: 8 }}>{'ABCD'[oi]})</span>{opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizAns !== null && (
                          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: quizAns === q.correct ? T.green : T.red, fontWeight: 600 }}>
                              {quizAns === q.correct ? '✓ Correct!' : `✗ Incorrect — correct answer: ${'ABCD'[q.correct]}`}
                            </span>
                            {quizIdx < result.quizQuestions.length - 1 && (
                              <button onClick={() => { setQuizIdx(i => i + 1); setQuizAns(null); }}
                                style={{ background: T.accent, color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                Next <ChevronRight size={13} />
                              </button>
                            )}
                            {quizIdx === result.quizQuestions.length - 1 && (
                              <span style={{ fontSize: 12, color: T.muted }}>Quiz complete! 🎉</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })() : (
                    <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                      No quiz questions were generated. Try regenerating with Medium or Deep depth.
                    </div>
                  )}
                </div>
              )}

              {/* ── Flashcards tab ── */}
              {tab === 'flashcards' && (
                <div>
                  {result.flashcards?.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 13, color: T.muted }}>Card {fcIdx + 1} of {result.flashcards.length}</div>
                        <button onClick={() => { setFcIdx(0); setFcFlipped(false); }}
                          style={{ background: 'none', border: `1px solid ${T.border}`, color: T.muted, borderRadius: 7, padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <RotateCcw size={11} />Reset
                        </button>
                      </div>
                      <div onClick={() => setFcFlipped(!fcFlipped)} style={{ cursor: 'pointer' }}>
                        <div style={{
                          background: fcFlipped ? `${T.purple}15` : T.s3,
                          border: `1px solid ${fcFlipped ? T.purple + '40' : T.border}`,
                          borderRadius: 14, padding: '36px 28px', minHeight: 140,
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', textAlign: 'center', transition: 'all 0.3s'
                        }}>
                          <div style={{ fontSize: 11, color: T.muted, letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
                            {fcFlipped ? 'Answer' : 'Question — click to reveal'}
                          </div>
                          <div style={{ fontSize: 16, color: T.text, fontWeight: fcFlipped ? 400 : 600, lineHeight: 1.6 }}>
                            {fcFlipped ? result.flashcards[fcIdx]?.back : result.flashcards[fcIdx]?.front}
                          </div>
                          {!fcFlipped && <div style={{ marginTop: 14, fontSize: 11, color: T.dim }}>tap to flip</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                        <button onClick={() => { setFcIdx(i => (i - 1 + result.flashcards.length) % result.flashcards.length); setFcFlipped(false); }}
                          style={{ background: T.s3, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13 }}>
                          ← Prev
                        </button>
                        <button onClick={() => { setFcIdx(i => (i + 1) % result.flashcards.length); setFcFlipped(false); }}
                          style={{ background: T.s3, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13 }}>
                          Next →
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                        {result.flashcards.map((_, i) => (
                          <div key={i} onClick={() => { setFcIdx(i); setFcFlipped(false); }}
                            style={{ width: 7, height: 7, borderRadius: '50%', background: fcIdx === i ? T.purple : T.dim, cursor: 'pointer', transition: 'all 0.2s' }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                      No flashcards were generated. Try regenerating.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Follow-up: What would you like to generate? ── */}
        {result && (
          <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 8, maxWidth: 720 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${T.purple}25`, border: `1px solid ${T.purple}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Brain size={16} color={T.purple} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.purple, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>LMS AI TUTOR</div>
              <div style={{ color: T.text, fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
                Great! I've prepared your learning content above. Would you like to dive deeper? Pick an option below to generate more:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Explanation',  Icon: AlignLeft,      color: T.accent },
                  { label: 'Infographic',  Icon: Image,          color: T.green  },
                  { label: 'Quiz',         Icon: HelpCircle,     color: T.amber  },
                  { label: 'Flashcards',   Icon: FlipHorizontal, color: T.purple },
                ].map(({ label, Icon, color }) => (
                  <button key={label}
                    onClick={() => setTab(label.toLowerCase())}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '8px 16px', borderRadius: 20,
                      background: `${color}12`, border: `1px solid ${color}40`,
                      color: color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; }}
                  >
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM: Dropdowns + Input ── */}
      <div style={{ flexShrink: 0, borderTop: `1px solid ${T.border}`, background: T.s1, padding: '14px 28px 18px' }}>
        {/* ── Dropdown controls row (above input) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
          {/* Learning Mode dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.06em' }}>LEARNING MODE</label>
            <div style={{ position: 'relative' }}>
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                style={{
                  appearance: 'none',
                  background: T.s2,
                  border: `1px solid ${modeColors[mode] + '50' || T.border}`,
                  borderRadius: 8,
                  padding: '7px 34px 7px 12px',
                  color: modeColors[mode] || T.text,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: 130,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s'
                }}
              >
                {MODES.map(m => <option key={m} value={m} style={{ background: T.s1, color: T.text }}>{m}</option>)}
              </select>
              <ChevronRight
                size={13}
                color={modeColors[mode] || T.muted}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Response Depth dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.06em' }}>RESPONSE DEPTH</label>
            <div style={{ position: 'relative' }}>
              <select
                value={length}
                onChange={e => setLength(e.target.value)}
                style={{
                  appearance: 'none',
                  background: T.s2,
                  border: `1px solid ${length === 'Short' ? T.amber + '50' : length === 'Medium' ? T.accent + '50' : T.purple + '50'}`,
                  borderRadius: 8,
                  padding: '7px 34px 7px 12px',
                  color: length === 'Short' ? T.amber : length === 'Medium' ? T.accent : T.purple,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: 130,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s'
                }}
              >
                {LENGTHS.map(l => <option key={l} value={l} style={{ background: T.s1, color: T.text }}>{l}</option>)}
              </select>
              <ChevronRight
                size={13}
                color={length === 'Short' ? T.amber : length === 'Medium' ? T.accent : T.purple}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Active settings badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto',
            padding: '6px 14px', background: T.s2, border: `1px solid ${T.border}`, borderRadius: 20
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.04em' }}>
              {mode.toUpperCase()} · {length.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8,
            background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 14px'
          }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: '2px', display: 'flex', alignItems: 'center' }}>
              <Paperclip size={16} />
            </button>
            <button onClick={() => setShowVoiceAgent(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: '2px', display: 'flex', alignItems: 'center' }}
              title="Open Voice Tutor"
            >
              <Mic size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Type your message to the AI Tutor…"
              rows={1}
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleGenerate(); }}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: T.text, fontSize: 14, lineHeight: 1.6, resize: 'none',
                fontFamily: 'inherit', padding: 0, minHeight: 22, maxHeight: 120
              }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: 44, height: 44, borderRadius: 10,
              background: loading ? T.dim : T.purple, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0
            }}>
            {loading
              ? <Loader2 size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={18} color="#fff" />}
          </button>
        </div>
      </div>
      </div>
      {/* Voice Agent Overlay */}
      {showVoiceAgent && (
        <VoiceAgentView
          onClose={() => { setShowVoiceAgent(false); setVoiceSessionToRestore(null); }}
          initialSession={voiceSessionToRestore}
        />
      )}
    </div>
  );
}
