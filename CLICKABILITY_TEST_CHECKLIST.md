# BharatVote Clickability & UI/UX Test Checklist
## Interactive Testing Guide

---

## 🎯 PURPOSE
This checklist helps manually verify that every interactive element in the BharatVote application works correctly. Use this for quality assurance before deployment or demonstrations.

---

## 🖥️ WEB APPLICATION TESTS

### 1. KYC/Home Page

#### Visual Elements
- [ ] BharatVote logo displays correctly
- [ ] Shield icon renders properly
- [ ] Page has gradient background
- [ ] Card has shadow effect
- [ ] Text is readable and properly sized
- [ ] Colors match theme (slate, brand colors)

#### Interactive Elements - Tab System
- [ ] **Voter ID KYC tab** - Click → Activates tab
  - Expected: Tab highlighted, user icon visible
- [ ] **Address Update tab** - Click → Switches tabs
  - Expected: Tab changes, phone icon visible
- [ ] Tab switches smoothly (no lag)
- [ ] Active tab has white background
- [ ] Inactive tab has grey text

#### Interactive Elements - Stepper
- [ ] Step 1 (EPIC) highlighted in blue
- [ ] Step 2 greyed out
- [ ] Step 3 greyed out
- [ ] Numbers visible and clear
- [ ] Lines connecting steps

#### Interactive Elements - Form
- [ ] **Voter ID input field** - Click → Cursor appears
  - Type: "VOTER1"
  - Expected: Text appears in center
- [ ] **Input validation** - Type > 15 characters
  - Expected: Stops at 15 chars
- [ ] **Clear input** - Delete all text
  - Expected: Placeholder "VOTER1" shows
- [ ] **Send OTP button** - Hover
  - Expected: Color changes slightly
- [ ] **Send OTP button** - Click with valid ID
  - Expected: Loading spinner appears
  - Expected: Button disabled during load
  - Expected: Success/error message shows

#### OTP Modal (After Send OTP)
- [ ] Modal appears over page
- [ ] Background darkened (overlay)
- [ ] 6 OTP input boxes visible
- [ ] **Type OTP** - Enter 6 digits
  - Expected: Numbers fill boxes
- [ ] **Auto-focus** - Moves to next box
- [ ] **Verify button** - Click with complete OTP
  - Expected: Validates and proceeds
- [ ] **Close button (X)** - Click
  - Expected: Modal closes

#### Toast Notifications
- [ ] Success toast shows (green)
- [ ] Error toast shows (red/orange)
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Close button (X) works
- [ ] Toast slides in from top-right

#### Responsive Behavior
- [ ] Resize to mobile (375px)
  - Expected: Layout stacks vertically
- [ ] Resize to tablet (768px)
  - Expected: Maintains readability
- [ ] Resize to desktop (1920px)
  - Expected: Centered, not stretched

### 2. Voter Dashboard Page

#### Visual Elements
- [ ] Header with BharatVote branding
- [ ] Phase badge visible (Commit/Reveal/Finished)
- [ ] Network switcher displays current network
- [ ] Wallet section prominent
- [ ] Candidate cards styled properly
- [ ] Footer information present

#### Interactive Elements - Wallet
- [ ] **Connect Wallet button** - Click
  - Expected: MetaMask popup opens
  - Expected: Requests account access
- [ ] **Approve in MetaMask** - Click approve
  - Expected: Button changes to show address
  - Expected: Address shortened (0x1234...5678)
- [ ] **Wallet address** - Hover
  - Expected: Shows full address tooltip
- [ ] **Disconnect button** - Click (if available)
  - Expected: Wallet disconnects

#### Interactive Elements - Network Switcher
- [ ] **Network dropdown** - Click
  - Expected: Shows available networks
- [ ] **Select Localhost** - Click
  - Expected: Switches to localhost:8545
- [ ] **Wrong network warning** - If on wrong chain
  - Expected: Red banner appears
  - Expected: "Switch Network" button visible

#### Interactive Elements - Candidate Selection
- [ ] **Candidate card 1** - Click radio button
  - Expected: Radio selected
  - Expected: Other radios deselected
- [ ] **Candidate card 2** - Click anywhere on card
  - Expected: Radio selected
  - Expected: Card highlights
- [ ] **Candidate card 3** - Click
  - Expected: Previous selection clears
- [ ] **Hover effect** - Hover over cards
  - Expected: Card scales slightly or highlights

#### Interactive Elements - Voting
- [ ] **Cast Vote button** - Without selection
  - Expected: Button disabled OR shows error
- [ ] **Cast Vote button** - With selection + wallet
  - Expected: Button enabled
- [ ] **Cast Vote button** - Click when enabled
  - Expected: Confirmation modal appears
- [ ] **Cancel in modal** - Click cancel
  - Expected: Modal closes, no action
