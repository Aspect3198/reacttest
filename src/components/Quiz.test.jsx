import { vi, describe, test, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import Quiz from './Quiz';

// Замінюємо зовнішні залежності простими заглушками
vi.mock('../utils', () => ({ LETTERS: ['A', 'B', 'C', 'D'] }));
vi.mock('./Home', () => ({ topicHue: vi.fn(() => 200) }));

const makeSession = () => ({
  topicId: 'js',
  title: 'JavaScript basics',
  questions: [1, 2, 3].map((n) => ({
    text: `Q${n} text`,
    options: [1, 2, 3, 4].map((o) => ({ text: `Q${n} option ${o}` })),
  })),
});

const setup = (props = {}) => {
  const onFinish = vi.fn();
  const onExit = vi.fn();
  const user = userEvent.setup();
  render(<Quiz session={makeSession()} onFinish={onFinish} onExit={onExit} {...props} />);
  return { user, onFinish, onExit };
};

const optionButton = (text) => screen.getByText(text).closest('button');
const dot = (n) => screen.getByRole('button', { name: String(n) });

describe('Quiz', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('початковий стан', () => {
    test('показує назву, перше питання та лічильник 0/3', () => {
      setup();
      expect(screen.getByText('JavaScript basics')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Q1 text' })).toBeInTheDocument();
      expect(screen.getByText('Питання 1 з 3')).toBeInTheDocument();
      expect(screen.getByText('0/3')).toBeInTheDocument();
    });

    test('показує всі варіанти відповідей з літерами', () => {
      setup();
      expect(screen.getByText('Q1 option 1')).toBeInTheDocument();
      expect(screen.getByText('Q1 option 4')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    test('кнопка "Назад" неактивна на першому питанні', () => {
      setup();
      expect(screen.getByRole('button', { name: /Назад/ })).toBeDisabled();
    });

    test('передає hue теми в CSS-змінну', () => {
      const { container } = render(
        <Quiz session={makeSession()} onFinish={vi.fn()} onExit={vi.fn()} />
      );
      expect(container.querySelector('.quiz').style.getPropertyValue('--h')).toBe('200');
    });
  });

  describe('вибір відповіді', () => {
    test('клік по варіанту виділяє його і збільшує лічильник', async () => {
      const { user } = setup();
      await user.click(screen.getByText('Q1 option 2'));
      expect(optionButton('Q1 option 2')).toHaveClass('selected');
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    test('повторний вибір змінює відповідь, а лічильник не росте', async () => {
      const { user } = setup();
      await user.click(screen.getByText('Q1 option 1'));
      await user.click(screen.getByText('Q1 option 3'));
      expect(optionButton('Q1 option 1')).not.toHaveClass('selected');
      expect(optionButton('Q1 option 3')).toHaveClass('selected');
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    test('відповідь зберігається після переходу на інше питання і назад', async () => {
      const { user } = setup();
      await user.click(screen.getByText('Q1 option 2'));
      await user.click(screen.getByRole('button', { name: /Далі/ }));
      await user.click(screen.getByRole('button', { name: /Назад/ }));
      expect(optionButton('Q1 option 2')).toHaveClass('selected');
    });
  });

  describe('навігація', () => {
    test('"Далі" і "Назад" перемикають питання', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /Далі/ }));
      expect(screen.getByRole('heading', { name: 'Q2 text' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /Назад/ }));
      expect(screen.getByRole('heading', { name: 'Q1 text' })).toBeInTheDocument();
    });

    test('кружечки переводять на потрібне питання', async () => {
      const { user } = setup();
      await user.click(dot(3));
      expect(screen.getByRole('heading', { name: 'Q3 text' })).toBeInTheDocument();
    });

    test('кружечок відповіданого питання має клас done, поточний current', async () => {
      const { user } = setup();
      await user.click(screen.getByText('Q1 option 1'));
      expect(dot(1)).toHaveClass('current', 'done');
      expect(dot(2)).not.toHaveClass('done');
    });

    test('на останньому питанні замість "Далі" є "Завершити тест"', async () => {
      const { user } = setup();
      await user.click(dot(3));
      expect(screen.queryByRole('button', { name: /Далі/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Завершити тест/ })).toBeInTheDocument();
    });
  });

  describe('клавіатура', () => {
    test('цифри 1-4 обирають варіант', async () => {
      const { user } = setup();
      await user.keyboard('2');
      expect(optionButton('Q1 option 2')).toHaveClass('selected');
    });

    test('стрілки вправо/вліво перемикають питання', async () => {
      const { user } = setup();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('heading', { name: 'Q2 text' })).toBeInTheDocument();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('heading', { name: 'Q1 text' })).toBeInTheDocument();
    });

    test('стрілки не виходять за межі списку питань', async () => {
      const { user } = setup();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('heading', { name: 'Q1 text' })).toBeInTheDocument();
      await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
      expect(screen.getByRole('heading', { name: 'Q3 text' })).toBeInTheDocument();
    });

    test('слухач клавіатури знімається після розмонтування', async () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(
        <Quiz session={makeSession()} onFinish={vi.fn()} onExit={vi.fn()} />
      );
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('завершення тесту', () => {
    test('якщо відповіли на все, onFinish викликається без підтвердження', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm');
      const { user, onFinish } = setup();
      await user.click(screen.getByText('Q1 option 1'));
      await user.click(dot(2));
      await user.click(screen.getByText('Q2 option 2'));
      await user.click(dot(3));
      await user.click(screen.getByText('Q3 option 3'));
      await user.click(screen.getByRole('button', { name: /Завершити тест/ }));
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(onFinish).toHaveBeenCalledWith([0, 1, 2]);
    });

    test('є питання без відповіді і користувач підтвердив: onFinish з null', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const { user, onFinish } = setup();
      await user.click(screen.getByText('Q1 option 4'));
      await user.click(dot(3));
      await user.click(screen.getByRole('button', { name: /Завершити тест/ }));
      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('2'));
      expect(onFinish).toHaveBeenCalledWith([3, null, null]);
    });

    test('є питання без відповіді і користувач відмовився: onFinish не викликається', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const { user, onFinish } = setup();
      await user.click(dot(3));
      await user.click(screen.getByRole('button', { name: /Завершити тест/ }));
      expect(onFinish).not.toHaveBeenCalled();
    });

    test('кнопка "Усе відповіли" з\'являється, коли відповіли на все (не на останньому питанні)', async () => {
      const { user, onFinish } = setup();
      expect(screen.queryByRole('button', { name: /Усе відповіли/ })).not.toBeInTheDocument();

      await user.click(screen.getByText('Q1 option 1'));
      await user.click(dot(2));
      await user.click(screen.getByText('Q2 option 1'));
      await user.click(dot(3));
      await user.click(screen.getByText('Q3 option 1'));
      await user.click(dot(1));

      await user.click(screen.getByRole('button', { name: /Усе відповіли/ }));
      expect(onFinish).toHaveBeenCalledWith([0, 0, 0]);
    });
  });

  describe('вихід', () => {
    test('кнопка "Вийти" викликає onExit', async () => {
      const { user, onExit } = setup();
      await user.click(screen.getByRole('button', { name: /Вийти/ }));
      expect(onExit).toHaveBeenCalledTimes(1);
    });
  });
});
