
import { describe, test, expect, beforeEach } from 'vitest';

import {
  shuffle,
  prepareQuestion,
  buildTopicSession,
  buildMixSession,
  buildRetrySession,
  countCorrect,
  loadBest,
  saveBest,
} from './utils';

// Очищаємо localStorage перед кожним тестом
beforeEach(() => {
  localStorage.clear();
});

// ========================================
// 1. ТЕСТИ ДЛЯ shuffle()
// ========================================

describe('shuffle()', () => {
  test('повинен повертати масив', () => {
    const result = shuffle([1, 2, 3]);

    expect(Array.isArray(result)).toBe(true);
  });

  test('повинен зберігати всі елементи масиву', () => {
    const result = shuffle([1, 2, 3, 4]);

    expect(result).toHaveLength(4);
    expect([...result].sort()).toEqual([1, 2, 3, 4]);
  });

  test('не повинен змінювати початковий масив', () => {
    const original = [1, 2, 3];

    shuffle(original);

    expect(original).toEqual([1, 2, 3]);
  });

  test('повинен працювати з порожнім масивом', () => {
    expect(shuffle([])).toEqual([]);
  });

  test('повинен працювати з одним елементом', () => {
    expect(shuffle([5])).toEqual([5]);
  });
});

// ========================================
// 2. ТЕСТИ ДЛЯ prepareQuestion()
// ========================================

describe('prepareQuestion()', () => {
  const topic = {
    id: 1,
    title: 'Основи тестування',
  };

  const question = {
    n: 2,
    text: 'Що таке тестування?',
    options: [
      'Перевірка ПЗ',
      'Створення дизайну',
      'Написання коду',
    ],
    answers: [0],
  };

  test('повинен правильно створювати ID питання', () => {
    const result = prepareQuestion(question, topic);

    expect(result.id).toBe('1-2');
  });

  test('повинен правильно вказувати ID теми', () => {
    const result = prepareQuestion(question, topic);

    expect(result.topicId).toBe(1);
  });

  test('повинен зберігати текст питання', () => {
    const result = prepareQuestion(question, topic);

    expect(result.text).toBe('Що таке тестування?');
  });

  test('повинен позначати правильну відповідь', () => {
    const result = prepareQuestion(question, topic);

    const correctOption = result.options.find(
      (option) => option.text === 'Перевірка ПЗ'
    );

    expect(correctOption.correct).toBe(true);
  });

  test('повинен позначати неправильну відповідь', () => {
    const result = prepareQuestion(question, topic);

    const wrongOption = result.options.find(
      (option) => option.text === 'Створення дизайну'
    );

    expect(wrongOption.correct).toBe(false);
  });

  test('повинен зберігати кількість варіантів відповідей', () => {
    const result = prepareQuestion(question, topic);

    expect(result.options).toHaveLength(3);
  });
});

// ========================================
// 3. ТЕСТИ ДЛЯ buildTopicSession()
// ========================================

describe('buildTopicSession()', () => {
  const topic = {
    id: 1,
    title: 'Основи QA',
    questions: [
      {
        n: 1,
        text: 'Що таке QA?',
        options: ['Тестування', 'Дизайн'],
        answers: [0],
      },
      {
        n: 2,
        text: 'Що таке баг?',
        options: ['Помилка', 'Функція'],
        answers: [0],
      },
    ],
  };

  test('повинен правильно створювати назву теми', () => {
    const result = buildTopicSession(topic);

    expect(result.title).toBe('Тема 1. Основи QA');
  });

  test('повинен правильно вказувати ID теми', () => {
    const result = buildTopicSession(topic);

    expect(result.topicId).toBe(1);
  });

  test('повинен створювати всі питання теми', () => {
    const result = buildTopicSession(topic);

    expect(result.questions).toHaveLength(2);
  });

  test('повинен правильно підготувати питання', () => {
    const result = buildTopicSession(topic);

    const question = result.questions.find((q) => q.id === '1-1');

    expect(question.text).toBe('Що таке QA?');
    expect(question.options).toHaveLength(2);
  });
});

// ========================================
// 4. ТЕСТИ ДЛЯ buildMixSession()
// ========================================

describe('buildMixSession()', () => {
  const topics = [
    {
      id: 1,
      title: 'QA',
      questions: [
        {
          n: 1,
          text: 'Питання 1',
          options: ['Так', 'Ні'],
          answers: [0],
        },
        {
          n: 2,
          text: 'Питання 2',
          options: ['Так', 'Ні'],
          answers: [1],
        },
      ],
    },
    {
      id: 2,
      title: 'Git',
      questions: [
        {
          n: 1,
          text: 'Питання 3',
          options: ['Так', 'Ні'],
          answers: [0],
        },
      ],
    },
  ];

  test('повинен створювати мікс з усіх тем', () => {
    const result = buildMixSession(topics);

    expect(result.topicId).toBe('mix');
    expect(result.questions).toHaveLength(3);
  });

  test('повинен правильно створювати назву міксу', () => {
    const result = buildMixSession(topics, 2);

    expect(result.title).toBe('Мікс з усіх тем · 2 питань');
  });

  test('повинен обмежувати кількість питань', () => {
    const result = buildMixSession(topics, 2);

    expect(result.questions).toHaveLength(2);
  });

  test('повинен брати питання з різних тем', () => {
    const result = buildMixSession(topics);

    const topicIds = result.questions.map((q) => q.topicId);

    expect(topicIds).toContain(1);
    expect(topicIds).toContain(2);
  });
});

