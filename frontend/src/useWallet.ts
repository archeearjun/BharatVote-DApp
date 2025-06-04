import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [account, setAccount] = useState<string>();

  useEffect(() => {
    if (!window.ethereum) return;
    const eth = new ethers.BrowserProvider(window.ethereum);
    setProvider(eth);
    eth.send("eth_requestAccounts", []).then((acc) => setAccount(acc[0]));
  }, []);

  return { provider, account };
}