- [ ] **Confirm vote** - Click confirm
  - Expected: MetaMask opens for signature
  - Expected: Loading state shows
- [ ] **Sign transaction** - Approve in MetaMask
  - Expected: Transaction processes
  - Expected: Success message appears
  - Expected: Vote status updates

#### Interactive Elements - Phase Display
- [ ] Phase badge shows correct phase
- [ ] Phase description text visible
- [ ] Instructions change per phase
- [ ] In wrong phase, voting disabled

#### Keyboard Navigation
- [ ] Tab key moves through elements
- [ ] Enter key submits forms
- [ ] Space key selects radio buttons
- [ ] Esc key closes modals

### 3. Admin Panel Page

#### Visual Elements
- [ ] Admin header/title visible
- [ ] Different styling from voter page
- [ ] Control panel layout clear
- [ ] Status information displayed

#### Interactive Elements - Candidate Management
- [ ] **Add Candidate input** - Type name
  - Expected: Text appears
- [ ] **Add Candidate button** - Click with empty name
  - Expected: Validation error
- [ ] **Add Candidate button** - Click with name
  - Expected: MetaMask opens
  - Expected: Transaction confirms
  - Expected: Candidate appears in list
- [ ] **Remove button** - Click on candidate
  - Expected: Confirmation dialog
  - Expected: Candidate deactivated

#### Interactive Elements - Phase Control
- [ ] **Start Reveal button** - In commit phase
  - Expected: Confirmation modal
  - Expected: MetaMask transaction
  - Expected: Phase changes to Reveal
- [ ] **Start Reveal button** - In reveal phase
  - Expected: Button disabled
- [ ] **Finish Election button** - In reveal phase
  - Expected: Confirmation needed
  - Expected: Transaction processes
  - Expected: Phase changes to Finished
- [ ] **Reset Election button** - After finish
  - Expected: Confirmation required
  - Expected: Election resets to Commit

#### Interactive Elements - Status Display
- [ ] Current phase updates immediately
- [ ] Candidate count updates
- [ ] Vote count visible (in reveal/finish)
- [ ] Admin address displayed

### 4. Tally/Results Page

#### Visual Elements
- [ ] Results title/header
- [ ] Table or list of candidates
- [ ] Vote counts visible
- [ ] Percentages calculated
- [ ] Winner highlighted (crown/star/color)
- [ ] Chart/graph (if implemented)

#### Interactive Elements
- [ ] **Sort by votes** - Click column header
  - Expected: Sorts descending
- [ ] **Sort by name** - Click column header
  - Expected: Sorts alphabetically
- [ ] **Export results** - Click button (if exists)
  - Expected: Downloads CSV/PDF
- [ ] **Refresh button** - Click
  - Expected: Reloads data
- [ ] **Back to vote** - Click link
  - Expected: Navigates to voter page

#### Data Accuracy
- [ ] Vote counts match blockchain
- [ ] Percentages sum to 100%
- [ ] Winner correctly identified
- [ ] No missing candidates

### 5. Navigation & Routing

#### Menu/Navigation Bar
- [ ] **Home link** - Click
  - Expected: Goes to KYC page
- [ ] **Vote link** - Click
  - Expected: Goes to voter dashboard
- [ ] **Admin link** - Click
  - Expected: Goes to admin panel
- [ ] **Results link** - Click
  - Expected: Goes to tally page
- [ ] **Logo** - Click
  - Expected: Goes to home page

#### Browser Navigation
- [ ] **Back button** - Click
  - Expected: Goes to previous page
- [ ] **Forward button** - Click
  - Expected: Goes forward in history
- [ ] **Refresh page** - F5 or refresh button
  - Expected: Page reloads, state maintained
- [ ] **Direct URL** - Enter URL in address bar
  - Expected: Navigates correctly

### 6. Accessibility Tests

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter key activates buttons
- [ ] Esc key closes modals/dialogs

#### Screen Reader Compatibility
- [ ] Images have alt text
- [ ] Buttons have aria-labels
- [ ] Form inputs have labels
- [ ] Error messages announced

#### Visual Accessibility
- [ ] Text contrast sufficient (WCAG AA)
- [ ] Font size readable
- [ ] Color not only indicator
- [ ] Focus states visible

### 7. Error Handling

#### Network Errors
- [ ] **No internet** - Disconnect internet
  - Expected: Error message shows
- [ ] **Wrong network** - Switch to wrong chain
  - Expected: Warning appears
  - Expected: Switch network option

#### Wallet Errors
- [ ] **No wallet installed** - Use browser without MetaMask
  - Expected: Install prompt shows
- [ ] **Wallet locked** - Lock MetaMask
  - Expected: Unlock prompt
- [ ] **Transaction rejected** - Reject in MetaMask
  - Expected: Error message, can retry

