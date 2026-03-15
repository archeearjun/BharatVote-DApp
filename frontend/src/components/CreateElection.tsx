import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFactoryAddress, getFactoryContract } from "@/utils/contract";
import useWallet from "@/useWallet";
import PrimaryButton from "@/components/PrimaryButton";
import { getNameLengthError, getUtf8ByteLength, MAX_NAME_BYTES } from "@/utils/nameValidation";

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
  const trimmedName = name.trim();
  const nameByteLength = getUtf8ByteLength(trimmedName);
  const nameLengthError = trimmedName ? getNameLengthError(trimmedName, "Election name") : null;
  const loadingText = !isConnected
    ? "Connecting..."
    : txHash
      ? "Waiting for confirmation..."
      : "Confirm in MetaMask...";

  const onCreate = async () => {
    setError(null);
    setCreatedAddress(null);
    setTxHash(null);

    if (!trimmedName) {
      setError("Please enter an election name");
      return;
    }
    if (nameLengthError) {
      setError(nameLengthError);
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
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. Student Council 2026"
          className="input-base"
        />
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className={nameLengthError ? "text-red-600" : "text-slate-500"}>
            Names must be between 1 and {MAX_NAME_BYTES} bytes.
          </span>
          <span className={nameLengthError ? "text-red-600" : "text-slate-500"}>
            {nameByteLength}/{MAX_NAME_BYTES} bytes
          </span>
        </div>
        {nameLengthError && <p className="text-sm text-red-600">{nameLengthError}</p>}
      </div>

      <PrimaryButton
        onClick={onCreate}
        loading={isLoading || isCreating}
        loadingText={loadingText}
        disabled={Boolean(nameLengthError)}
      >
        {isConnected ? "Create Election" : "Connect Wallet"}
      </PrimaryButton>

      {txHash && (
        <div className="text-sm text-slate-700 break-all">
          Tx:{" "}
          {explorerTxUrl ? (
            <a className="underline" href={explorerTxUrl} target="_blank" rel="noreferrer">
              {txHash}
              <span className="sr-only"> (opens in new tab)</span>
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
