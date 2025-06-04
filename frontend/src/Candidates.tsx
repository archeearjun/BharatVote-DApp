import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./BharatVote.json";
import useWallet from "./useWallet";

const addr = import.meta.env.VITE_CONTRACT_ADDRESS as string;

export default function Candidates() {
  const { provider } = useWallet();
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    if (!provider) return;
    (async () => {
      const c = new ethers.Contract(addr, abi, provider);
      const count = await c.candidateCount();
      const list: string[] = [];
      for (let i = 0; i < count; i++) {
        const cand = await c.candidates(i);
        list.push(cand.name);
      }
      setNames(list);
      // listen for new candidates in real time
      c.on("CandidateAdded", (_id: number, n: string) =>
        setNames((old) => [...old, n])
      );
    })();
  }, [provider]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Current Candidates</h2>
      <ul>{names.map((n) => <li key={n}>{n}</li>)}</ul>
    </div>
  );
}
