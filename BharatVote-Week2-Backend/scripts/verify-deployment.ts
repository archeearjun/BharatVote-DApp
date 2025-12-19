import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔍 Checking BharatVote deployment...\n");

  // 1) make sure node is up
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log(`✓ Network: ${network.name} (${network.chainId})`);

  const accounts = await ethers.getSigners();
  console.log(`✓ Accounts available: ${accounts.length}\n`);

  // 2) look for frontend JSONs
  const jsonPaths = [
    path.join(__dirname, "..", "..", "frontend", "src", "contracts", "BharatVote.json"),
    path.join(__dirname, "..", "..", "BharatVote-Week2-Frontend", "src", "contracts", "BharatVote.json"),
  ];

  const addresses: string[] = [];
  for (const p of jsonPaths) {
    if (!fs.existsSync(p)) continue;
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    if (raw.address) {
      addresses.push(raw.address);
      console.log(`📄 Found address ${raw.address} in ${p}`);
    }
  }

  if (addresses.length === 0) {
    console.log("\n❌ No BharatVote.json with address found.");
    console.log("   Run: npx hardhat run scripts/deploy.ts --network localhost");
    process.exit(1);
  }

  const unique = [...new Set(addresses.map((a) => a.toLowerCase()))];
  console.log(`\n🔎 Checking ${unique.length} unique address(es)...\n`);

  let ok = false;
  for (const addr of unique) {
    const code = await provider.getCode(addr);
    if (code === "0x") {
      console.log(`❌ ${addr} → no bytecode at this address`);
      continue;
    }

    console.log(`✅ ${addr} → contract found (bytecode length ${(code.length - 2) / 2} bytes)`);

    try {
      const contract = await ethers.getContractAt("BharatVote", addr);
      const admin = await contract.admin();
      const phase = await contract.phase();
      console.log(`   Admin: ${admin}`);
      console.log(`   Phase: ${phase} (${phase === 0 ? "Commit" : phase === 1 ? "Reveal" : "Finished"})`);

      try {
        const count = await contract.candidateCount();
        console.log(`   Candidates (total): ${count}`);
      } catch {
        console.log("   (candidateCount() not available – is ABI old?)");
      }

      ok = true;
    } catch (innerErr: any) {
      console.log(`   ⚠️ Contract exists but call failed: ${innerErr.message}`);
      console.log("   This often means your frontend BharatVote.json ABI is older than the contract.");
    }

    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (ok) {
    console.log("✅ RESULT: BharatVote is deployed and callable.");
  } else {
    console.log("❌ RESULT: Could not call the contract – check ABI / re-deploy.");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
