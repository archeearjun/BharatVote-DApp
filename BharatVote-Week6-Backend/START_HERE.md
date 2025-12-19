# 🎯 START HERE - Week 6 Setup

## ⚠️ Important: You Need 4 Terminals!

The Week 6 system requires **4 separate terminal windows** running simultaneously.

---

## 🚀 Quick Setup (4 Commands)

### Terminal 1: Blockchain
```bash
cd BharatVote-Week6-Backend
npm run node
```
**Wait for:** "Started HTTP and WebSocket JSON-RPC server"

### Terminal 2: Deploy Contract
```bash
cd BharatVote-Week6-Backend
npm run demo
```
**Wait for:** "✅ DEPLOYMENT COMPLETE"

### Terminal 3: Backend Server
```bash
cd BharatVote-Week6-Backend/mock-kyc-server
npm start
```
**Wait for:** "Server running at http://localhost:3001"

### Terminal 4: Frontend
```bash
cd BharatVote-Week6-Frontend
npm run dev
```
**Wait for:** "Local: http://localhost:5173/"

---

## ✅ Then:

1. **Open browser**: `http://localhost:5173`
2. **Setup MetaMask**: Add localhost network (Chain ID: 31337)
3. **Import account**: Use Account #0 private key from Terminal 1
4. **Start using**: Admin dashboard or voter interface

---

## 📖 Full Instructions

See `QUICK_START.md` for complete step-by-step guide with troubleshooting.

---

## 🆘 Common Issues

**"npm run demo" not found?**
- Use: `npm run deploy:demo` or `npm run demo` (both work now)

**"Cannot connect to network"?**
- Make sure Terminal 1 (Hardhat node) is running!

**"Backend not responding"?**
- Make sure Terminal 3 (backend server) is running!

---

**All 4 terminals must be running!** 🚀

