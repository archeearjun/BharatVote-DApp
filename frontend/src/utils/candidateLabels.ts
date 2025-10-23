export type LangCode = 'en' | 'hi' | 'ta';

type CandidateLabelMap = Record<string, Partial<Record<LangCode, string>>>; // key: candidateId as string

const storageKey = (contractAddress: string) => `bv_candidate_labels_${contractAddress?.toLowerCase() || 'unknown'}`;

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

export function setCandidateLabels(contractAddress: string, id: number, labels: Partial<Record<LangCode, string>>): void {
  const all = getAllLabels(contractAddress);
  all[String(id)] = { ...(all[String(id)] || {}), ...labels };
  localStorage.setItem(storageKey(contractAddress), JSON.stringify(all));
}


