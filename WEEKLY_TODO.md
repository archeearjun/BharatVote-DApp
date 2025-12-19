# ✅ This Week's TODO List

**Week:** Week 7 + Week 8 Start  
**Focus:** Testing Enhancement + Documentation  
**Goal:** Increase test coverage from 60% → 80% and create localhost documentation

---

## 🎯 **MONDAY - Expand Contract Tests**

### **Morning (2-3 hours)**
- [ ] Review existing tests in `test/BharatVote.ts`
- [ ] Run tests: `npm run test:contracts`
- [ ] Note which functions are NOT tested yet

### **Afternoon (3-4 hours)**
- [ ] **Add admin function tests:**
  - [ ] Test `setMerkleRoot()` with invalid admin
  - [ ] Test `addCandidate()` with empty name (should fail)
  - [ ] Test `addCandidate()` with name > 100 chars (should fail)
  - [ ] Test `addCandidate()` in wrong phase (should fail)
  - [ ] Test `removeCandidate()` with invalid ID
  - [ ] Test `startReveal()` in wrong phase
  - [ ] Test `finishElection()` in wrong phase

**Command to run:**
```bash
npm run test:contracts
```

---

## 🎯 **TUESDAY - Voting & Edge Cases**

### **Morning (2-3 hours)**
- [ ] **Add voting function tests:**
  - [ ] Test `commitVote()` with invalid Merkle proof
  - [ ] Test `commitVote()` twice (double commit prevention)
  - [ ] Test `commitVote()` in wrong phase
  - [ ] Test `revealVote()` without commit (should fail)
  - [ ] Test `revealVote()` with wrong hash (should fail)
  - [ ] Test `revealVote()` twice (double reveal prevention)

### **Afternoon (3-4 hours)**
- [ ] **Add edge case tests:**
  - [ ] Test voting with empty candidate list
  - [ ] Test voting for invalid candidate ID
  - [ ] Test Merkle proof with wrong address
  - [ ] Test phase transitions (0→1→2)
  - [ ] Test `resetElection()` functionality

**Command to run:**
```bash
npm run test:contracts -- --grep "voting"
```

---

## 🎯 **WEDNESDAY - Integration Tests & Coverage**

### **Morning (2-3 hours)**
- [ ] **Expand integration tests:**
  - [ ] Full voting flow: Setup → Commit → Reveal → Finish
  - [ ] Multiple voters voting
  - [ ] Admin managing election
  - [ ] Reset and new election

### **Afternoon (3-4 hours)**
- [ ] **Set up test coverage:**
  - [ ] Run: `npm run test:coverage` (if available)
  - [ ] Or install: `npm install --save-dev solidity-coverage`
  - [ ] Generate coverage report
  - [ ] Document coverage in `TEST_COVERAGE_REPORT.md`

**Commands:**
```bash
# Run integration tests
npm run test:integration

# Generate coverage (if solidity-coverage installed)
npx hardhat coverage
```

---

## 🎯 **THURSDAY - Test Documentation**

### **Morning (2-3 hours)**
- [ ] **Create `TESTING_GUIDE.md`:**
  - [ ] How to run all tests
  - [ ] How to run specific test suites
  - [ ] How to interpret results
  - [ ] Common issues and solutions

### **Afternoon (3-4 hours)**
- [ ] **Create `TEST_COVERAGE_REPORT.md`:**
  - [ ] Current coverage percentage
  - [ ] Functions covered
  - [ ] Functions missing tests
  - [ ] Coverage goals

- [ ] **Update README.md:**
  - [ ] Add testing section
  - [ ] Link to testing guide

---

## 🎯 **FRIDAY - Localhost Documentation**

### **Morning (2-3 hours)**
- [ ] **Create `LOCALHOST_SETUP_GUIDE.md`:**
  - [ ] Prerequisites checklist
  - [ ] Step-by-step setup (8 steps)
  - [ ] Screenshots or code examples
  - [ ] Verification steps

### **Afternoon (3-4 hours)**
- [ ] **Create `QUICK_START.md`:**
  - [ ] One-page quick reference
  - [ ] Essential commands only
  - [ ] Common issues quick fixes

- [ ] **Test the documentation:**
  - [ ] Follow your own guide from scratch
  - [ ] Fix any issues you find
  - [ ] Update guide with corrections

---

## 📊 **END OF WEEK CHECKLIST**

By Friday, you should have:

- [ ] ✅ Test coverage increased (60% → ~80%)
- [ ] ✅ All admin functions tested
- [ ] ✅ All voting functions tested
- [ ] ✅ Edge cases covered
- [ ] ✅ Integration test for full flow
- [ ] ✅ `TESTING_GUIDE.md` created
- [ ] ✅ `TEST_COVERAGE_REPORT.md` created
- [ ] ✅ `LOCALHOST_SETUP_GUIDE.md` created
- [ ] ✅ `QUICK_START.md` created
- [ ] ✅ All tests passing: `npm run test:all`

---

## 🚀 **QUICK START COMMANDS**

```bash
# Run all tests
npm run test:all

# Run only contract tests
npm run test:contracts

# Run only backend tests
npm run test:backend

# Run with coverage (if installed)
npx hardhat coverage

# Start everything for testing
npm run dev:all
```

---

## 💡 **TIPS FOR SUCCESS**

1. **Start small** - Test one function at a time
2. **Use existing tests as templates** - Copy and modify
3. **Run tests frequently** - After each new test
4. **Document as you go** - Don't wait until the end
5. **Ask for help** - If stuck, check existing test patterns

---

## 📝 **NOTES**

- **Don't worry about 100% coverage** - Focus on critical functions first
- **Quality over quantity** - Better to have fewer, good tests
- **Test edge cases** - What happens when things go wrong?
- **Documentation is important** - It helps you and others

---

**You've got this! Start with Monday's tasks and work through the week! 🎯**
