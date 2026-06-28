import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders its children', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies the destructive variant class', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>);
    expect(getByRole('button')).toHaveClass('bg-red-600');
  });

  it('can render as a child element via asChild', () => {
    const { getByRole } = render(
      <Button asChild>
        <a href="/x">Link</a>
      </Button>,
    );
    expect(getByRole('link', { name: 'Link' })).toBeInTheDocument();
  });

  it('is disabled when the disabled prop is set', () => {
    const { getByRole } = render(<Button disabled>Nope</Button>);
    expect(getByRole('button')).toBeDisabled();
  });
});
