'use client';

import { useMemo } from 'react';
import { T } from '@/lib/lms-data';
import { Zap, ArrowLeft, Settings } from 'lucide-react';

function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  if (date >= today) return 'Today';
  if (date >= yesterday) return 'Yesterday';
  if (date >= weekStart) return 'This Week';
  return 'Older';
}

const subjectIcons = { math: '\u2211', science: '\u269B', languages: '\uD83C\uDF10', all: '\uD83D\uDCDA' };

export default function VoiceSidebar({ sessions, onSelectSession, onBack }) {
  const grouped = useMemo(() => {
    const groups = {};
    for (const session of sessions) {
      const label = getDateLabel(session.startedAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(session);
    }
    return groups;
  }, [sessions]);

  const orderedGroups = ['Today', 'Yesterday', 'This Week', 'Older'];

  return (
    <div style={{
      width: 260, minHeight: '100vh', background: T.s1,
      borderRight: `1px solid ${T.border}`, display: 'flex',
      flexDirection: 'column', flexShrink: 0
    }}>
      {/* Logo + Back */}
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          background: 'none', border: 'none', color: T.muted, cursor: 'pointer',
          fontSize: 12, padding: 0, fontFamily: 'inherit'
        }}>
          <ArrowLeft size={14} />
          <span>Back to General Tutor</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `${T.accent}22`, border: `1px solid ${T.accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={16} color={T.accent} />
          </div>
          <div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>LMS AI</div>
            <div style={{ color: T.muted, fontSize: 10 }}>Voice Tutor</div>
          </div>
        </div>
      </div>

      {/* Session History */}
      <nav style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
        {orderedGroups.map((group) => {
          const items = grouped[group];
          if (!items || items.length === 0) return null;
          return (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10, color: T.dim, fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '0 6px', marginBottom: 6
              }}>
                {group}
              </div>
              {items.map((session) => (
                <button key={session.id} onClick={() => onSelectSession(session)} style={{
                  width: '100%', textAlign: 'left', padding: '8px 10px',
                  borderRadius: 8, border: 'none', background: 'transparent',
                  color: T.muted, cursor: 'pointer', fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'inherit', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${T.s2}`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 11, opacity: 0.5, flexShrink: 0 }}>
                    {subjectIcons[session.subject] || '\uD83D\uDCC4'}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.label}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
        {(!sessions || sessions.length === 0) && (
          <div style={{ color: T.dim, fontSize: 11, textAlign: 'center', padding: '24px 0' }}>
            No sessions yet
          </div>
        )}
      </nav>

      {/* Bottom settings */}
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${T.border}` }}>
        <button style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRadius: 8, border: 'none',
          background: 'transparent', color: T.muted, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.s2; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
