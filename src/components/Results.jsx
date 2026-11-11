import { getResultImage } from '../resultImages';
import { useState, useMemo } from 'react';

import { LETTERS, countCorrect } from '../utils';
import { topicHue } from './Home';

function verdict(p) {
  if (p === 100) return 'Бездоганно! 🏆';
  if (p >= 80) return 'Чудовий результат! 🎉';
  if (p >= 60) return 'Непогано, є що підтягнути 💪';
  return 'Варто ще повторити тему 📚';
}

export default function Results({ session, answers, onRetry, onRetryWrong, onHome }) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const total = session.questions.length;
  const correct = countCorrect(session, answers);
  const percent = Math.round((correct / total) * 100);
  const image = useMemo(() => getResultImage(percent), [percent]);

  const items = session.questions
    .map((q, i) => ({ q, i, a: answers[i] }))
    .filter(({ q, a }) => !onlyWrong || a === null || !q.options[a].correct);

  return (
    <div className="results" style={{ '--h': topicHue(session.topicId) }}>
            <div className="card summary">
        <div className="ring" style={{ '--p': percent }}>
          <span>{percent}%</span>
        </div>
        <div>
          <h2>{verdict(percent)}</h2>
          <p>Правильних відповідей: <b>{correct}</b> із <b>{total}</b></p>
          <div className="actions">
            <button className="btn btn-primary" onClick={onRetry}>↻ Пройти ще раз</button>
            {correct < total && (
              <button className="btn btn-warn" onClick={onRetryWrong}>Працювати над помилками</button>
            )}
            <button className="btn btn-ghost" onClick={onHome}>До тем</button>
          </div>
        </div>
        <img className="summary-img" src={image} alt="" />   
      </div>

      
      <div className="filter">
        <h3>Розбір відповідей</h3>
        <label className="switch">
          <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
          <span>Лише помилки</span>
        </label>
      </div>

      {items.length === 0 && <div className="card empty">Помилок немає — так тримати! 🎯</div>}

      {items.map(({ q, i, a }) => {
        const ok = a !== null && q.options[a].correct;
        return (
          <div key={q.id + i} className={`card review ${ok ? 'ok' : 'bad'}`}>
            <div className="q-label">
              {ok ? '✓ Правильно' : a === null ? '✗ Без відповіді' : '✗ Неправильно'} · питання {i + 1}
            </div>
            <h4>{q.text}</h4>
            <ul>
              {q.options.map((o, k) => {
                const cls = o.correct ? 'right' : k === a ? 'wrong' : '';
                return (
                  <li key={k} className={cls}>
                    <span className="letter">{LETTERS[k]}</span>
                    <span>{o.text}</span>
                    {o.correct && <em>правильна відповідь</em>}
                    {k === a && !o.correct && <em>ваша відповідь</em>}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
