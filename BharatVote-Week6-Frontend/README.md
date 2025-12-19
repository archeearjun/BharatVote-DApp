# BharatVote - Week 6 Frontend: Admin Dashboard

## 📋 Purpose

This is the **Week 6 frontend implementation** of the BharatVote voting system. Week 6 focuses on the **Admin Dashboard** with complete candidate management, phase controls, and election administration features.

### What Week 6 Achieves

- **Admin Dashboard**: Complete admin interface for election management
- **Candidate Management**: Add and remove candidates with validation
- **Phase Controls**: Control election phase transitions
- **Real-time Updates**: Live candidate list and phase status
- **Error Handling**: Comprehensive error messages and feedback
- **User Experience**: Professional UI with loading states and notifications

---

## 🗂️ Project Structure

```
BharatVote-Week6-Frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # App header with phase badge
│   │   ├── KycPage.tsx                # KYC verification
│   │   ├── FaceRecognition.tsx        # Face verification
│   │   └── ...
│   │
│   ├── Admin.tsx                      # ⭐ WEEK 6 FOCUS: Admin Dashboard
│   ├── Voter.tsx                      # Voter interface (Weeks 4-5)
│   ├── App.tsx                        # Main app component
│   ├── useWallet.ts                   # Wallet connection hook
│   ├── constants.ts                   # App constants
│   └── ...
│
├── index.html                          # HTML entry point
├── vite.config.ts                      # Vite configuration
├── package.json                        # Dependencies
└── README.md                           # This file
```

---

## 🆕 What's New in Week 6

### 1. Admin Dashboard (Main Focus)

**Location:** `src/Admin.tsx`

**Key Features:**
- ✅ **Candidate Management**: Add and remove candidates
- ✅ **Phase Controls**: Start reveal phase, finish election
- ✅ **Real-time Updates**: Live candidate list and phase status
- ✅ **Validation**: Input validation and phase checks
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Success Feedback**: Clear success notifications
- ✅ **Loading States**: Visual feedback during transactions

### 2. Candidate Management

**Add Candidate:**
- Input field for candidate name
- Validation (name length, phase check)
- Transaction handling with error recovery
- Real-time candidate list update

**Remove Candidate:**
- Soft delete (sets `isActive = false`)
- Phase validation (only during Commit Phase)
- Visual feedback for removed candidates

### 3. Phase Controls

**Phase Transitions:**
- **Commit Phase → Reveal Phase**: `startReveal()`
- **Reveal Phase → Finished**: `finishElection()`
- One-way transitions (cannot go backwards)
- Phase validation before transitions

**Phase Display:**
- Current phase badge
- Phase-specific icons and colors
- Phase descriptions

### 4. User Experience

**Visual Feedback:**
- Loading spinners during transactions
- Success notifications (auto-dismiss)
- Error messages with dismiss option
- Disabled states for invalid actions

**Responsive Design:**
- Mobile-friendly layout
- Adaptive components
- Touch-friendly buttons

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Hardhat node running
- Contract deployed (Week 6 backend)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Step 3: Connect as Admin

1. Open MetaMask
2. Import admin account (from Hardhat node)
3. Connect wallet in frontend
4. Admin dashboard will appear automatically

### Step 4: Manage Election

1. **Add Candidates**: Enter candidate name and click "Add"
2. **Start Reveal Phase**: Click "Start Reveal Phase" when ready
3. **Finish Election**: Click "Finish Election" after reveal phase

---

## 📊 Admin Dashboard Features

### Candidate Management

**Add Candidate:**
```typescript
// Only works during Commit Phase (Phase 0)
await contract.addCandidate("Candidate Name");
```

**Remove Candidate:**
```typescript
// Only works during Commit Phase (Phase 0)
await contract.removeCandidate(candidateId);
```

**Get Candidates:**
```typescript
const candidates = await contract.getCandidates();
// Returns array of { id, name, isActive }
```

### Phase Management

**Start Reveal Phase:**
```typescript
// Only works during Commit Phase (Phase 0)
await contract.startReveal();
// Transitions to Phase 1 (Reveal Phase)
```

