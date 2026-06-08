'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen, Brain, Code2, BarChart3, Home, Zap
} from 'lucide-react';
import { T } from '@/lib/lms-data';

const NAV = [
  { id: '/',              Icon: Home,      label: 'Dashboard'     },
  { id: '/courses',       Icon: BookOpen,  label: 'Courses'       },
  { id: '/general-tutor', Icon: Brain,     label: 'General Tutor' },
  { id: '/coding-tutor',  Icon: Code2,     label: 'Coding Tutor'  },
  { id: '/progress',      Icon: BarChart3, label: 'Progress'      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  // Derive active nav id: match exact path or parent path
  const isActive = (navId) => {
    if (navId === '/') return pathname === '/';
    return pathname.startsWith(navId);
  };

  return (
    <div style={{
      width: 220, minHeight: '100vh', background: T.s1,
      borderRight: `1px solid ${T.border}`, display: 'flex',
      flexDirection: 'column', padding: '24px 0', flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 20px 28px', borderBottom: `1px solid ${T.border}`, marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${T.accent}22`, border: `1px solid ${T.accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color={T.accent} />
          </div>
          <div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>LMS AI</div>
            <div style={{ color: T.muted, fontSize: 11 }}>Learning Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map(({ id, Icon, label }) => {
          const active = isActive(id);
          return (
            <button
              key={id}
              onClick={() => router.push(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 13px', borderRadius: 9, marginBottom: 3,
                background: active ? `${T.accent}18` : 'transparent',
                border: active ? `1px solid ${T.accent}30` : '1px solid transparent',
                color: active ? T.accent : T.muted, cursor: 'pointer',
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                letterSpacing: '-0.01em', transition: 'all 0.15s'
              }}
            >
              <Icon size={16} />{label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: `${T.purple}30`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: T.purple, fontWeight: 700
          }}>S</div>
          <div>
            <div style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>Student</div>
            <div style={{ color: T.muted, fontSize: 11 }}>Free Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
