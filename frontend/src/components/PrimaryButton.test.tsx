import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PrimaryButton from './PrimaryButton'

describe('PrimaryButton', () => {
  it('renders button with children text', () => {
    render(<PrimaryButton>Click me</PrimaryButton>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<PrimaryButton onClick={handleClick}>Click me</PrimaryButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when loading is true', () => {
    render(<PrimaryButton loading>Loading button</PrimaryButton>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<PrimaryButton disabled>Disabled button</PrimaryButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(
      <PrimaryButton onClick={handleClick} disabled>
        Disabled button
      </PrimaryButton>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<PrimaryButton className="custom-class">Button</PrimaryButton>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('renders with correct type attribute', () => {
    render(<PrimaryButton type="submit">Submit</PrimaryButton>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('has proper default styling classes', () => {
    render(<PrimaryButton>Button</PrimaryButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-emerald-600')
    expect(button).toHaveClass('text-white')
    expect(button).toHaveClass('font-semibold')
  })
}) 