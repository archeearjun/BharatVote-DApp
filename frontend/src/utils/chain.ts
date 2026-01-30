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

type AddEthereumChainParameter = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
};

function toHexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

export function getChainConfig(chainId: number): AddEthereumChainParameter | null {
  if (chainId === 11155111) {
    const rpcUrl =
      (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined) ||
      (import.meta.env.VITE_RPC_URL as string | undefined) ||
      "https://rpc.sepolia.org";

    return {
      chainId: toHexChainId(chainId),
      chainName: "Sepolia Test Network",
      nativeCurrency: {
        name: "Sepolia ETH",
        symbol: "SEP",
        decimals: 18,
      },
      rpcUrls: [rpcUrl],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    };
  }

  return null;
}
