function unquote(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseChainId(value: string | undefined | null, fallbackDecimal: number): number {
  if (!value) return fallbackDecimal;
  const cleaned = unquote(value);
  if (!cleaned) return fallbackDecimal;
  if (cleaned.startsWith("0x") || cleaned.startsWith("0X")) {
    const parsed = Number.parseInt(cleaned, 16);
    return Number.isFinite(parsed) ? parsed : fallbackDecimal;
  }
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : fallbackDecimal;
}

export function getExpectedChainId(): number {
  return parseChainId(import.meta.env.VITE_CHAIN_ID as string | undefined, 11155111);
}
