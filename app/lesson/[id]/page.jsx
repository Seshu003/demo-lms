'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ALL_LESSONS } from '@/lib/lms-data';
import LessonPage from '@/components/LessonPage';

export default function LessonRoute() {
  const { id } = useParams();
  const router = useRouter();
  const [completed, setCompleted] = useState({});

  const lesson = ALL_LESSONS.find(l => l.id === id);

  if (!lesson) {
    return (
      <div style={{ padding: '60px 36px', textAlign: 'center', color: '#647298' }}>
        <h2>Lesson not found</h2>
        <button onClick={() => router.push('/courses')}
          style={{ marginTop: 16, background: '#5B8CF8', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          Back to Courses
        </button>
      </div>
    );
  }

  const onComplete = (lessonId) => setCompleted(prev => ({ ...prev, [lessonId]: true }));

  return (
    <LessonPage
      lesson={lesson}
      completed={completed}
      onComplete={onComplete}
    />
  );
}
