import { useState } from "react";
import { ethers } from "ethers";
import abi from "./BharatVote.json";
import useWallet from "./useWallet";

const contractAddr = import.meta.env.VITE_CONTRACT_ADDRESS as string;

export default function Admin() {
  const [name, setName] = useState("");
  const { provider, account } = useWallet();

  const addCandidate = async () => {
    if (!provider) return alert("MetaMask not found");
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddr, abi, signer);
    await contract.addCandidate(name);
    setName("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin – Add Candidate</h2>
      <p>Connected as {account}</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Candidate Name"
      />
      <button onClick={addCandidate}>Add</button>
    </div>
  );
}
