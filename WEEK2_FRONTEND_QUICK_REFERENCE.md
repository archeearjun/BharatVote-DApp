# 📌 Week 2 Frontend - Quick Reference Guide

## 🎯 For Week 2 Presentation - USE THIS FOLDER

```
✅ BharatVote-Week2-Frontend/
```

**DO NOT use `frontend/` for Week 2 demos - it has all weeks implemented!**

---

## 🚀 Quick Start (5 Commands)

```bash
# 1. Navigate to Week 2 folder
cd BharatVote-Week2-Frontend

# 2. Install dependencies
npm install

# 3. Start dev server (opens at http://localhost:5174)
npm run dev

# 4. Connect MetaMask to Localhost 8545

# 5. Use admin account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

---

## 📋 Week 2 Key Files to Show

| File | What It Does | Lines |
|------|--------------|-------|
| `src/abi.ts` | Clean ABI export | 4 |
| `src/types/contracts.ts` | Type-safe interface | 40 |
| `src/bharatVoteContract.ts` | Contract helper | 15 |
| `src/useWallet.ts` | Enhanced with contract | 160 |
| `src/App.tsx` | Admin/phase detection | 250 |
| `src/constants.ts` | Phase constants | 40 |

---

## 🎤 Demo Talking Points

### **1. Contract Integration (2 min)**
"I've integrated the deployed contract using Ethers.js. The useWallet hook now creates a contract instance during connection."

**Show:** `src/useWallet.ts` lines 87-92

### **2. Admin Detection (2 min)**
"The app reads the admin address from the blockchain and compares it with the connected account to show different UIs."

**Show:** `src/App.tsx` lines 46-52

### **3. Phase Detection (1 min)**
"The app reads the current phase from the contract and displays it in the header."

**Show:** `src/App.tsx` lines 55-60

### **4. Event Listeners (2 min)**
"Real-time updates via contract events - no polling needed."

**Show:** `src/App.tsx` lines 72-88

### **5. Type Safety (2 min)**
"TypeScript interface ensures compile-time type checking for all contract methods."

**Show:** `src/types/contracts.ts`

---

## 🧪 Live Demo Checklist

- [ ] Start dev server (`npm run dev`)
- [ ] Connect with admin account
- [ ] Show admin badge in header
- [ ] Show current phase display
- [ ] Open Hardhat console in separate terminal
- [ ] Add candidate: `await contract.addCandidate("Test")`
- [ ] Show instant update in frontend
- [ ] Change phase: `await contract.startReveal()`
- [ ] Show phase badge update

---

## 🔍 What's NEW in Week 2 (vs Week 1)

| Feature | Week 1 | Week 2 |
|---------|--------|--------|
| Contract instance | ❌ | ✅ Created in useWallet |
| Admin detection | ❌ | ✅ Via contract.admin() |
| Phase detection | ❌ | ✅ Via contract.phase() |
| Event listeners | MetaMask only | + Contract events |
| Header | Basic | + Admin badge + Phase |
| Type safety | Basic | + Contract interface |
| New files | 0 | 3 (abi.ts, contracts.ts, bharatVoteContract.ts) |

---

## 📁 Folder Comparison

```
Week 1: BharatVote-Week1-Frontend/
├── Wallet connection only
├── No contract integration
└── ~190 lines total

Week 2: BharatVote-Week2-Frontend/  ← USE THIS FOR WEEK 2
├── Everything from Week 1
├── + Contract integration
├── + Admin/phase detection
├── + Event listeners
└── ~450 lines total

Full: frontend/  ← DO NOT USE FOR WEEK 2
├── Everything from Week 1-2
├── + KYC flow
├── + Voting UI
├── + Admin dashboard
├── + Results
└── ~2000+ lines total
```

---

## ⚠️ Common Mistakes to Avoid

### **❌ Using Wrong Folder**
```bash
# WRONG - This has all weeks implemented
cd frontend
npm run dev
```

```bash
# CORRECT - Week 2 only
cd BharatVote-Week2-Frontend
npm run dev
```

### **❌ Wrong Port**
- Week 1: `http://localhost:5173`
- Week 2: `http://localhost:5174` ← Use this

### **❌ Wrong Contract Address**
If contract redeployed, update `src/contracts/BharatVote.json`

---

## 🎯 Success Indicators

✅ **Admin Detection Works:**
- Connect with 0xf39Fd... → See purple "Admin" badge
- Connect with other account → No admin badge

✅ **Phase Detection Works:**
- Header shows "Commit Phase" / "Reveal Phase" / "Election Finished"
- Matches contract state

✅ **Event Listeners Work:**
- Add candidate in Hardhat → Frontend updates instantly
- Change phase in Hardhat → Header updates instantly

✅ **Type Safety Works:**
- TypeScript autocomplete for contract methods
- No type errors in IDE

---

## 📖 Key Documentation Files

| File | Purpose |
|------|---------|
| `BharatVote-Week2-Frontend/README.md` | Comprehensive Week 2 guide |
| `WEEK2_FRONTEND_SETUP_COMPLETE.md` | Setup completion summary |
| `WEEK2_FRONTEND_CODE_EXTRACT.md` | Code snippets for presentation |
| `FRONTEND_8WEEK_ROADMAP.md` | Full 8-week frontend plan |

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Contract not available" | Ensure Hardhat node running + contract deployed |
| Admin badge not showing | Check you're using admin account (0xf39Fd...) |
| Phase not updating | Check contract.phase() in Hardhat console |
| Port already in use | Week 1 still running? Kill it or use different port |
| Events not firing | Check contract has event emissions in functions |

---

## 💡 Quick Code References

### **Admin Detection**
```typescript
const adminAddress = await contract.admin();
const isAdmin = adminAddress.toLowerCase() === account.toLowerCase();
```

### **Phase Detection**
```typescript
const currentPhase = await contract.phase();
setPhase(Number(currentPhase));
```

### **Event Listener**
```typescript
contract.on(contract.filters.PhaseChanged(), (newPhase) => {
  setPhase(Number(newPhase));
});
```

### **Type-Safe Contract Call**
```typescript
const candidates = await contract.getCandidates();
// TypeScript knows this returns Array<{id: bigint, name: string, isActive: boolean}>
```

---

## 🎓 Key Concepts to Explain

1. **View Functions** - Read blockchain for free (no gas)
2. **Admin Detection** - Frontend UX only, security in contract
3. **Phase Detection** - UI adapts to blockchain state
4. **Event Listeners** - Real-time updates without polling
5. **Type Safety** - Compile-time checking prevents bugs
6. **BigInt Conversion** - `Number(bigintValue)` for React state

---

## ⏱️ Presentation Time Breakdown (8-10 min)

- Introduction (30s)
- Week 1 recap (1 min)
- Week 2 new features overview (1 min)
- Contract integration demo (2 min)
- Admin detection demo (2 min)
- Event listeners demo (2 min)
- Type safety explanation (1 min)
- Q&A / Next week preview (1 min)

---

**You're all set for Week 2 presentation! 🎉**

**Use `BharatVote-Week2-Frontend/` folder and you'll clearly demonstrate Week 2 progress without confusion from future weeks.**

