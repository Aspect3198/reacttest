export const LETTERS = ['а', 'б', 'в', 'г'];

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Готує питання: перемішує варіанти, щоб не запам'ятовувалась позиція відповіді
export function prepareQuestion(q, topic) {
  return {
    id: `${topic.id}-${q.n}`,
    topicId: topic.id,
    text: q.text,
    options: shuffle(
      q.options.map((text, i) => ({ text, correct: q.answers.includes(i) }))
    ),
  };
}

export function buildTopicSession(topic) {
  return {
    title: `Тема ${topic.id}. ${topic.title}`,
    topicId: topic.id,
    questions: shuffle(topic.questions.map((q) => prepareQuestion(q, topic))),
  };
}

export function buildMixSession(topics, count = 20) {
  const all = topics.flatMap((t) => t.questions.map((q) => prepareQuestion(q, t)));
  return {
    title: `Мікс з усіх тем · ${count} питань`,
    topicId: 'mix',
    questions: shuffle(all).slice(0, count),
  };
}

export function buildRetrySession(session, answers) {
  const wrong = session.questions.filter((q, i) => {
    const a = answers[i];
    return a === undefined || a === null || !q.options[a].correct;
  });
  return {
    title: `Робота над помилками · ${session.title}`,
    topicId: session.topicId,
    questions: shuffle(wrong.map((q) => ({ ...q, options: shuffle(q.options) }))),
  };
}

export function countCorrect(session, answers) {
  return session.questions.reduce(
    (sum, q, i) => sum + (answers[i] != null && q.options[answers[i]].correct ? 1 : 0),
    0
  );
}

const KEY = 'tests-best-v1';

export function loadBest() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveBest(topicId, percent) {
  try {
    const best = loadBest();
    if (best[topicId] == null || percent > best[topicId]) {
      best[topicId] = percent;
      localStorage.setItem(KEY, JSON.stringify(best));
    }
    return best;
  } catch {
    return {};
  }
}
