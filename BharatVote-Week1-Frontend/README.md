# BharatVote - Week 1 Frontend

## 🎯 Week 1 Deliverables

This package contains the **Week 1 Frontend Implementation** of the BharatVote decentralized voting system.

### What's Included in Week 1

✅ **Modern Development Environment**
- React 18.2.0 with TypeScript 5.8.3
- Vite 5.0.0 for lightning-fast HMR
- Tailwind CSS 3.4.0 for styling
- Material UI 5.15.3 for components

✅ **MetaMask Wallet Integration**
- Custom `useWallet` hook for state management
- Connection detection and error handling
- Account change event listeners
- Network detection and display

✅ **Professional Code Architecture**
- TypeScript strict mode enabled
- Reusable component library
- Clean separation of concerns
- Browser polyfills for blockchain libraries

---

## 📁 Project Structure

```
BharatVote-Week1-Frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # App header with wallet info
│   │   ├── PrimaryButton.tsx       # Reusable button component
│   │   ├── MainContainer.tsx       # Layout container
│   │   └── Toast.tsx               # Notification component
│   ├── types/
│   │   └── wallet.ts               # TypeScript wallet interfaces
│   ├── App.tsx                     # Main application component
│   ├── useWallet.ts                # Custom wallet hook ⭐
│   ├── constants.ts                # App constants and error messages
│   ├── main.tsx                    # React entry point
│   ├── theme.ts                    # Material UI theme
│   ├── polyfills.ts                # Browser polyfills for blockchain
│   └── index.css                   # Tailwind CSS styles
├── index.html                      # HTML entry point
├── vite.config.ts                  # Vite configuration ⭐
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **MetaMask** browser extension ([Install here](https://metamask.io/download/))
- A code editor like **VS Code** or **Cursor**

### Installation Steps

1. **Navigate to the project folder** (in VS Code/Cursor terminal):
```bash
cd BharatVote-Week1-Frontend
```

2. **Install dependencies**:
```bash
npm install
```
This will download all required packages (~200MB). It may take 2-3 minutes.

3. **Start the development server**:
```bash
npm run dev
```
You should see:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

4. **Open your browser** and navigate to:
```
http://localhost:5173
```

5. **Connect MetaMask**:
- Click the "Connect MetaMask" button
- Approve the connection in the MetaMask popup
- Your wallet address should appear in the header!

---

## 🎓 What Each File Does

### Core Configuration Files

#### `vite.config.ts`
- Configures Vite build tool
- Sets up path aliases (`@/` for `src/`)
- Adds browser polyfills for blockchain libraries (Buffer, process, global)
- Enables code splitting for optimized loading

**Why it matters:** Without proper polyfills, blockchain libraries crash in the browser.

#### `tsconfig.json`
- Enables TypeScript strict mode
- Configures module resolution
- Sets up path aliases for clean imports

**Why it matters:** Catches bugs at compile time instead of runtime.

#### `tailwind.config.js`
- Defines custom color palette
- Configures content sources for CSS purging
- Extends default Tailwind theme

**Why it matters:** Ensures only used CSS is included in production (smaller bundle size).

### Source Code Files

#### `src/useWallet.ts` ⭐ **MOST IMPORTANT FILE**
This custom React hook handles all wallet logic:
- Detects MetaMask installation
- Requests account access
- Creates Ethers.js provider and signer
- Listens for account/network changes
- Handles errors gracefully

**Key functions:**
- `connect()` - Initiates wallet connection
- `handleAccountsChanged()` - Updates UI when user switches accounts
- `handleChainChanged()` - Reloads page when user changes network

#### `src/App.tsx`
Main application component that:
- Uses the `useWallet` hook
- Displays connection UI
- Shows wallet information when connected
- Lists Week 1 technical stack and features

#### `src/constants.ts`
Centralized error messages and UI text:
- `WALLET_ERRORS` - MetaMask connection errors
- `CONTRACT_ERRORS` - Contract-related errors (for future weeks)
- `UI_MESSAGES` - UI text constants

**Why it matters:** Changes error messages in one place instead of hunting through multiple files.

#### `src/types/wallet.ts`
TypeScript interfaces for type safety:
- `WalletState` - Shape of wallet state object

**Why it matters:** IDE autocomplete and compile-time error checking.

#### `src/polyfills.ts`
Makes blockchain libraries work in browsers:
- Polyfills `Buffer` (needed by merkletreejs)
- Polyfills `process.env` (expected by some libraries)
- Polyfills `global` (Node.js global object)

**Why it matters:** Without this, you get `ReferenceError: Buffer is not defined`.

### Component Files

#### `src/components/Header.tsx`
App header showing:
- BharatVote logo and title
- Connected wallet address (shortened)
- Network name (Mainnet, Sepolia, Localhost, etc.)
- Connection status badge

#### `src/components/PrimaryButton.tsx`
Reusable button with:
- Primary and secondary variants
- Loading state with spinner
- Disabled state styling
- Consistent Tailwind classes

#### `src/components/MainContainer.tsx`
Layout wrapper providing:
- Responsive max-width container
- Consistent padding on all screen sizes
- Vertical spacing between child elements

#### `src/components/Toast.tsx`
Notification component with:
- Success and error variants
- Auto-dismiss after 3 seconds
- Slide-up animation
- Manual close button

---

## 🎨 Design System

### Colors
- **Slate** - Primary UI colors (backgrounds, borders, text)
- **Green** - Success states (connection successful, checkmarks)
- **Red** - Error states (connection failed, warnings)
- **Indigo** - Accent color (links, secondary buttons)

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Smoothing:** Antialiased for crisp text rendering

### Spacing
- **Container:** Max-width of 1152px (6xl)
- **Padding:** 1rem on mobile, 1.5rem on tablet, 2rem on desktop
- **Cards:** 1.5rem padding with rounded corners (0.75rem)

---

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production (creates /dist folder)
npm run preview  # Preview production build locally
```