**Finish Election:**
```typescript
// Only works during Reveal Phase (Phase 1)
await contract.finishElection();
// Transitions to Phase 2 (Finished)
```

**Get Current Phase:**
```typescript
const phase = await contract.phase();
// Returns: 0 (Commit), 1 (Reveal), 2 (Finished)
```

---

## 🎨 UI Components

### Admin Dashboard Layout

```
┌─────────────────────────────────────┐
│  Admin Dashboard Header             │
│  [Settings Icon] [Phase Badge]      │
├─────────────────────────────────────┤
│  Error/Success Messages             │
├─────────────────────────────────────┤
│  Add Candidate Section              │
│  [Input] [Add Button]               │
├─────────────────────────────────────┤
│  Phase Control Section              │
│  [Start Reveal / Finish Button]     │
├─────────────────────────────────────┤
│  Candidates List                    │
│  [Candidate 1] [Remove]             │
│  [Candidate 2] [Remove]             │
└─────────────────────────────────────┘
```

### Phase Badge Colors

- **Commit Phase**: Slate (gray)
- **Reveal Phase**: Warning (yellow/orange)
- **Finished**: Success (green)

---

## 🔄 State Management

### Admin Component State

```typescript
interface AdminState {
  candidateName: string;      // Input for new candidate
  candidates: Candidate[];    // List of all candidates
  loading: boolean;           // Loading state
  error: string | null;       // Error message
  success: string | null;     // Success message
}
```

### Candidate Interface

```typescript
interface Candidate {
  id: number;                 // Candidate ID
  name: string;               // Candidate name
  isActive: boolean;          // Active status
}
```

---

## 🐛 Troubleshooting

### Error: "Can only add candidates during Commit Phase"

**Cause:** Trying to add candidates outside Commit Phase.

**Solution:**
- Ensure election is in Commit Phase (Phase 0)
- Check phase badge in admin dashboard
- Cannot add candidates during Reveal or Finished phases

### Error: "Failed to add candidate"

**Cause:** Transaction failed or network error.

**Solution:**
- Check MetaMask for transaction status
- Verify network connection
- Ensure sufficient gas
- Check contract deployment

### Candidates Not Appearing

**Cause:** Contract not connected or fetch error.

**Solution:**
- Verify wallet is connected
- Check contract address in `BharatVote.json`
- Refresh page
- Check browser console for errors

### Phase Transition Fails

**Cause:** Invalid phase transition or contract error.

**Solution:**
- Verify current phase
- Check phase requirements (e.g., candidates must exist)
- Ensure you're the admin
- Check transaction in MetaMask

---

## 📚 Key Concepts

### Admin-Only Functions

All admin functions use the `onlyAdmin` modifier:
- Only the deployer address can call admin functions
- Frontend automatically detects admin status
- Admin dashboard only shows for admin accounts

### Phase Restrictions

**Commit Phase (0):**
- ✅ Add candidates
- ✅ Remove candidates
- ✅ Start reveal phase

**Reveal Phase (1):**
- ❌ Cannot add/remove candidates
- ✅ Finish election

**Finished Phase (2):**
- ❌ All admin actions disabled
- ✅ View results only

### Candidate Management

- **Add**: Creates new candidate with auto-incremented ID
- **Remove**: Soft delete (sets `isActive = false`)
- **List**: Shows all candidates (active and inactive)

---

## 🎓 Learning Outcomes

By completing Week 6, you understand:

1. **Admin Dashboard**: Building admin interfaces for blockchain apps
2. **State Management**: Managing complex UI state
3. **Transaction Handling**: Submitting and monitoring blockchain transactions
4. **Error Handling**: Comprehensive error messages and recovery
5. **User Experience**: Loading states, feedback, and validation
6. **Phase Management**: Controlling election lifecycle

---

## 📝 Next Steps

### Week 7 Preview
- Results & Tally Display
- Real-time vote counting
- Election results visualization

---

**Week 6 Complete! Ready for Week 7: Results & Tally Display! 🎉**
