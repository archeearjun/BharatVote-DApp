import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./BharatVote.json";
import useWallet from "./useWallet";

const addr = import.meta.env.VITE_CONTRACT_ADDRESS as string;

// 🆕 Define a candidate type with id + name
type Cand = { id: number; name: string };

export default function Candidates() {
  const { provider } = useWallet();
  const [cands, setCands] = useState<Cand[]>([]);

  useEffect(() => {
    if (!provider) return;
    (async () => {
      const c = new ethers.Contract(addr, abi, provider);
      const count = await c.candidateCount();
      const list: Cand[] = [];
      for (let i = 0; i < count; i++) {
        const cand = await c.candidates(i); // returns struct {id, name}
        list.push({ id: cand.id, name: cand.name });
      }
      setCands(list);

      // 🆕 Real-time updates
      c.on("CandidateAdded", (id: number, name: string) =>
        setCands((old) => [...old, { id, name }])
      );
    })();
  }, [provider]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Current Candidates</h2>
      <ul>
        {cands.map((c) => (
          <li key={c.id}>
            {c.name} (ID: {c.id})
          </li>
        ))}
      </ul>
    </div>
  );
}
