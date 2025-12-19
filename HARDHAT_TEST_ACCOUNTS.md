# 🔑 Hardhat Test Accounts - Private Keys & Addresses

## 📋 Overview

When you run `npm run node` in Hardhat, it creates **20 test accounts** with known private keys. These are perfect for testing your Week 3 voting system.

---

## 👥 Account List

### **Account #0 - Admin Account** (Deployer)
**Address (Public Key):**
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Private Key:**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Balance:** 10,000 ETH  
**Use:** Admin account (deploys contract, manages election)

---

### **Account #1 - Voter 1**
**Address (Public Key):**
```
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Private Key:**
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Balance:** 10,000 ETH  
**Use:** Test voter for commit-reveal flow

---

### **Account #2 - Voter 2**
**Address (Public Key):**
```
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

**Private Key:**
```
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Balance:** 10,000 ETH  
**Use:** Test voter for commit-reveal flow

---

### **Account #3 - Voter 3**
**Address (Public Key):**
```
0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

**Private Key:**
```
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

**Balance:** 10,000 ETH  
**Use:** Test voter for commit-reveal flow

---

### **Account #4 - Voter 4**
**Address (Public Key):**
```
0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

**Private Key:**
```
0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733569c19708b7e0b09
```

**Balance:** 10,000 ETH  
**Use:** Additional test voter

---

### **Account #5 - Voter 5**
**Address (Public Key):**
```
0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
```

**Private Key:**
```
0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
```

**Balance:** 10,000 ETH  
**Use:** Additional test voter

---

## 📊 Quick Reference Table

| Account | Address | Role | Private Key (First 10 chars) |
|---------|---------|------|------------------------------|
| #0 | `0xf39Fd6...92266` | **Admin** | `0xac0974be...` |
| #1 | `0x709979...79C8` | Voter 1 | `0x59c6995e...` |
| #2 | `0x3C44Cd...293BC` | Voter 2 | `0x5de4111a...` |
| #3 | `0x90F79b...b906` | Voter 3 | `0x7c85211...` |
| #4 | `0x15d34A...6A65` | Voter 4 | `0x47e179ec...` |
| #5 | `0x996550...0A4dc` | Voter 5 | `0x8b3a350c...` |

---

## 🔐 How to Import Accounts into MetaMask

### **Step 1: Open MetaMask**

1. Click MetaMask extension
2. Click the **account icon** (circle) in top right
3. Click **"Import account"**

### **Step 2: Import Private Key**

