import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFactoryAddress, getFactoryContract } from "@/utils/contract";
import useWallet from "@/useWallet";
import PrimaryButton from "@/components/PrimaryButton";

export default function CreateElection() {
  const navigate = useNavigate();
  const { connect, isConnected, isLoading, provider } = useWallet();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdAddress, setCreatedAddress] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const factoryAddress = useMemo(() => getFactoryAddress(), []);
  const explorerTxUrl = txHash ? `https://sepolia.etherscan.io/tx/${txHash}` : null;
  const loadingText = !isConnected
    ? "Connecting..."
    : txHash
      ? "Waiting for confirmation..."
      : "Confirm in MetaMask...";

  const onCreate = async () => {
    setError(null);
    setCreatedAddress(null);
    setTxHash(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter an election name");
      return;
    }

    setIsCreating(true);
    try {
      const connectResult = isConnected ? null : await connect();
      const providerToUse = connectResult?.provider || provider;
      if (!providerToUse) {
        setError("Wallet provider not available");
        return;
      }

      const signer = await providerToUse.getSigner();
      const factory = getFactoryContract(signer);

      const tx = await factory.createElection(trimmedName);
      setTxHash(tx.hash);
      const receipt = await tx.wait();

      const electionCreatedTopic = factory.interface.getEvent("ElectionCreated").topicHash;
      const electionAddress =
        receipt.logs
          .map((log) => {
            try {
              if (log.address.toLowerCase() !== factoryAddress.toLowerCase()) return null;
              if (log.topics?.[0]?.toLowerCase() !== electionCreatedTopic.toLowerCase()) return null;
              const parsed = factory.interface.parseLog(log);
              if (parsed?.name !== "ElectionCreated") return null;
              return parsed.args.election as string;
            } catch {
              return null;
            }
          })
          .find((addr): addr is string => Boolean(addr)) ||
        receipt.logs
          .map((log) => {
            try {
              if (log.address.toLowerCase() !== factoryAddress.toLowerCase()) return null;
              const parsed = factory.interface.parseLog(log);
              if (parsed?.name !== "ElectionCreated") return null;
              return parsed.args.election as string;
            } catch {
              return null;
            }
          })
          .find((addr): addr is string => Boolean(addr));

      if (!electionAddress) {
        setError("ElectionCreated event not found in transaction receipt");
        return;
      }

      localStorage.setItem("bv_last_election", electionAddress);
      setCreatedAddress(electionAddress);
      navigate(`/election/${electionAddress}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create election";
      setError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Election name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Student Council 2026"
          className="input-base"
        />
      </div>

      <PrimaryButton onClick={onCreate} loading={isLoading || isCreating} loadingText={loadingText}>
        {isConnected ? "Create Election" : "Connect Wallet"}
      </PrimaryButton>

      {txHash && (
        <div className="text-sm text-slate-700 break-all">
          Tx:{" "}
          {explorerTxUrl ? (
            <a className="underline" href={explorerTxUrl} target="_blank" rel="noreferrer">
              {txHash}
            </a>
          ) : (
            txHash
          )}
        </div>
      )}

      {createdAddress && (
        <div className="text-sm text-slate-700 break-all">
          Created election: {createdAddress}
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
