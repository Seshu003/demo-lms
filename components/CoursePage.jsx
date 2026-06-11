'use client';

import {
  CheckCircle, Circle, Clock, Play
} from 'lucide-react';
import { T, COURSE, ALL_LESSONS } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';

export default function CoursePage({ completed = {} }) {
  const total = ALL_LESSONS.length;
  const done  = Object.values(completed).filter(Boolean).length;
  const isMobile = useMediaQuery(isMobileMQ);
  const rPad = isMobile ? 16 : 36;

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          {COURSE.title}
        </h2>
        <p style={{ color: T.muted, margin: 0, fontSize: 14 }}>
          {COURSE.tagline} · {done}/{total} lessons completed
        </p>
        <div style={{ background: T.s3, borderRadius: 99, height: 5, marginTop: 12, width: '100%' }}>
          <div style={{
            background: T.accent, height: 5, borderRadius: 99,
            width: `${Math.round((done / total) * 100)}%`, transition: 'width 0.4s'
          }} />
        </div>
      </div>

      {/* Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {COURSE.modules.map((mod, mi) => {
          const modDone = mod.lessons.filter(l => completed[l.id]).length;
          return (
            <div key={mod.id} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
              {/* Module header */}
              <div style={{
                padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `${mod.accent}18`, border: `1px solid ${mod.accent}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>{mod.emoji}</div>
                  <div>
                    <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{mi + 1}. {mod.title}</div>
                    <div style={{ color: T.muted, fontSize: 12 }}>{mod.lessons.length} lessons · {modDone} completed</div>
                  </div>
                </div>
                {/* Circular progress */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="36" height="36" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke={T.s3} strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke={mod.accent} strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - modDone / mod.lessons.length)}`}
                      strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 10, color: mod.accent, fontWeight: 700, position: 'relative' }}>
                    {Math.round((modDone / mod.lessons.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Lessons */}
              <div>
                {mod.lessons.map((lesson, li) => (
                  <a
                    key={lesson.id}
                    href={`/lesson/${lesson.id}`}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '13px 20px',
                      background: 'transparent', border: 'none',
                      borderBottom: li < mod.lessons.length - 1 ? `1px solid ${T.border}` : 'none',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.s3}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {completed[lesson.id]
                        ? <CheckCircle size={16} color={T.green} />
                        : <Circle size={16} color={T.dim} />}
                      <div>
                        <div style={{ color: T.text, fontSize: 13.5, fontWeight: 500 }}>{lesson.title}</div>
                        <div style={{ color: T.muted, fontSize: 12, marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={11} />{lesson.dur}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {completed[lesson.id] && (
                        <span style={{ fontSize: 11, color: T.green, background: `${T.green}18`, padding: '2px 8px', borderRadius: 20 }}>Done</span>
                      )}
                      <Play size={14} color={T.muted} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
