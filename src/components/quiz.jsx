import { useEffect, useState } from 'react';
import { LETTERS } from '../utils';
import { topicHue } from './Home';

export default function Quiz({ session, onFinish, onExit }) {
  const { questions } = session;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));

  const q = questions[index];
  const answered = answers.filter((a) => a !== null).length;
  const isLast = index === questions.length - 1;

  const choose = (i) =>
    setAnswers((prev) => prev.map((a, k) => (k === index ? i : a)));

  const finish = () => {
    const left = questions.length - answered;
    if (left > 0 && !window.confirm(`Без відповіді залишилось питань: ${left}. Завершити тест?`)) {
      return;
    }
    onFinish(answers);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) choose(Number(e.key) - 1);
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, questions.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="quiz" style={{ '--h': topicHue(session.topicId) }}>
      <div className="quiz-top">
        <button className="btn btn-ghost" onClick={onExit}>← Вийти</button>
        <span className="quiz-title">{session.title}</span>
        <span className="counter">{answered}/{questions.length}</span>
      </div>

      <div className="progress"><i style={{ width: `${(answered / questions.length) * 100}%` }} /></div>

      <div className="card question">
        <div className="q-label">Питання {index + 1} з {questions.length}</div>
        <h2>{q.text}</h2>
        <div className="options">
          {q.options.map((o, i) => (
            <button
              key={i}
              className={`option ${answers[index] === i ? 'selected' : ''}`}
              onClick={() => choose(i)}
            >
              <span className="letter">{LETTERS[i]}</span>
              <span>{o.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="nav">
        <button className="btn btn-ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Назад
        </button>
        {isLast ? (
          <button className="btn btn-primary" onClick={finish}>Завершити тест ✓</button>
        ) : (
          <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>Далі →</button>
        )}
      </div>

      <div className="dots" aria-label="Навігація по питаннях">
        {questions.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? 'current' : ''} ${answers[i] !== null ? 'done' : ''}`}
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {!isLast && answered === questions.length && (
        <button className="btn btn-success wide" onClick={finish}>Усе відповіли — завершити ✓</button>
      )}
    </div>
  );
}