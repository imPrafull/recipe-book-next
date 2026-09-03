import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    isLimited: false,
    onNext: jest.fn(),
    onPrev: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page information', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    render(<Pagination {...defaultProps} page={1} />);
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should enable Previous button when not on first page', () => {
    render(<Pagination {...defaultProps} page={2} />);
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).not.toBeDisabled();
  });

  it('should disable Next button on last page when not limited', () => {
    render(<Pagination {...defaultProps} page={5} totalPages={5} isLimited={false} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should enable Next button on last page when limited (guest mode)', () => {
    render(<Pagination {...defaultProps} page={1} totalPages={1} isLimited={true} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onPrev when Previous button is clicked', () => {
    const onPrev = jest.fn();
    render(<Pagination {...defaultProps} page={2} onPrev={onPrev} />);
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);
    
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('should call onNext when Next button is clicked', () => {
    const onNext = jest.fn();
    render(<Pagination {...defaultProps} page={2} onNext={onNext} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should enable Next button when not on last page', () => {
    render(<Pagination {...defaultProps} page={3} totalPages={5} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should display correct page number in the middle', () => {
    render(<Pagination {...defaultProps} page={3} totalPages={10} />);
    
    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  });
});
