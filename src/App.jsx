import { useEffect, useState } from 'react';
import topics from './data/topics.json';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Results from './components/Results';
import {
  buildMixSession,
  buildRetrySession,
  buildTopicSession,
  countCorrect,
  loadBest,
  saveBest,
} from './utils';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home'); // home | quiz | results
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [best, setBest] = useState(loadBest);
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
    } catch { /* ignore */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [dark]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [screen]);

  const start = (s) => { setSession(s); setAnswers([]); setScreen('quiz'); };

  const finish = (a) => {
    setAnswers(a);
    // «Роботу над помилками» у рекорди не рахуємо
    if (session.topicId !== undefined && !session.title.startsWith('Робота')) {
      const percent = Math.round((countCorrect(session, a) / session.questions.length) * 100);
      setBest(saveBest(session.topicId, percent));
    }
    setScreen('results');
  };

  const home = () => { setScreen('home'); setSession(null); };

  const restart = () => {
    const t = topics.find((x) => x.id === session.topicId);
    start(t ? buildTopicSession(t) : buildMixSession(topics));
  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={home}>
          <span className="logo-mark">✦</span> Тести
        </button>
        <button className="btn btn-ghost icon" onClick={() => setDark(!dark)} aria-label="Змінити тему">
          {dark ? '☀️' : '🌙'}
        </button>
      </header>

      <main>
        {screen === 'home' && (
          <Home
            topics={topics}
            best={best}
            onStartTopic={(t) => start(buildTopicSession(t))}
            onStartMix={() => start(buildMixSession(topics))}
          />
        )}
        {screen === 'quiz' && <Quiz key={session.title + session.questions.length} session={session} onFinish={finish} onExit={home} />}
        {screen === 'results' && (
          <Results
            session={session}
            answers={answers}
            onRetry={restart}
            onRetryWrong={() => start(buildRetrySession(session, answers))}
            onHome={home}
          />
        )}
      </main>

      <footer>Зроблено для підготовки до тем · працює на будь-якому пристрої</footer>
    </div>
  );
}