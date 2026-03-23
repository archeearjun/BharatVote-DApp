import type { ComponentProps } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PrimaryButton from './PrimaryButton'

const renderPrimaryButton = (props: ComponentProps<typeof PrimaryButton> = {}) =>
  render(<PrimaryButton {...props}>{props.children || 'Button'}</PrimaryButton>)

describe('PrimaryButton', () => {
  it('renders button with children text', () => {
    renderPrimaryButton({ children: 'Click me' })
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    renderPrimaryButton({ onClick: handleClick, children: 'Click me' })
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when loading is true', () => {
    renderPrimaryButton({ loading: true, children: 'Loading button' })
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    renderPrimaryButton({ disabled: true, children: 'Disabled button' })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    renderPrimaryButton({ onClick: handleClick, disabled: true, children: 'Disabled button' })
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    renderPrimaryButton({ className: 'custom-class' })
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('renders with correct type attribute', () => {
    renderPrimaryButton({ type: 'submit', children: 'Submit' })
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('has proper default styling classes', () => {
    renderPrimaryButton()
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-primary')
  })
}) 
