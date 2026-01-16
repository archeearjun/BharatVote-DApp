import { describe, it, expect } from 'vitest'
import { ethers } from 'ethers'
import { decodeVoteRevealedChoiceFromLogData } from './publicResultsEvents'

describe('decodeVoteRevealedChoiceFromLogData', () => {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()

  it('decodes choice for VoteRevealed(address,uint256)', () => {
    const data = abiCoder.encode(['uint256'], [2n])
    expect(decodeVoteRevealedChoiceFromLogData(data, abiCoder)).toBe(2)
  })

  it('decodes choice for VoteRevealed(address,uint256,uint256)', () => {
    const data = abiCoder.encode(['uint256', 'uint256'], [3n, 1710000000n])
    expect(decodeVoteRevealedChoiceFromLogData(data, abiCoder)).toBe(3)
  })

  it('returns null for malformed data', () => {
    expect(decodeVoteRevealedChoiceFromLogData('0x1234', abiCoder)).toBeNull()
  })
})

