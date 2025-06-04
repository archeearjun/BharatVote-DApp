import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./BharatVote.json";
import useWallet from "./useWallet";
import { makeCommit } from "./crypto";

const addr = import.meta.env.VITE_CONTRACT_ADDRESS as string;

type Cand = { id: number; name: string };

export default function Voter() {
  const { provider, account } = useWallet();
  const [cands, setCands] = useState<Cand[]>([]);
  const [txHash, setTxHash] = useState<string>();

  // Load candidate list from contract
  useEffect(() => {
    if (!provider) return;
    (async () => {
      const c = new ethers.Contract(addr, abi, provider);
      const count = await c.candidateCount();
      const list: Cand[] = [];
      for (let i = 0; i < count; i++) {
        const cand = await c.candidates(i);
        list.push({ id: cand.id, name: cand.name });
      }
      setCands(list);
    })();
  }, [provider]);

  async function vote(cand: Cand) {
    if (!provider || !account) return alert("MetaMask not ready");

    const { commit, salt } = makeCommit(cand.id);

    // Store salt locally for future reveal
    localStorage.setItem(`bharatvote-salt-${account}`, salt);

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(addr, abi, signer);

    try {
      const tx = await contract.commitVote(commit);
      await tx.wait(); // Wait for mining
      setTxHash(tx.hash);
    } catch (err: any) {
      alert(err.reason ?? err.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Voter – Cast Commit</h2>
      <p>Connected as {account}</p>
      <ul>
        {cands.map((c) => (
          <li key={c.id}>
            {c.name} <button onClick={() => vote(c)}>Vote</button>
          </li>
        ))}
      </ul>
      {txHash && (
        <p>
          ✅ Commit sent! Tx: <code>{txHash.slice(0, 10)}…</code>
          <br />
          Keep this tab open or don’t clear your browser storage — you’ll need
          this to reveal later.
        </p>
      )}
    </div>
  );
}
