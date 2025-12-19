# Clear KYC Status for Testing

If KYC is being skipped, you can clear the localStorage to force KYC again.

## Method 1: Browser Console

Open browser console (F12) and run:

```javascript
// Clear all KYC data
localStorage.clear();

// Or clear specific account's KYC
const account = "YOUR_ACCOUNT_ADDRESS_HERE";
localStorage.removeItem(`bv_kyc_${account.toLowerCase()}`);
localStorage.removeItem(`bv_voter_id_${account.toLowerCase()}`);
```

## Method 2: Clear All Browser Data

1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Local Storage" → `http://localhost:5176`
4. Delete all items or specific KYC keys
5. Refresh the page

## Method 3: Use Incognito/Private Window

Open the app in an incognito/private window - it will have no localStorage data.

