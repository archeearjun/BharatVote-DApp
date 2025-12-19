# 📋 BharatVote Week 1 - Complete Setup Commands

## Step-by-Step Terminal Commands

### 1️⃣ Navigate to Project Folder

```bash
cd BharatVote-Week1-Frontend
```

**What this does:** Changes your current directory to the Week 1 project folder.

---

### 2️⃣ Install Dependencies

```bash
npm install
```

**What this does:** 
- Reads `package.json` to see what packages are needed
- Downloads all dependencies from npm registry (~200MB)
- Creates `node_modules` folder with all packages
- Creates `package-lock.json` to lock dependency versions

**Expected output:**
```
added 245 packages, and audited 246 packages in 45s

78 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**Time:** 1-3 minutes depending on internet speed

**Troubleshooting:**
- If it fails with "ENOENT" error → Make sure you're in the correct folder
- If it fails with "permission denied" → Run `sudo npm install` (macOS/Linux)
- If it says "node not found" → Install Node.js 18+ first

---

### 3️⃣ Start Development Server

```bash
npm run dev
```

**What this does:**
- Runs the `dev` script from `package.json`
- Executes `vite` command
- Starts local development server on port 5173
- Enables Hot Module Replacement (instant updates on file save)

**Expected output:**
```
  VITE v5.0.0  ready in 487 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**What the output means:**
- `ready in 487 ms` → Vite started in less than half a second (Create React App takes 30+ seconds)
- `Local: http://localhost:5173/` → Your app is running at this URL
- `Network: use --host...` → How to access from other devices on your network

**Next step:** Open your browser and go to `http://localhost:5173`

---

### 4️⃣ Build for Production (Optional)

```bash
npm run build
```

**What this does:**
- Runs TypeScript compiler to check for type errors
- Bundles all JavaScript files using Rollup
- Minifies code (removes whitespace, shortens variable names)
- Optimizes assets (images, CSS)
- Creates `dist` folder with production-ready files

**Expected output:**
```
vite v5.0.0 building for production...
✓ 234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-BmK7x9Pn.css   12.34 kB │ gzip:  3.21 kB
dist/assets/index-DwN8FG4H.js   142.67 kB │ gzip: 45.78 kB
✓ built in 3.42s
```

**What the output means:**
- `234 modules transformed` → Processed 234 source files
- `index-BmK7x9Pn.css` → CSS file with content hash (for caching)
- `gzip: 45.78 kB` → Final bundle size after compression

**When to use:** Before deploying to production or when showing build optimization

---

### 5️⃣ Preview Production Build (Optional)

```bash
npm run preview
```

**What this does:**
- Serves the `dist` folder created by `npm run build`
- Starts a static file server
- Lets you test production build locally

**Expected output:**
```
  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
```

---

## 🔧 Additional Useful Commands

### Check Node.js Version
```bash
node --version
```
**Should show:** `v18.x.x` or higher

### Check npm Version
```bash
npm --version
```
**Should show:** `9.x.x` or higher

### Clear npm Cache (if installation fails)
```bash
npm cache clean --force
```

### Delete node_modules and Reinstall
```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
npm install

# macOS/Linux
rm -rf node_modules
npm install
```

### Run on Different Port
```bash
npm run dev -- --port 3000
```
**Opens on:** `http://localhost:3000` instead of 5173

### Open Browser Automatically
```bash
npm run dev -- --open
```
**Opens:** Default browser automatically when server starts

---

## 🌐 Opening the App in Browser

### Method 1: Manual (Recommended for Demo)
1. Start dev server: `npm run dev`
2. Wait for "ready in XXX ms" message
3. Open browser manually
4. Type: `http://localhost:5173`
5. Press Enter

### Method 2: Automatic
```bash
npm run dev -- --open
```
Browser opens automatically

---

## 🎯 What You Should See

