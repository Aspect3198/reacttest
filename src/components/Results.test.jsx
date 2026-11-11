import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Results from './Results';

afterEach(() => {
  cleanup();
});

vi.mock('../resultImages', () => ({
  getResultImage: vi.fn(() => 'test-image.jpg'),
}));

describe('Results', () => {
  const createSession = () => ({
    topicId: 1,
    title: 'Тестова тема',
    questions: [
      {
        id: 'q1',
        text: 'Перше питання?',
        options: [
          { text: 'Правильно 1', correct: true },
          { text: 'Неправильно 1', correct: false },
          { text: 'Неправильно 2', correct: false },
          { text: 'Неправильно 3', correct: false },
        ],
      },
      {
        id: 'q2',
        text: 'Друге питання?',
        options: [
          { text: 'Неправильно 1', correct: false },
          { text: 'Правильно 2', correct: true },
          { text: 'Неправильно 2', correct: false },
          { text: 'Неправильно 3', correct: false },
        ],
      },
      {
        id: 'q3',
        text: 'Третє питання?',
        options: [
          { text: 'Неправильно 1', correct: false },
          { text: 'Неправильно 2', correct: false },
          { text: 'Правильно 3', correct: true },
          { text: 'Неправильно 3', correct: false },
        ],
      },
    ],
  });

  const createProps = (answers = [0, 0, 2]) => ({
    session: createSession(),
    answers,
    onRetry: vi.fn(),
    onRetryWrong: vi.fn(),
    onHome: vi.fn(),
  });

  it('відображає компонент Results', () => {
    const { container } = render(<Results {...createProps()} />);
    expect(container.querySelector('.results')).toBeInTheDocument();
  });

  it('відображає заголовок розбору відповідей', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText('Розбір відповідей')).toBeInTheDocument();
  });

  it('відображає перше питання', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText('Перше питання?')).toBeInTheDocument();
  });

  it('відображає друге питання', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText('Друге питання?')).toBeInTheDocument();
  });

  it('відображає третє питання', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText('Третє питання?')).toBeInTheDocument();
  });

  it('відображає результат 67%', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText(/67\s*%/)).toBeInTheDocument();
  });

  it('відображає повідомлення про результат', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('відображає кількість правильних відповідей', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('відображає кнопку повторного проходження', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByRole('button', { name: /пройти ще раз/i })).toBeInTheDocument();
  });

  it('відображає кнопку роботи над помилками', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByRole('button', { name: /працювати над помилками/i })).toBeInTheDocument();
  });

  it('відображає кнопку повернення до тем', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByRole('button', { name: /до тем/i })).toBeInTheDocument();
  });

  it('викликає onRetry після натискання кнопки повторення', () => {
    const props = createProps();
    render(<Results {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /пройти ще раз/i }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it('викликає onRetryWrong після натискання кнопки помилок', () => {
    const props = createProps();
    render(<Results {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /працювати над помилками/i }));
    expect(props.onRetryWrong).toHaveBeenCalledTimes(1);
  });

  it('викликає onHome після натискання кнопки до тем', () => {
    const props = createProps();
    render(<Results {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /до тем/i }));
    expect(props.onHome).toHaveBeenCalledTimes(1);
  });

  it('відображає зображення результату', () => {
    const { container } = render(<Results {...createProps()} />);
    expect(container.querySelector('.summary-img')).toHaveAttribute('src', 'test-image.jpg');
  });

  it('відображає перемикач лише помилок', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('спочатку показує всі питання', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText('Перше питання?')).toBeInTheDocument();
    expect(screen.getByText('Друге питання?')).toBeInTheDocument();
    expect(screen.getByText('Третє питання?')).toBeInTheDocument();
  });

  it('після ввімкнення фільтра показує тільки неправильні питання', () => {
    render(<Results {...createProps([0, 0, 2])} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.queryByText('Перше питання?')).not.toBeInTheDocument();
    expect(screen.getByText('Друге питання?')).toBeInTheDocument();
    expect(screen.queryByText('Третє питання?')).not.toBeInTheDocument();
  });

  it('показує питання без відповіді у фільтрі помилок', () => {
    render(<Results {...createProps([0, null, 2])} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Друге питання?')).toBeInTheDocument();
  });

  it('при вимкненні фільтра знову показує всі питання', () => {
    render(<Results {...createProps([0, 0, 2])} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    expect(screen.getByText('Перше питання?')).toBeInTheDocument();
    expect(screen.getByText('Друге питання?')).toBeInTheDocument();
    expect(screen.getByText('Третє питання?')).toBeInTheDocument();
  });

  it('позначає неправильну відповідь', () => {
    const { container } = render(<Results {...createProps([0, 0, 2])} />);
    expect(container.querySelector('.review.bad')).toBeInTheDocument();
  });

  it('позначає правильну відповідь', () => {
    const { container } = render(<Results {...createProps([0, 0, 2])} />);
    expect(container.querySelector('.review.ok')).toBeInTheDocument();
  });

  it('відображає текст правильної відповіді', () => {
    render(<Results {...createProps()} />);
    expect(screen.getByText('Правильно 3')).toBeInTheDocument();
  });

  it('відображає позначку правильної відповіді', () => {
    render(<Results {...createProps()} />);
    expect(screen.getAllByText('правильна відповідь').length).toBeGreaterThan(0);
  });

  it('відображає позначку відповіді користувача', () => {
    render(<Results {...createProps([0, 0, 2])} />);
    expect(screen.getByText('ваша відповідь')).toBeInTheDocument();
  });
});

