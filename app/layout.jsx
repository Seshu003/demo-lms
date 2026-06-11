import { Outfit } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'LMS AI - Learning Platform',
  description: 'AI-powered learning workspace with courses, tutors, quizzes and flashcards',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#07080F' }}>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07080F', color: '#DDE3F2' }}>
          <Sidebar />
          <div className="sidebar-content-area" style={{ flex: 1, overflowY: 'auto', maxHeight: '100vh' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