### 1. Terminal Output
```
✓ Polyfills: Buffer successfully polyfilled  (from polyfills.ts)

  VITE v5.0.0  ready in 487 ms

  ➜  Local:   http://localhost:5173/
```

### 2. Browser Window
- **Header:** "BharatVote - Week 1: Wallet Connection"
- **Main Card:** Welcome message with wallet icon
- **Button:** "Connect MetaMask"
- **Footer:** Technical stack information

### 3. Browser Console (F12 → Console tab)
```
✓ Polyfills: Buffer successfully polyfilled
```
No errors should appear!

---

## 🐛 Common Issues and Fixes

### Issue 1: `command not found: npm`
**Problem:** Node.js/npm not installed  
**Solution:** 
1. Download Node.js from https://nodejs.org/
2. Install it (use LTS version - currently 20.x)
3. Restart terminal
4. Run `node --version` to verify

---

### Issue 2: `Error: Cannot find module 'vite'`
**Problem:** Dependencies not installed  
**Solution:**
```bash
npm install
```

---

### Issue 3: Port 5173 already in use
**Problem:** Another process is using port 5173  
**Solution:**
```bash
# Option 1: Kill the process
# Find process ID
lsof -i :5173
# Kill it (replace PID with actual number)
kill -9 PID

# Option 2: Use different port
npm run dev -- --port 3000
```

---

### Issue 4: `npm ERR! code ENOENT`
**Problem:** Not in correct folder  
**Solution:**
```bash
# Check current folder
pwd

# List files
ls

# Navigate to correct folder
cd BharatVote-Week1-Frontend
```

---

### Issue 5: Browser shows blank white page
**Problem:** JavaScript error (check console)  
**Solution:**
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for red error messages
4. Common fix: Clear cache and hard reload (Ctrl+Shift+R)

---

## 🎓 Understanding Each Command

### `npm install`
- **npm** = Node Package Manager (comes with Node.js)
- **install** = Downloads packages listed in package.json
- Creates `node_modules` folder
- Updates `package-lock.json` (locks exact versions)

**Analogy:** Like downloading all textbooks before starting a course

---

### `npm run dev`
- **npm** = Node Package Manager
- **run** = Execute a script from package.json
- **dev** = The script name (defined as `"dev": "vite"`)
- Runs `vite` command which starts development server

**Analogy:** Like starting your car engine before driving

---

### `npm run build`
- **build** = Production build script (defined as `"build": "vite build"`)
- Optimizes code for deployment
- Creates minified, compressed files
- Output goes to `dist` folder

**Analogy:** Like packing your suitcase before a trip (organizing and minimizing)

---

## 📱 Accessing from Mobile (Optional)

### Step 1: Start server with host flag
```bash
npm run dev -- --host
```

### Step 2: Note your IP address
Output will show:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Step 3: Open on mobile
- Ensure mobile is on same WiFi network
- Open browser on mobile
- Type: `http://192.168.1.100:5173` (use your IP)
- Connect MetaMask mobile wallet!

---

## ✅ Success Checklist

Before the demo, verify:

- [ ] `npm install` completed without errors
- [ ] `npm run dev` shows "ready in XXX ms"
- [ ] Browser opens to `http://localhost:5173`
- [ ] No red errors in browser console (F12)
- [ ] "Welcome to BharatVote" heading visible
- [ ] "Connect MetaMask" button visible
- [ ] MetaMask extension installed in browser
- [ ] At least one account in MetaMask with some ETH (for testnet)

---

## 🚀 Ready for Demo!

All commands working? Great! You're ready to present Week 1.

**Demo flow:**
1. Show terminal with `npm run dev` output
2. Show browser at `localhost:5173`
3. Open MetaMask extension
4. Click "Connect MetaMask" button
5. Approve in MetaMask popup
6. Show wallet address in header
7. Switch MetaMask account → Show app updates automatically
8. Point to network badge (Localhost, Sepolia, etc.)

---

**Week 1 Setup Complete! 🎉**