#### Form Errors
- [ ] **Invalid voter ID** - Enter "INVALID123"
  - Expected: "Not eligible" message
- [ ] **Empty fields** - Submit empty form
  - Expected: Validation errors
- [ ] **Wrong format** - Enter special characters
  - Expected: Sanitized or rejected

### 8. Loading States

#### Async Operations
- [ ] **Page load** - Initial render
  - Expected: Loading skeleton/spinner
- [ ] **Wallet connecting** - Click connect
  - Expected: "Connecting..." state
- [ ] **Transaction pending** - After submit
  - Expected: Spinner, disabled buttons
- [ ] **Data fetching** - Loading candidates
  - Expected: Loading indicators

#### Loading Indicators
- [ ] Spinner animation smooth
- [ ] Loading text visible
- [ ] Button disabled during load
- [ ] Skeleton screens present

### 9. Mobile Responsiveness

#### Mobile Viewport (375x667)
- [ ] All text readable
- [ ] Buttons large enough to tap
- [ ] No horizontal scroll
- [ ] Forms fill screen width
- [ ] Modals fit viewport
- [ ] Navigation accessible

#### Touch Interactions
- [ ] Tap buttons work
- [ ] Swipe gestures (if any)
- [ ] Pinch to zoom disabled on inputs
- [ ] Touch targets 44x44px minimum

### 10. Cross-Browser Testing

#### Chrome
- [ ] All features work
- [ ] Styling correct
- [ ] MetaMask connects

#### Firefox
- [ ] All features work
- [ ] Styling correct
- [ ] MetaMask connects

#### Edge
- [ ] All features work
- [ ] Styling correct
- [ ] MetaMask connects

#### Safari (if available)
- [ ] All features work
- [ ] Styling correct
- [ ] MetaMask connects

---

## 📱 MOBILE APP TESTS

### Android App

#### Installation
- [ ] APK installs successfully
- [ ] App icon appears in launcher
- [ ] App name correct
- [ ] Permissions requested on first launch

#### Launch & Navigation
- [ ] **App launch** - Tap icon
  - Expected: Opens within 2 seconds
  - Expected: Splash screen (if any)
- [ ] **Navigation drawer** - Swipe from left
  - Expected: Menu opens
- [ ] **Menu items** - Tap each
  - Expected: Navigates to screen

#### Voting Features
- [ ] **QR code scanner** - Tap scan button
  - Expected: Camera opens
  - Expected: QR code detected
- [ ] **Wallet connect** - Tap connect
  - Expected: MetaMask mobile opens
  - Expected: Returns to app after
- [ ] **Select candidate** - Tap card
  - Expected: Selection highlights
- [ ] **Submit vote** - Tap vote button
  - Expected: Confirmation dialog
  - Expected: Transaction processes

#### Device Features
- [ ] **Camera permission** - Grant access
  - Expected: QR scanner works
- [ ] **Network change** - Switch WiFi/Mobile
  - Expected: App handles gracefully
- [ ] **Background/Foreground** - Switch apps
  - Expected: State preserved
- [ ] **Rotation** - Rotate device
  - Expected: Layout adjusts

#### Performance
- [ ] App launch < 3 seconds
- [ ] Screen transitions smooth (60fps)
- [ ] No crashes during testing
- [ ] Memory usage reasonable

---

## ✅ PASS CRITERIA

For each test item:
- ✅ **PASS**: Feature works as expected
- ⚠️ **PARTIAL**: Works but has minor issues
- ❌ **FAIL**: Does not work, blocks functionality
- 📝 **N/A**: Not applicable or not implemented

---

## 📊 SCORING

**Total Tests**: 200+ individual checks

**Grading**:
- 95-100%: Excellent ✅
- 85-94%: Good ⚠️
- 75-84%: Acceptable ⚠️
- Below 75%: Needs work ❌

---

## 🎬 TESTING WORKFLOW

### Before Starting
1. Clear browser cache
2. Ensure MetaMask installed
3. Have test voter IDs ready
4. Start local blockchain
5. Deploy contracts
6. Start backend server
7. Start frontend dev server

### During Testing
1. Go through each section systematically
2. Check off items as you test
3. Note any issues immediately
4. Screenshot bugs
5. Record time taken

### After Testing
1. Calculate pass rate
2. Document all failures
3. Create bug tickets
4. Prioritize fixes
5. Retest after fixes

---

## 📝 NOTES SECTION

**Tester Name**: ________________
**Date**: ________________
**Browser**: ________________
**Version**: ________________

**Issues Found**:
```
1. 
2. 
3. 
```

**Recommendations**:
```
1. 
2. 
3. 
```

---

*Use this checklist before any demo, presentation, or deployment to ensure everything works perfectly!*

