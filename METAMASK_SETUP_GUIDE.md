# 🔧 MetaMask Setup Guide - Hardhat Local Network

## 📋 How to Add Hardhat Local Network to MetaMask

This guide shows you exactly how to fill out the MetaMask "Add a custom network" form for your Week 3 presentation.

---

## 🎯 Step-by-Step Instructions

### **Step 1: Open MetaMask Network Settings**

1. Open MetaMask extension in your browser
2. Click the network dropdown (top of MetaMask, shows current network)
3. Click **"Add network"** or **"Add a custom network"**

---

### **Step 2: Fill Out the Form**

Use these exact values for your Hardhat local network:

#### **1. Network name:**
```
Hardhat Local
```
*(Or: "BharatVote Local", "Localhost 8545", etc.)*

#### **2. Default RPC URL:**
```
http://127.0.0.1:8545
```
*(This is where Hardhat node runs when you do `npm run node`)*

#### **3. Chain ID:**
```
31337
```
*(This is Hardhat's default Chain ID)*

#### **4. Currency symbol:**
```
ETH
```
*(Or: "DEV" - both work)*

#### **5. Block explorer URL:**
```
(Leave blank)
```
*(Local networks don't have block explorers)*

---

### **Step 3: Save**

Click the **"Save"** button at the bottom.

---

## ✅ Verification

After saving, you should see:

1. **MetaMask switches to "Hardhat Local" network**
2. **Network indicator shows Chain ID: 31337**
3. **Your account has 10,000 ETH** (Hardhat gives test accounts ETH automatically)

---

## 🚀 Quick Reference Card

**Copy-paste these values:**

| Field | Value |
|-------|-------|
| **Network name** | `Hardhat Local` |
| **RPC URL** | `http://127.0.0.1:8545` |
| **Chain ID** | `31337` |
| **Currency symbol** | `ETH` |
| **Block explorer URL** | *(Leave blank)* |

---

## ⚠️ Important Notes

### **Before Adding Network:**

1. **Make sure Hardhat node is running:**
   ```bash
   cd BharatVote-Week3-Backend
   npm run node
   ```
   You should see:
   ```
   Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
   ```

2. **Keep the Hardhat node terminal running** - Don't close it!

### **If Connection Fails:**

- **Check Hardhat node is running** - Look for `http://127.0.0.1:8545` in terminal
- **Check RPC URL** - Must be exactly `http://127.0.0.1:8545` (not `localhost`)
- **Check Chain ID** - Must be exactly `31337` (no spaces)
- **Restart Hardhat node** - Sometimes helps: `Ctrl+C` then `npm run node` again

---

## 🎯 For Week 3 Presentation

### **Setup Order:**

1. ✅ **Start Hardhat node** (Terminal 1)
   ```bash
   cd BharatVote-Week3-Backend
   npm run node
   ```

2. ✅ **Add network to MetaMask** (Use this guide)

3. ✅ **Deploy contract** (Terminal 2)
   ```bash
   cd BharatVote-Week3-Backend
   npm run deploy
   ```

4. ✅ **Start frontend** (Terminal 3)
   ```bash
   cd BharatVote-Week3-Frontend
   npm run dev
   ```

5. ✅ **Connect MetaMask** - Click "Connect Wallet" in frontend

---

## 📸 Visual Guide

### **Form Fields (Left to Right, Top to Bottom):**

```
┌─────────────────────────────────────┐
│  ←  Add a custom network        ×  │
├─────────────────────────────────────┤
│  Network name:                      │
│  ┌─────────────────────────────┐   │
│  │ Hardhat Local               │   │
│  └─────────────────────────────┘   │
│                                      │
│  Default RPC URL:                    │
│  ┌─────────────────────────────┐   │
│  │ http://127.0.0.1:8545        │ ▼ │
│  └─────────────────────────────┘   │
│                                      │
│  Chain ID:                           │
│  ┌─────────────────────────────┐   │
│  │ 31337                        │   │
│  └─────────────────────────────┘   │
│                                      │
│  Currency symbol:                    │
│  ┌─────────────────────────────┐   │
│  │ ETH                          │   │
│  └─────────────────────────────┘   │
│                                      │
│  Block explorer URL:                 │
│  ┌─────────────────────────────┐   │
│  │ (Leave blank)               │ ▼ │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │         Save                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### **Problem: "Network already exists"**

**Solution:** 
- MetaMask might already have a "Localhost 8545" network
- Either use that existing network, or:
- Go to Settings → Networks → Delete the old one → Add new one

### **Problem: "Failed to add network"**

**Solution:**
1. Check Hardhat node is running
2. Verify RPC URL is correct: `http://127.0.0.1:8545`
3. Try `http://localhost:8545` instead (some systems prefer this)
4. Check firewall isn't blocking port 8545

### **Problem: "Incorrect Chain ID"**

**Solution:**
- Make sure Chain ID is exactly `31337` (no spaces, no quotes)
- Check your `hardhat.config.ts` to confirm Chain ID
- Default Hardhat Chain ID is `31337`

### **Problem: "Cannot connect to network"**

**Solution:**
1. **Check Hardhat node is running:**
   ```bash
   # In backend terminal, you should see:
   Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
   ```

2. **Test connection:**
   ```bash
   # Open browser and go to:
   http://127.0.0.1:8545
   # Should see JSON-RPC response (or error, but connection works)
   ```

3. **Restart Hardhat node:**
   ```bash
   # Press Ctrl+C in Hardhat terminal
   npm run node  # Start again
   ```

---

## ✅ Success Checklist

After adding the network, verify:

- [ ] Network appears in MetaMask dropdown
- [ ] Can switch to "Hardhat Local" network
- [ ] Account shows 10,000 ETH balance
- [ ] Chain ID shows as 31337
- [ ] Can connect frontend to MetaMask
- [ ] Can send transactions (test with a simple transaction)

---

## 🎤 For Presentation

**When demonstrating:**

1. **Show MetaMask network dropdown** - "I've added the Hardhat local network"
2. **Show network details** - "Chain ID 31337, connected to localhost:8545"
3. **Show account balance** - "Test accounts have 10,000 ETH for free"
4. **Explain why** - "This allows the frontend to interact with our deployed contract"

---

## 📝 Quick Copy-Paste Values

**For easy reference during setup:**

```
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
Block explorer: (blank)
```

---

**You're all set! Once you add this network, your frontend will be able to connect to your deployed contract.** 🚀

