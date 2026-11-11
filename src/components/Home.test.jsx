
import { describe, test, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import Home, { topicHue } from './Home';

// Тестові теми
const makeTopics = () => [
  {
    id: 1,
    title: 'JavaScript',
    questions: [{}, {}, {}],
  },
  {
    id: 2,
    title: 'React',
    questions: [{}, {}, {}, {}],
  },
  {
    id: 3,
    title: 'HTML',
    questions: [{}, {}],
  },
];

// Допоміжна функція для рендерингу
const setup = (props = {}) => {
  const topics = makeTopics();
  const onStartTopic = vi.fn();
  const onStartMix = vi.fn();

  const user = userEvent.setup();

  render(
    <Home
      topics={topics}
      best={{ 1: 85 }}
      onStartTopic={onStartTopic}
      onStartMix={onStartMix}
      {...props}
    />
  );

  return {
    user,
    topics,
    onStartTopic,
    onStartMix,
  };
};

// Отримання кнопки теми
const getTopicCard = (title) => {
  return screen.getByText(title).closest('button');
};

describe('Home', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // 1. Початковий стан
  describe('початковий стан', () => {
    test('показує головний заголовок сторінки', () => {
      setup();

      expect(
        screen.getByRole('heading', {
          name: /Готуйся до тестів без стресу/,
        })
      ).toBeInTheDocument();
    });

    test('показує опис головної сторінки', () => {
      setup();

      expect(
        screen.getByText(/Обери тему, пройди тест/)
      ).toBeInTheDocument();

      expect(
        screen.getByText(/Результати зберігаються у вашому браузері/)
      ).toBeInTheDocument();
    });

    test('показує правильну кількість тем, питань та пройдених тестів', () => {
      const { container } = render(
        <Home
          topics={makeTopics()}
          best={{ 1: 85 }}
          onStartTopic={vi.fn()}
          onStartMix={vi.fn()}
        />
      );

      const stats = container.querySelectorAll('.stats b');

      expect(stats[0]).toHaveTextContent('3');
      expect(stats[1]).toHaveTextContent('9');
      expect(stats[2]).toHaveTextContent('1');
    });

    test('показує кнопку запуску міксу', () => {
      setup();

      expect(
        screen.getByRole('button', {
          name: /Мікс з усіх тем \(20 питань\)/,
        })
      ).toBeInTheDocument();
    });

    test('показує всі картки тем', () => {
      setup();

      expect(getTopicCard('JavaScript')).toBeInTheDocument();
      expect(getTopicCard('React')).toBeInTheDocument();
      expect(getTopicCard('HTML')).toBeInTheDocument();
    });

    test('показує правильну кількість питань у кожній темі', () => {
      setup();

      expect(
        within(getTopicCard('JavaScript')).getByText(/3 питань/)
      ).toBeInTheDocument();

      expect(
        within(getTopicCard('React')).getByText(/4 питань/)
      ).toBeInTheDocument();

      expect(
        within(getTopicCard('HTML')).getByText(/2 питань/)
      ).toBeInTheDocument();
    });
  });

  // 2. Статистика результатів
  describe('статистика результатів', () => {
    test('показує найкращий результат для теми', () => {
      setup();

      expect(
        screen.getByText('Кращий: 85%')
      ).toBeInTheDocument();
    });

    test('не показує результат, якщо тема ще не пройдена', () => {
      setup({ best: {} });

      expect(
        screen.queryByText(/Кращий:/)
      ).not.toBeInTheDocument();
    });

    test('показує кількість пройдених тем', () => {
      const { container } = render(
        <Home
          topics={makeTopics()}
          best={{ 1: 85, 2: 90 }}
          onStartTopic={vi.fn()}
          onStartMix={vi.fn()}
        />
      );

      expect(container.querySelectorAll('.stats b')[2])
        .toHaveTextContent('2');
    });

    test('показує прогрес теми у вигляді смуги', () => {
      setup();

      const progress = getTopicCard('JavaScript')
        .querySelector('.bar i');

      expect(progress).toHaveStyle({ width: '85%' });
    });

    test('для непройденої теми прогрес дорівнює 0%', () => {
      setup({ best: {} });

      const progress = getTopicCard('React')
        .querySelector('.bar i');

      expect(progress).toHaveStyle({ width: '0%' });
    });
  });

  // 3. Вибір теми
  describe('вибір теми', () => {
    test('клік по картці JavaScript викликає onStartTopic', async () => {
      const { user, onStartTopic, topics } = setup();

      await user.click(getTopicCard('JavaScript'));

      expect(onStartTopic).toHaveBeenCalledTimes(1);
      expect(onStartTopic).toHaveBeenCalledWith(topics[0]);
    });

    test('клік по картці React викликає onStartTopic з правильною темою', async () => {
      const { user, onStartTopic, topics } = setup();

      await user.click(getTopicCard('React'));

      expect(onStartTopic).toHaveBeenCalledTimes(1);
      expect(onStartTopic).toHaveBeenCalledWith(topics[1]);
    });

    test('клік по картці HTML викликає onStartTopic з правильною темою', async () => {
      const { user, onStartTopic, topics } = setup();

      await user.click(getTopicCard('HTML'));

      expect(onStartTopic).toHaveBeenCalledTimes(1);
      expect(onStartTopic).toHaveBeenCalledWith(topics[2]);
    });

    test('клік по темі не запускає мікс', async () => {
      const { user, onStartTopic, onStartMix } = setup();

      await user.click(getTopicCard('JavaScript'));

      expect(onStartTopic).toHaveBeenCalledTimes(1);
      expect(onStartMix).not.toHaveBeenCalled();
    });
  });

  // 4. Запуск міксу
  describe('запуск міксу', () => {
    test('клік по кнопці міксу викликає onStartMix', async () => {
      const { user, onStartMix } = setup();

      const mixButton = screen.getByRole('button', {
        name: /Мікс з усіх тем/,
      });

      await user.click(mixButton);

      expect(onStartMix).toHaveBeenCalledTimes(1);
    });

    test('запуск міксу не викликає вибір окремої теми', async () => {
      const { user, onStartMix, onStartTopic } = setup();

      const mixButton = screen.getByRole('button', {
        name: /Мікс з усіх тем/,
      });

      await user.click(mixButton);

      expect(onStartMix).toHaveBeenCalledTimes(1);
      expect(onStartTopic).not.toHaveBeenCalled();
    });
  });

  // 5. Кольори тем
  describe('кольори тем', () => {
    test('для першої теми повертає відтінок 255', () => {
      expect(topicHue(1)).toBe(255);
    });

    test('для другої теми повертає відтінок 195', () => {
      expect(topicHue(2)).toBe(195);
    });

    test('для десятої теми повертає відтінок 350', () => {
      expect(topicHue(10)).toBe(350);
    });

    test('для одинадцятої теми повторює перший відтінок', () => {
      expect(topicHue(11)).toBe(255);
    });

    test('для текстового ID повертає стандартний відтінок 255', () => {
      expect(topicHue('JavaScript')).toBe(255);
    });

    test('картка теми отримує правильний колір через CSS-змінну', () => {
      const { container } = render(
        <Home
          topics={makeTopics()}
          best={{}}
          onStartTopic={vi.fn()}
          onStartMix={vi.fn()}
        />
      );

      const firstCard = container.querySelector('.topic-card');

      expect(firstCard.style.getPropertyValue('--h')).toBe('255');
    });
  });

  // 6. Відображення тем
  describe('відображення тем', () => {
    test('кожна картка має номер теми', () => {
      setup();

      const javascriptCard = getTopicCard('JavaScript');
      const reactCard = getTopicCard('React');
      const htmlCard = getTopicCard('HTML');

      expect(
        within(javascriptCard).getByText('1', {
          selector: '.topic-num',
        })
      ).toBeInTheDocument();

      expect(
        within(reactCard).getByText('2', {
          selector: '.topic-num',
        })
      ).toBeInTheDocument();

      expect(
        within(htmlCard).getByText('3', {
          selector: '.topic-num',
        })
      ).toBeInTheDocument();
    });

    test('кожна картка має клас topic-card', () => {
      setup();

      expect(getTopicCard('JavaScript')).toHaveClass('topic-card');
      expect(getTopicCard('React')).toHaveClass('topic-card');
      expect(getTopicCard('HTML')).toHaveClass('topic-card');
    });

    test('показує всі картки відповідно до переданих тем', () => {
      const { container } = render(
        <Home
          topics={makeTopics()}
          best={{}}
          onStartTopic={vi.fn()}
          onStartMix={vi.fn()}
        />
      );

      expect(
        container.querySelectorAll('.topic-card')
      ).toHaveLength(3);
    });
  });
});
