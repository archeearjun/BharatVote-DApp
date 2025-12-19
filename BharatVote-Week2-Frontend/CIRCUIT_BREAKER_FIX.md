# 🔴 MetaMask Circuit Breaker - Quick Fix

## Error You're Seeing
```
MetaMask - RPC Error: Execution prevented because the circuit breaker is open
```

## ⚡ Immediate Fix (30 seconds)

1. **Wait 5-10 seconds** (circuit breaker auto-resets)
2. **Refresh page** (Press `F5`)
3. **Try again**

If still not working:
- Close browser tab
- Open fresh tab: `http://localhost:5174`
- Connect wallet again

## 🔧 If Still Failing

### Option 1: Restart MetaMask
1. Click MetaMask extension icon
2. Click three dots (⋮) → Settings
3. Advanced → Scroll to bottom
4. Click "Reset Account" (only resets transactions, not seed phrase)

### Option 2: Full Reset
```bash
# Terminal 1: Stop Hardhat node (Ctrl+C)
# Then restart:
npm run node

# Terminal 2: Wait 5 seconds, then:
npm run deploy

# Browser: Hard refresh (Ctrl+F5)
```

## ✅ Code Fix Applied (Enhanced)

The code now automatically:
- ✅ **2 second initial delay** before making any contract calls (gives circuit breaker time to reset)
- ✅ **Retries failed requests** (5 attempts with exponential backoff: 1s, 1.5s, 2.25s, 3.375s, 5s)
- ✅ **500ms delays** between contract calls (admin → phase → candidates)
- ✅ **3 second delay** before setting up event listeners
- ✅ **Better error detection** - checks multiple error message locations
- ✅ **Graceful event listener handling** - if they fail, the app still works

**Total wait time: ~6 seconds after wallet connection before all data loads**

**Just refresh the page and wait ~6 seconds - it will work automatically!**

---

## 💡 Why This Happens

MetaMask has a safety feature that prevents:
- Too many requests in quick succession
- Potential abuse or infinite loops
- Overloading the RPC endpoint

**Normal behavior** - just wait a moment and retry!

---

**For your demo:** If you see this error, just say:
> "MetaMask has a rate limiter for safety. Let me refresh the page... [refresh] ... and it should work now!"

