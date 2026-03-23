import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import KycPage from './KycPage'
import { I18nProvider } from './i18n'

// Mock fetch globally with proper typing for Vitest
const mockFetch = vi.fn() as unknown as typeof fetch
// @ts-ignore override global for tests
global.fetch = mockFetch

const mockFetchResponse = (data: any, ok = true, status = 200) =>
  (mockFetch as any).mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  })

describe('KycPage', () => {
  const mockProps = {
    account: '0x01bad59740664445Fd489315E14F4300639c253b',
    onVerified: vi.fn(),
    setKycError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear?.()
  })

  const renderWithI18n = (ui: React.ReactElement) => render(
    <I18nProvider>
      {ui}
    </I18nProvider>
  )

  const getOtpInputs = () =>
    screen.getAllByRole('textbox').filter((input) =>
      input.getAttribute('maxLength') === '1'
    )

  it('renders the KYC form correctly', () => {
    renderWithI18n(<KycPage {...mockProps} />)
    
    expect(screen.getByText('BharatVote')).toBeInTheDocument()
    expect(screen.getByText('Voter Verification')).toBeInTheDocument()
    expect(screen.getByLabelText(/voter id/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue to otp/i })).toBeInTheDocument()
  })

  it('shows progress steps', () => {
    renderWithI18n(<KycPage {...mockProps} />)
    
    expect(screen.getByText('EPIC')).toBeInTheDocument()
    // Only the current step label is shown in the progress footer
    expect(screen.queryByText('OTP')).not.toBeInTheDocument()
    expect(screen.queryByText('Complete')).not.toBeInTheDocument()
  })

  it('shows the verification overview', () => {
    renderWithI18n(<KycPage {...mockProps} />)
    
    expect(screen.getByText('Connected wallet')).toBeInTheDocument()
    expect(screen.getByText('1. Verify voter ID')).toBeInTheDocument()
    expect(screen.getByText('2. Confirm OTP')).toBeInTheDocument()
    expect(screen.getByText('3. Complete face check')).toBeInTheDocument()
  })

  it('validates voter ID input', async () => {
    renderWithI18n(<KycPage {...mockProps} />)
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    
    fireEvent.click(sendButton)
    
    // Should not proceed without voter ID
    expect(fetch).not.toHaveBeenCalled()
  })

  it('handles successful KYC validation', async () => {
    const user = userEvent.setup()
    
    mockFetchResponse({
      eligible: true,
      address: '0x01bad59740664445Fd489315E14F4300639c253b'
    })

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER1')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      const callUrl = (fetch as any).mock.calls?.[0]?.[0] as string
      expect(callUrl).toContain('/api/kyc?voter_id=VOTER1')
      expect(callUrl).toContain(`address=${mockProps.account}`)
    })
  })

  it('verifies election-scoped access by wallet without requiring a voter ID', async () => {
    mockFetchResponse({
      eligible: true,
      address: '0x01bad59740664445Fd489315E14F4300639c253b',
      voterId: '0x01bad59740664445Fd489315E14F4300639c253b',
      verificationMode: 'wallet_allowlist',
    })

    renderWithI18n(
      <KycPage
        {...mockProps}
        electionAddress="0x1111111111111111111111111111111111111111"
      />
    )

    expect(screen.queryByLabelText(/voter id/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /verify wallet/i }))

    await waitFor(() => {
      const callUrl = (fetch as any).mock.calls?.[0]?.[0] as string
      expect(callUrl).toContain('/api/kyc?')
      expect(callUrl).toContain(`address=${mockProps.account}`)
      expect(callUrl).toContain('electionAddress=0x1111111111111111111111111111111111111111')
      expect(callUrl).not.toContain('voter_id=')
    })
  })

  it('handles KYC validation failure for invalid voter ID', async () => {
    const user = userEvent.setup()
    
    mockFetchResponse({
      eligible: false
    })

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'INVALID_VOTER')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/voter id not found/i)).toBeInTheDocument()
    })
  })

  it('handles address mismatch error', async () => {
    const user = userEvent.setup()
    
    mockFetchResponse({
      eligible: true,
      address: '0x1234567890123456789012345678901234567890' // Different address
    })

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER2')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/does not match the verified voter record/i)).toBeInTheDocument()
    })
  })

  it('shows OTP modal after successful KYC', async () => {
    const user = userEvent.setup()
    
    mockFetchResponse({
      eligible: true,
      address: '0x01bad59740664445Fd489315E14F4300639c253b'
    })

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER1')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/otp verification/i)).toBeInTheDocument()
    })
  })

  it('handles OTP input correctly', async () => {
    const user = userEvent.setup()
    
    // Mock successful KYC first
    mockFetchResponse({
      eligible: true,
      address: '0x01bad59740664445Fd489315E14F4300639c253b'
    })

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER1')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/otp verification/i)).toBeInTheDocument()
    })

    // Find OTP inputs
    const otpInputs = getOtpInputs()
    
    expect(otpInputs).toHaveLength(6)
  })

  it('handles successful OTP verification', async () => {
    const user = userEvent.setup()
    
    // Mock successful KYC
    mockFetchResponse({
      eligible: true,
      address: '0x01bad59740664445Fd489315E14F4300639c253b'
    })

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER1')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/otp verification/i)).toBeInTheDocument()
    })

    // Enter correct OTP for VOTER1
    const otpInputs = getOtpInputs()
    
    // Enter OTP: 123456
    await user.type(otpInputs[0], '1')
    await user.type(otpInputs[1], '2')
    await user.type(otpInputs[2], '3')
    await user.type(otpInputs[3], '4')
    await user.type(otpInputs[4], '5')
    await user.type(otpInputs[5], '6')

    const verifyButton = screen.getByText('Verify OTP')
    fireEvent.click(verifyButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /identity verified/i })).toBeInTheDocument()
    })

    // Should call onVerified after timeout
    await waitFor(() => {
      expect(mockProps.onVerified).toHaveBeenCalledWith('VOTER1')
    }, { timeout: 3000 })
  })

  it('handles incorrect OTP', async () => {
    const user = userEvent.setup()
    
    // Mock successful KYC
    mockFetchResponse({
      eligible: true,
      address: '0x01bad59740664445Fd489315E14F4300639c253b'
    })

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER1')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/otp verification/i)).toBeInTheDocument()
    })

    // Enter incorrect OTP
    const otpInputs = screen.getAllByRole('textbox').filter(input => 
      input.getAttribute('maxLength') === '1'
    )
    
    await user.type(otpInputs[0], '9')
    await user.type(otpInputs[1], '9')
    await user.type(otpInputs[2], '9')
    await user.type(otpInputs[3], '9')
    await user.type(otpInputs[4], '9')
    await user.type(otpInputs[5], '9')

    const verifyButton = screen.getByText('Verify OTP')
    fireEvent.click(verifyButton)

    await waitFor(() => {
      expect(screen.getByText(/otp code did not match/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during KYC validation', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    ;(mockFetch as any).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          status: 200,
          json: async () => ({ eligible: true, address: mockProps.account })
        }), 100)
      )
    )

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER1')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    // Should show loading state
    expect(sendButton).toBeDisabled()
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    
    ;(mockFetch as any).mockRejectedValueOnce(new Error('Network error'))

    renderWithI18n(<KycPage {...mockProps} />)
    
    const voterIdInput = screen.getByLabelText(/voter id/i)
    await user.type(voterIdInput, 'VOTER1')
    
    const sendButton = screen.getByRole('button', { name: /continue to otp/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })
}) 