---

## 🔍 Testing the Setup

### 1. Verify Vite is Working
After running `npm run dev`, you should see:
- Server starts in <1 second (not 30+ seconds like Create React App)
- Changes to files reflect instantly in browser (<50ms)

### 2. Verify Wallet Connection
- Click "Connect MetaMask"
- MetaMask popup appears
- After approval, your address appears in the header
- Network badge shows current network (e.g., "Localhost" for chainId 31337)

### 3. Verify Event Listeners
- Connect wallet
- In MetaMask, switch to a different account
- App should immediately update to show the new address (no page refresh needed)

### 4. Verify Error Handling
- Close MetaMask extension
- Reload page and try to connect
- Should see clear error: "No Ethereum wallet detected. Please install MetaMask."

---

## 📚 Technologies Explained

### Why Vite?
- **10-100x faster** than Webpack (used by Create React App)
- Native ES modules in development (no bundling until production)
- Hot Module Replacement (HMR) in <50ms
- Optimized production builds with Rollup

### Why Ethers.js v6?
- **88 KB** vs 500+ KB for Web3.js
- Native TypeScript support (not bolted on)
- Cleaner API design
- Better documentation
- Used by major projects (Uniswap, Aave, Compound)

### Why TypeScript?
- Catches bugs at compile time (before running code)
- IDE autocomplete for faster development
- Self-documenting code (types serve as documentation)
- Refactoring is safe (IDE finds all usages)

### Why Tailwind CSS?
- Utility-first (no need to write custom CSS)
- Responsive design with breakpoint prefixes (sm:, md:, lg:)
- Only includes CSS you actually use (via tree-shaking)
- Consistent design system (spacing, colors, typography)

---

## 🎯 Week 1 Learning Outcomes

After completing Week 1, you understand:

1. **Modern React Development**
   - Vite vs. Create React App
   - Why Vite is 10-100x faster
   - Hot Module Replacement (HMR)

2. **Web3 Wallet Integration**
   - How MetaMask injects `window.ethereum`
   - Provider vs. Signer in Ethers.js
   - Account change event handling
   - Network detection

3. **TypeScript for Type Safety**
   - Defining interfaces (`WalletState`)
   - Using types to prevent bugs
   - Path aliases for clean imports

4. **Custom React Hooks**
   - Separating logic from UI
   - `useCallback` for memoization
   - `useEffect` for side effects
   - `useRef` for non-reactive values

5. **Browser Polyfills for Blockchain**
   - Why blockchain libraries need Node.js globals
   - Polyfilling `Buffer`, `process`, `global`
   - Configuring Vite to include polyfills

---

## 🐛 Troubleshooting

### Issue: `npm install` fails
**Solution:** Ensure Node.js 18+ is installed:
```bash
node --version  # Should show v18.x.x or higher
```

### Issue: Port 5173 is already in use
**Solution:** Kill the process using that port or specify a different port:
```bash
npm run dev -- --port 3000
```

### Issue: MetaMask doesn't appear
**Solution:** 
1. Ensure MetaMask extension is installed
2. Check that it's enabled (not disabled in browser extensions)
3. Try refreshing the page

### Issue: "Buffer is not defined" error
**Solution:** This means polyfills aren't loaded. Check:
1. `src/polyfills.ts` exists
2. `src/main.tsx` imports polyfills first: `import './polyfills';`
3. `vite.config.ts` has the `define` and `optimizeDeps` sections

### Issue: Vite server won't start
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# If still failing, clear npm cache
npm cache clean --force
npm install
```

---

## 📝 Next Steps (Week 2 Preview)

In Week 2, you'll add:
- Contract integration (read contract state)
- Admin detection (check if connected account is admin)
- Phase detection (read current election phase)
- Event listeners for contract events
- Conditional rendering based on role

**New files in Week 2:**
- `src/contracts/BharatVote.json` (contract ABI and address)
- `src/abi.ts` (clean exports for ABI/address)
- Enhanced `useWallet.ts` with contract instantiation

---

## 🙏 Credits

**Built by:** Archee Arjun  
**Course:** BSc Computer Science - Final Year Project  
**Week:** 1 of 8  
**Technologies:** React, TypeScript, Vite, Ethers.js, Tailwind CSS  

---

## 📄 License

This project is for educational purposes as part of a university final year project.

---

**Week 1 Complete! 🎉**

