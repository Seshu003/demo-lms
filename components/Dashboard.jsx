'use client';

import {
  BookOpen, Brain, CheckCircle, ChevronRight
} from 'lucide-react';
import { T, ALL_LESSONS } from '@/lib/lms-data';

export default function Dashboard({ completed = {} }) {
  const total = ALL_LESSONS.length;
  const done  = Object.values(completed).filter(Boolean).length;
  const pct   = Math.round((done / total) * 100);

  const stats = [
    { label: 'Lessons Completed', val: `${done}/${total}`, sub: `${pct}% done`,          color: T.accent, Icon: CheckCircle },
    { label: 'Modules Available',  val: '5',               sub: 'Python Fundamentals',   color: T.green,  Icon: BookOpen    },
    { label: 'AI Tools Ready',     val: '2',               sub: 'General + Coding Tutor',color: T.purple, Icon: Brain       },
  ];

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: T.text, fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.04em' }}>
          Build understanding,<br /><span style={{ color: T.accent }}>not just notes.</span>
        </h1>
        <p style={{ color: T.muted, marginTop: 8, fontSize: 15 }}>
          Your AI-powered learning workspace is ready.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map(({ label, val, sub, color, Icon }) => (
          <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: '-0.04em' }}>{val}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Course card */}
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>Python Fundamentals</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>5 modules · 15 lessons</div>
          <div style={{ background: T.s3, borderRadius: 99, height: 6, marginBottom: 8 }}>
            <div style={{ background: T.accent, height: 6, borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: T.muted }}>{pct}% complete</span>
            <a href="/courses" style={{ background: T.accent, color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              Continue <ChevronRight size={13} />
            </a>
          </div>
        </div>

        {/* Tutor card */}
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>General Tutor</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>Ask anything · Infographics · Quiz · Flashcards</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {['Beginner', 'Exam', 'Interview', 'Revision'].map(m => (
              <span key={m} style={{ fontSize: 11, color: T.purple, background: `${T.purple}18`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${T.purple}30` }}>{m}</span>
            ))}
          </div>
          <a href="/general-tutor" style={{ background: T.purple, color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
            Open Tutor <ChevronRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