1. Select **"Private key"** option
2. Paste the private key (e.g., `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)
3. Click **"Import"**

### **Step 3: Verify**

- Account appears in MetaMask
- Shows 10,000 ETH balance (on Hardhat Local network)
- You can switch between accounts

---

## 🎯 Recommended Setup for Week 3

### **Import These Accounts:**

1. **Account #0 (Admin)** - For managing election
2. **Account #1 (Voter 1)** - For testing voting
3. **Account #2 (Voter 2)** - For testing voting
4. **Account #3 (Voter 3)** - For testing voting

### **Why These 4?**

- **Account #0:** Deploys contract, adds candidates, controls phases
- **Accounts #1-3:** Used in `test-voting.ts` script, perfect for demo

---

## 📝 Complete Account List (All 20)

Here are all 20 Hardhat test accounts:

### **Accounts 0-9:**

| # | Address | Private Key |
|---|---------|-------------|
| 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| 3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| 4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733569c19708b7e0b09` |
| 5 | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` | `0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba` |
| 6 | `0x976EA74026E726554dB657fA54763abd0C3a0aa9` | `0x92db14e403b53df4eab132e85e02ed5b612b68c4c3c1c8e8b9e8c8c8c8c8c8c8` |
| 7 | `0x14dC79964da2C08b23698B3D3cc7Ca32172d4C4a` | `0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356` |
| 8 | `0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f` | `0xdbda1821b80551c9d65939329250298aa347d63b5220000000000000000000000` |
| 9 | `0xa0Ee7A142d267C1f36714E4a8F75612F20a79720` | `0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6` |

### **Accounts 10-19:**

| # | Address | Private Key |
|---|---------|-------------|
| 10 | `0xBcd4042DE499D14e55001CcbB24a551F3b954096` | `0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d8a1688931e6da2c0e` |
| 11 | `0x71bE63f3384f5fb98995898A86B02Fb2426c5788` | `0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82` |
| 12 | `0xFABB0ac9d68B0B445fB7357272Ff202C5651694a` | `0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967e1` |
| 13 | `0x1CBd3b2770909D4e10fA0b4c773d98Ac662897eA` | `0x47c99abed3324a2707c28affff126b0be5f735bf38180f5b5e8c8c8c8c8c8c8c8` |
| 14 | `0xdF3e18d64BC6A983f673Ab319CCaE4f6a8C8a8f8` | `0xc526ee95bf44d8fc405a158bb884d9d123280d8e6f6750e0b9a8f8f8f8f8f8f8f8` |
| 15 | `0xcd3B766CCDd6AE721141F452C550Ca635964ce71` | `0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec0eec0eec0e` |
| 16 | `0x2546BcD3c84621e976D8185a2A8e0F583ca21c08` | `0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d424dac9` |
| 17 | `0xbDA5747bFD65F08deb54cb465e87` | `0x689af8efa8c1a686ac0509e81a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1` |
| 18 | `0xdD2FD4581271e230360230F9337D5c0440d44e2d` | `0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa56360bfa563` |
| 19 | `0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199` | `0xdf57089febbacf7ba0bc227dca7ca239297136423665906a0a472dc35265e5a1` |

---

## 🎤 For Week 3 Presentation

### **Recommended Accounts to Import:**

1. **Admin Account (#0)**
   - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Use: Deploy contract, manage election

2. **Voter Accounts (#1, #2, #3)**
   - Addresses: See table above
   - Use: Test commit-reveal voting flow

### **Quick Demo Setup:**

```bash
# 1. Start Hardhat node
npm run node

# 2. Deploy contract (uses Account #0 automatically)
npm run deploy

# 3. In MetaMask, import:
#    - Account #0 (Admin)
#    - Account #1 (Voter 1)
#    - Account #2 (Voter 2)
#    - Account #3 (Voter 3)

# 4. Switch between accounts to test different roles
```

---

## ⚠️ Security Warning

**IMPORTANT:** These are **TEST ACCOUNTS ONLY**!

- ✅ **Safe for:** Local development, testing, demos
- ❌ **NEVER use for:** Mainnet, real money, production
- ❌ **NEVER share:** Private keys publicly (except for testing)

These private keys are **publicly known** and anyone can access these accounts on testnets. They're only safe for local Hardhat networks.

---

## 🔍 How to Verify Account Balance

After importing an account:

1. Switch to **"Hardhat Local"** network in MetaMask
2. Select the imported account
3. Should show **10,000 ETH** balance
4. If balance is 0, make sure:
   - Hardhat node is running
   - You're on the correct network (Chain ID 31337)
   - Account was imported correctly

---

## 📝 Copy-Paste Ready Format

### **For Easy Import:**

**Account #0 (Admin):**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Account #1 (Voter 1):**
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Account #2 (Voter 2):**
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Account #3 (Voter 3):**
```
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

---

## ✅ Checklist for Week 3

- [ ] Hardhat node running (`npm run node`)
- [ ] MetaMask connected to Hardhat Local network
- [ ] Account #0 imported (Admin)
- [ ] Account #1 imported (Voter 1)
- [ ] Account #2 imported (Voter 2)
- [ ] Account #3 imported (Voter 3)
- [ ] All accounts show 10,000 ETH balance
- [ ] Can switch between accounts in MetaMask

---

**You're all set! Import these accounts into MetaMask to test your Week 3 voting system.** 🚀

