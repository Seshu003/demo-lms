'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain, CheckCircle, Circle, ChevronRight, Clock,
  Loader2, Sparkles, RotateCcw, ArrowLeft, Layers,
  Zap, Lightbulb, Target
} from 'lucide-react';
import { T, COURSE, ALL_LESSONS, AGENT_META, run4Agents, parseOutput } from '@/lib/lms-data';

export default function LessonPage({ lesson, completed = {}, onComplete }) {
  const router  = useRouter();
  const allIds  = ALL_LESSONS.map(l => l.id);
  const idx     = allIds.indexOf(lesson.id);
  const next    = ALL_LESSONS[idx + 1];
  const mod     = COURSE.modules.find(m => m.lessons.some(l => l.id === lesson.id));

  // Quiz states
  const [quiz,    setQuiz]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [agents,  setAgents]  = useState([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState(null);

  useEffect(() => {
    setQuiz(null); setLoading(false); setErr('');
    setAgents([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
    setQuizIdx(0); setQuizAns(null);
  }, [lesson.id]);

  const handleGenerateQuiz = async () => {
    setErr(''); setLoading(true);
    setAgents([{ s: 'idle' }, { s: 'idle' }, { s: 'idle' }, { s: 'idle' }]);
    try {
      const topic = `Python lesson: ${lesson.title}. Overview: ${lesson.overview}. Key points: ${lesson.pts.join(', ')}`;
      const finalText = await run4Agents(
        topic, 'Beginner', 'Medium',
        (i, status, out) => setAgents(prev => prev.map((a, idx) => idx === i ? { s: status, out } : a))
      );
      const parsed = parseOutput(finalText);
      if (!parsed.quizQuestions || parsed.quizQuestions.length === 0) {
        throw new Error('No quiz questions were returned by the AI. Please try again.');
      }
      setQuiz(parsed); setQuizIdx(0); setQuizAns(null);
    } catch (e) {
      setErr(e.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <button onClick={() => router.push('/courses')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 22, padding: 0 }}>
        <ArrowLeft size={15} /> Back to Course
      </button>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: mod?.accent || T.accent, background: `${mod?.accent || T.accent}18`, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
            {mod?.emoji} {mod?.title}
          </span>
        </div>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>{lesson.title}</h2>
        <div style={{ color: T.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={13} />{lesson.dur}
        </div>
      </div>

      {/* Video */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}`, marginBottom: 22 }}>
        <iframe
          width="100%" height="400"
          src={`https://www.youtube.com/embed/${lesson.vid}`}
          title={lesson.title} frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ display: 'block' }}
        />
      </div>

      {/* Overview + Key Points */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Overview</div>
          <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{lesson.overview}</p>
        </div>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Key Points</div>
          {lesson.pts.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 9 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: `${mod?.accent || T.accent}22`, border: `1px solid ${mod?.accent || T.accent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
              }}>
                <span style={{ fontSize: 9, color: mod?.accent || T.accent, fontWeight: 700 }}>{i + 1}</span>
              </div>
              <span style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Practice Quiz */}
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={16} color={T.purple} />
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>Interactive AI Practice Quiz</div>
          </div>
          {!quiz && !loading && (
            <button onClick={handleGenerateQuiz}
              style={{ background: T.purple, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} /> Generate Quiz
            </button>
          )}
        </div>

        {/* Agent pipeline status */}
        {loading && (
          <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, fontWeight: 600, letterSpacing: '0.05em' }}>GENERATING LESSON QUIZ...</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {AGENT_META.map((ag, i) => {
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {err && <div style={{ color: T.red, fontSize: 12, background: `${T.red}12`, padding: '8px 12px', borderRadius: 7 }}>⚠️ {err}</div>}

        {/* Quiz questions */}
        {quiz && quiz.quizQuestions?.length > 0 && (
          <div>
            {(() => {
              const q = quiz.quizQuestions[quizIdx];
              return q ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: T.muted }}>Question {quizIdx + 1} of {quiz.quizQuestions.length}</div>
                    <button onClick={() => { setQuizIdx(0); setQuizAns(null); }}
                      style={{ background: 'none', border: `1px solid ${T.border}`, color: T.muted, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RotateCcw size={10} /> Reset
                    </button>
                  </div>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>{q.question}</div>
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
                          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', color, fontSize: 12.5, cursor: quizAns !== null ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                          <span style={{ fontWeight: 700, marginRight: 8 }}>{'ABCD'[oi]})</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizAns !== null && (
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: quizAns === q.correct ? T.green : T.red, fontWeight: 600 }}>
                        {quizAns === q.correct ? '✓ Correct!' : `✗ Incorrect — correct answer: ${'ABCD'[q.correct]}`}
                      </span>
                      {quizIdx < quiz.quizQuestions.length - 1 && (
                        <button onClick={() => { setQuizIdx(i => i + 1); setQuizAns(null); }}
                          style={{ background: T.accent, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
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
          <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
            Test your understanding of this lesson by generating a custom quiz!
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {completed[lesson.id] ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.green, fontSize: 14, fontWeight: 600 }}>
            <CheckCircle size={18} /> Completed!
          </div>
        ) : (
          <button onClick={() => onComplete(lesson.id)}
            style={{ background: T.green, color: '#000', border: 'none', padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <CheckCircle size={15} /> Mark as Complete
          </button>
        )}
        {next && (
          <button onClick={() => router.push(`/lesson/${next.id}`)}
            style={{ background: T.s3, border: `1px solid ${T.border}`, color: T.text, padding: '11px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Next: {next.title} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
