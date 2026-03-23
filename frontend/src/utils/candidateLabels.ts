export type LangCode = 'en' | 'hi' | 'ta';

type CandidateLabelMap = Record<string, Partial<Record<LangCode, string>>>; // key: candidateId as string
const CANDIDATE_LABELS_STORAGE_PREFIX = 'bv_candidate_labels_';

const builtInCandidateLabels: Record<string, Partial<Record<LangCode, string>>> = {
  'Team Pineapple 🍍': {
    hi: 'टीम पाइनएप्पल 🍍',
    ta: 'பைனாப்பிள் அணி 🍍',
  },
  'No Pineapple 🍍': {
    hi: 'पाइनएप्पल नहीं 🍍',
    ta: 'பைனாப்பிள் வேண்டாம் 🍍',
  },
  Alice: {
    hi: 'ऐलिस',
    ta: 'அலிஸ்',
  },
  Bob: {
    hi: 'बॉब',
    ta: 'பாப்',
  },
};

const storageKey = (contractAddress: string) =>
  `${CANDIDATE_LABELS_STORAGE_PREFIX}${contractAddress?.toLowerCase() || 'unknown'}`;

export function getAllLabels(contractAddress: string): CandidateLabelMap {
  try {
    const raw = localStorage.getItem(storageKey(contractAddress));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCandidateLabel(contractAddress: string, id: number, lang: LangCode): string | undefined {
  const all = getAllLabels(contractAddress);
  return all[String(id)]?.[lang];
}

export function getCandidateDisplayName(
  contractAddress: string,
  id: number,
  lang: LangCode,
  fallbackName: string
): string {
  const stored = getCandidateLabel(contractAddress, id, lang);
  if (stored && stored.trim()) return stored.trim();

  const builtIn = builtInCandidateLabels[fallbackName]?.[lang];
  if (builtIn && builtIn.trim()) return builtIn.trim();

  return fallbackName;
}

export function setCandidateLabels(contractAddress: string, id: number, labels: Partial<Record<LangCode, string>>): void {
  const all = getAllLabels(contractAddress);
  all[String(id)] = { ...(all[String(id)] || {}), ...labels };
  localStorage.setItem(storageKey(contractAddress), JSON.stringify(all));
}

export function clearCandidateLabels(contractAddress: string): void {
  localStorage.removeItem(storageKey(contractAddress));
}


