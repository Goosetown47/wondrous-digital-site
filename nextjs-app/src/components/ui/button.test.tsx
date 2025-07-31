import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByText('Secondary Button')
    expect(button).toHaveClass('bg-secondary')
  })

  it('applies size classes', () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByText('Small Button')
    expect(button).toHaveClass('h-9')
  })
})