// ========================================
// 5. ТЕСТИ ДЛЯ buildRetrySession()
// ========================================

describe('buildRetrySession()', () => {
  const session = {
    title: 'Тема 1. QA',
    topicId: 1,
    questions: [
      {
        id: '1-1',
        text: 'Питання 1',
        options: [
          { text: 'Так', correct: true },
          { text: 'Ні', correct: false },
        ],
      },
      {
        id: '1-2',
        text: 'Питання 2',
        options: [
          { text: 'Так', correct: true },
          { text: 'Ні', correct: false },
        ],
      },
      {
        id: '1-3',
        text: 'Питання 3',
        options: [
          { text: 'Так', correct: true },
          { text: 'Ні', correct: false },
        ],
      },
      {
        id: '1-4',
        text: 'Питання 4',
        options: [
          { text: 'Так', correct: true },
          { text: 'Ні', correct: false },
        ],
      },
    ],
  };

  test('повинен залишати тільки неправильні питання', () => {
    const answers = [0, 1, 0, 1];

    const result = buildRetrySession(session, answers);

    expect(result.questions).toHaveLength(2);
    expect(result.questions.map((q) => q.id)).toEqual(
      expect.arrayContaining(['1-2', '1-4'])
    );
  });

  test('повинен додавати питання без відповіді', () => {
    const answers = [0, undefined, 0, null];

    const result = buildRetrySession(session, answers);

    expect(result.questions).toHaveLength(2);
  });

  test('повинен правильно створювати назву роботи над помилками', () => {
    const result = buildRetrySession(session, [0, 1, 0, 0]);

    expect(result.title).toBe(
      'Робота над помилками · Тема 1. QA'
    );
  });

  test('повинен зберігати ID теми', () => {
    const result = buildRetrySession(session, [0, 1, 0, 0]);

    expect(result.topicId).toBe(1);
  });
});

// ========================================
// 6. ТЕСТИ ДЛЯ countCorrect()
// ========================================

describe('countCorrect()', () => {
  const session = {
    questions: [
      {
        options: [
          { text: 'Так', correct: true },
          { text: 'Ні', correct: false },
        ],
      },
      {
        options: [
          { text: 'Так', correct: true },
          { text: 'Ні', correct: false },
        ],
      },
      {
        options: [
          { text: 'Так', correct: true },
          { text: 'Ні', correct: false },
        ],
      },
    ],
  };

  test('повинен рахувати правильні відповіді', () => {
    const answers = [0, 1, 0];

    expect(countCorrect(session, answers)).toBe(2);
  });

  test('повинен повертати 0, якщо всі відповіді неправильні', () => {
    const answers = [1, 1, 1];

    expect(countCorrect(session, answers)).toBe(0);
  });

  test('повинен правильно рахувати пропущені питання', () => {
    const answers = [0, undefined, null];

    expect(countCorrect(session, answers)).toBe(1);
  });

  test('повинен повертати 0 для порожнього тесту', () => {
    expect(countCorrect({ questions: [] }, [])).toBe(0);
  });
});

// ========================================
// 7. ТЕСТИ ДЛЯ loadBest()
// ========================================

describe('loadBest()', () => {
  test('повинен повертати порожній об’єкт, якщо результатів немає', () => {
    expect(loadBest()).toEqual({});
  });

  test('повинен завантажувати збережені результати', () => {
    localStorage.setItem(
      'tests-best-v1',
      JSON.stringify({ 1: 90, 2: 80 })
    );

    expect(loadBest()).toEqual({ 1: 90, 2: 80 });
  });

  test('повинен повертати порожній об’єкт при неправильному JSON', () => {
    localStorage.setItem('tests-best-v1', 'неправильні дані');

    expect(loadBest()).toEqual({});
  });
});

// ========================================
// 8. ТЕСТИ ДЛЯ saveBest()
// ========================================

describe('saveBest()', () => {
  test('повинен зберігати новий результат', () => {
    const result = saveBest(1, 85);

    expect(result[1]).toBe(85);

    expect(JSON.parse(localStorage.getItem('tests-best-v1')))
      .toEqual({ 1: 85 });
  });

  test('повинен оновлювати результат, якщо новий кращий', () => {
    saveBest(1, 70);

    const result = saveBest(1, 90);

    expect(result[1]).toBe(90);
  });

  test('не повинен оновлювати результат, якщо новий гірший', () => {
    saveBest(1, 90);

    const result = saveBest(1, 70);

    expect(result[1]).toBe(90);
  });

  test('повинен зберігати результати різних тем', () => {
    saveBest(1, 85);
    saveBest(2, 95);

    const result = loadBest();

    expect(result).toEqual({
      1: 85,
      2: 95,
    });
  });
});
