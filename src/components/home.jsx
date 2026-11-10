// Різні відтінки для тем — щоб інтерфейс був різнокольоровим
const HUES = [255, 195, 160, 25, 330, 280, 215, 45, 135, 350];

export function topicHue(id) {
  return typeof id === 'number' ? HUES[(id - 1) % HUES.length] : 255;
}

export default function Home({ topics, best, onStartTopic, onStartMix }) {
  const total = topics.reduce((s, t) => s + t.questions.length, 0);
  const done = Object.keys(best).length;

  return (
    <>
      <section className="hero">
        <h1>Готуйся до тестів <span className="grad">без стресу</span></h1>
        <p>
          Обери тему, пройди тест, а в кінці отримай розбір: що було правильно,
          що ні, і чому. Результати зберігаються у вашому браузері.
        </p>
        <div className="stats">
          <div><b>{topics.length}</b><span>тем</span></div>
          <div><b>{total}</b><span>питань</span></div>
          <div><b>{done}</b><span>пройдено</span></div>
        </div>
        <button className="btn btn-primary" onClick={onStartMix}>
          🎲 Мікс з усіх тем (20 питань)
        </button>
      </section>

      <section className="grid">
        {topics.map((t) => {
          const b = best[t.id];
          return (
            <button
              key={t.id}
              className="topic-card"
              style={{ '--h': topicHue(t.id) }}
              onClick={() => onStartTopic(t)}
            >
              <span className="topic-num">{t.id}</span>
              <span className="topic-title">{t.title}</span>
              <span className="topic-meta">
                {t.questions.length} питань
                {b != null && <em className="badge">Кращий: {b}%</em>}
              </span>
              <span className="bar"><i style={{ width: `${b ?? 0}%` }} /></span>
            </button>
          );
        })}
      </section>
    </>
  );
}