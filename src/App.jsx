Claude
1794301594120_image.png
1794301602620_image.png
1794301609366_image.png
1794301639894_image.png
Тести_1-10_виправлено.docx
Тести_1-10_виправлено.docx
DOCX
у нас є проект який має працювати на github pages на основі React.js з файлами, які поки виводять лише Привіт світе, нам потрібно зробити проект сайту для підготовки до тем з предмету, де ти проходиш тести й в кінці отримуєш правильні відповіді щоб перевірити себе, наведи файли якщо ти хочеш щоб я скинув тобі їх вміст, дизайн сайту повинен бути сучасним, в декілька кольорів і зручний для використання з будь-якого девайсу

Спочатку гляну на файл з тестами, щоб зрозуміти його структуру.

Виконано команд: 10, прочитав файл, спільні файли
Сайт готовий. Усі 200 питань з вашого .docx (10 тем по 20) перенесені в topics.json, а для кожного питання я перевірив, що є 4 варіанти й рівно одна правильна відповідь. Код я перевірив лише на компіляцію, у браузері не запускав, тож після заміни файлів гляньте, як усе виглядає.

Куди покласти файли. Усе лежить у src/, структура така:

src/App.jsx, App.css, index.css замінюють ваші поточні файли.
src/utils.js нове.
src/components/Home.jsx, Quiz.jsx, Results.jsx нові.
src/data/topics.json нове, тут усі питання.
main.jsx змінювати не треба. Нових залежностей немає, тож package.json і deploy.yml лишаються як є.

Що вміє сайт:

Головна: 10 кольорових карток тем із вашим кращим результатом і смужкою прогресу. Є кнопка «Мікс з усіх тем» (20 випадкових питань).
Тест: одне питання на екрані, відповіді можна змінювати. Під час проходження правильність не показується. Є навігація по номерах питань, клавіші 1–4 для вибору й стрілки для переходу. Питання й варіанти щоразу перемішуються, тож позицію правильної відповіді не запам'ятаєш (в оригіналі «б» правильна приблизно в половині питань).
Результат: відсоток і розбір кожного питання, де правильна відповідь підсвічена зеленим, а ваша помилка червоним. Можна показати лише помилки, пройти тест ще раз або пройти тільки питання з помилками.
Дизайн: світла й темна тема (перемикач і автовибір за системою), адаптація під телефон, планшет і ПК.
Збереження: кращі результати та вибір теми лежать у localStorage вашого браузера.
Що перевірити в репозиторії. Щоб сайт на GitHub Pages відкривався, у vite.config.js має бути base: '/назва-репозиторію/'. Судячи з коміту «vite.config update2», це вже зроблено. Також змініть <title> в index.html на щось на кшталт «Підготовка до тестів». Якщо після деплою буде біла сторінка, надішліть вміст vite.config.js і deploy.yml, і я знайду причину.

Один зайвий збій у вихідному файлі: у темі 2, питання 14 жирним виділена лише частина рядка відповіді (після «г» не жирне). Я врахував це при розборі, але у .docx варто виправити.

App
Код
·JSX
App
Код
·CSS
Index
Код
·CSS
Utils
JS
Home
Код
·JSX
Quiz
Код
·JSX
Results
Код
·JSX
Topics
Код
·JSON




Claude — це ШІ, тож може помилятися. Будь ласка, перевіряйте відповіді.


App · JSX
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
 

Відповідь Claude завершено
