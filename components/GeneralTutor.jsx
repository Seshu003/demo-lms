'use client';

import { useState, useRef } from 'react';
import {
  Brain, Loader2, Sparkles, CheckCircle, Circle,
  ChevronRight, RotateCcw, Lightbulb, Lock, FlipHorizontal
} from 'lucide-react';
import { T, AGENT_META_FULL, TABS, run4Agents, parseOutput } from '@/lib/lms-data';

const MODES   = ['Beginner', 'Exam', 'Interview', 'Revision'];
const LENGTHS = ['Short', 'Medium', 'Deep'];
const modeColors = { Beginner: T.green, Exam: T.accent, Interview: T.amber, Revision: T.purple };

export default function GeneralTutor() {
  const [topic,   setTopic]   = useState('');
  const [mode,    setMode]    = useState('Beginner');
  const [length,  setLength]  = useState('Medium');
  const [agents,  setAgents]  = useState([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [tab,     setTab]     = useState('explanation');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState(null);
  const [fcIdx,   setFcIdx]   = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const resultsRef = useRef(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return setErr('Please enter a topic.');
    setErr(''); setResult(null); setLoading(true);
    setAgents([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
    try {
      const finalText = await run4Agents(
        topic.trim(), mode, length,
        (i, status, out) => {
          setAgents(prev => prev.map((a, idx) => idx === i ? { s: status, out } : a));
          if (status === 'done' && i === 3) {
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
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
    } catch (e) {
      setErr(e.message || 'Error reaching the backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `${T.purple}22`, border: `1px solid ${T.purple}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Brain size={16} color={T.purple} />
          </div>
          <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>General Tutor</h2>
        </div>
        <p style={{ color: T.muted, margin: 0, fontSize: 13.5 }}>4-agent AI pipeline · Explanations · Infographics · Quizzes · Flashcards</p>
      </div>

      {/* Backend status pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '6px 12px', background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, width: 'fit-content' }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.green }} />
        <span style={{ fontSize: 12, color: T.muted }}>API key loaded from server · model: gemini-3.5-flash</span>
        <Lock size={11} color={T.dim} />
      </div>

      {/* Input card */}
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
        <textarea
          value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="What do you want to learn? e.g. 'Binary Search Trees', 'How does TCP/IP work?', 'Explain recursion'..."
          rows={3}
          style={{
            width: '100%', background: T.s3, border: `1px solid ${T.border}`,
            borderRadius: 9, padding: '11px 14px', color: T.text, fontSize: 14,
            resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box'
          }}
          onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleGenerate(); }}
        />

        <div style={{ display: 'flex', gap: 20, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Mode selector */}
          <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontWeight: 500, letterSpacing: '0.06em' }}>MODE</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {MODES.map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{
                    padding: '5px 12px', borderRadius: 7,
                    border: `1px solid ${mode === m ? modeColors[m] + '60' : T.border}`,
                    background: mode === m ? `${modeColors[m]}18` : 'transparent',
                    color: mode === m ? modeColors[m] : T.muted, cursor: 'pointer',
                    fontSize: 12, fontWeight: mode === m ? 600 : 400, transition: 'all 0.15s'
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Depth selector */}
          <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontWeight: 500, letterSpacing: '0.06em' }}>DEPTH</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {LENGTHS.map(l => (
                <button key={l} onClick={() => setLength(l)}
                  style={{
                    padding: '5px 12px', borderRadius: 7,
                    border: `1px solid ${length === l ? T.accent + '60' : T.border}`,
                    background: length === l ? `${T.accent}18` : 'transparent',
                    color: length === l ? T.accent : T.muted, cursor: 'pointer',
                    fontSize: 12, fontWeight: length === l ? 600 : 400, transition: 'all 0.15s'
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Active settings preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: T.dim, background: T.s3, padding: '3px 8px', borderRadius: 5, border: `1px solid ${T.border}` }}>
              {mode} · {length}
            </span>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerate} disabled={loading}
            style={{
              marginLeft: 'auto', background: loading ? T.dim : T.purple, color: '#fff',
              border: 'none', padding: '10px 22px', borderRadius: 9, fontSize: 13.5,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s'
            }}>
            {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
            {loading ? 'Thinking...' : 'Generate'}
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 10, color: T.red, fontSize: 12, background: `${T.red}12`, padding: '8px 12px', borderRadius: 7, lineHeight: 1.5 }}>
            ⚠️ {err}
          </div>
        )}
      </div>

      {/* Agent pipeline status */}
      {(loading || result) && (
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, fontWeight: 600, letterSpacing: '0.07em' }}>4-AGENT PIPELINE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {AGENT_META_FULL.map((ag, i) => {
              const s = agents[i]?.s;
              const { Icon } = ag;
              const isActive = s === 'loading';
              const isDone   = s === 'done';
              return (
                <div key={i} style={{
                  background: isDone ? `${ag.color}10` : isActive ? `${ag.color}08` : T.s3,
                  border: `1px solid ${isDone ? ag.color + '40' : isActive ? ag.color + '30' : T.border}`,
                  borderRadius: 10, padding: '12px 14px', transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${ag.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} color={ag.color} />
                    </div>
                    {isDone ? <CheckCircle size={14} color={T.green} /> :
                      isActive ? <Loader2 size={14} color={ag.color} style={{ animation: 'spin 1s linear infinite' }} /> :
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
        <div ref={resultsRef} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {/* Key concept banner */}
          {result.keyConcept && (
            <div style={{ background: `${T.purple}14`, borderBottom: `1px solid ${T.purple}25`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Lightbulb size={15} color={T.purple} />
              <span style={{ fontSize: 13, color: T.purple, fontWeight: 600 }}>{result.keyConcept}</span>
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, padding: '0 8px' }}>
            {TABS.map(({ id, Icon, label }) => (
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
                  return (
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
                          if (showResult && isCorrect)  { bg = `${T.green}18`;  border = `${T.green}50`;  color = T.green; }
                          else if (showResult && isSelected) { bg = `${T.red}18`;   border = `${T.red}50`;   color = T.red; }
                          else if (!showResult && isSelected) { bg = `${T.accent}18`; border = `${T.accent}50`; color = T.accent; }
                          return (
                            <button key={oi}
                              onClick={() => { if (quizAns === null) setQuizAns(oi); }}
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
                  );
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
                    {/* Dot indicators */}
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
    </div>
  );
}
