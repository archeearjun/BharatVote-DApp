# BharatVote Mobile App

A React Native mobile application for the BharatVote blockchain-based voting system. This app provides a native mobile interface for secure, transparent voting using MetaMask wallet integration.

## Features

- **KYC Verification**: Voter identity verification using government ID
- **MetaMask Integration**: Secure wallet connection via deep linking
- **Blockchain Voting**: Commit-reveal voting mechanism for privacy
- **Election Administration**: Admin panel for election management
- **Real-time Results**: Live election results and vote tallying
- **Cross-platform**: Works on both Android and iOS

## Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- MetaMask mobile app installed on device/emulator

## Installation

1. **Clone the repository**
   ```bash
   cd mobile
   npm install
   ```

2. **Install dependencies**
   ```bash
   # For React Native dependencies
   npm install

   # For iOS (if developing for iOS)
   cd ios && pod install && cd ..
   ```

3. **Start Metro bundler**
   ```bash
   npm start
   ```

4. **Run the app**
   ```bash
   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── PrimaryButton.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── screens/            # Main app screens
│   │   ├── KycScreen.tsx
│   │   ├── WalletConnectScreen.tsx
│   │   ├── VoterScreen.tsx
│   │   ├── AdminScreen.tsx
│   │   └── TallyScreen.tsx
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── services/          # Business logic services
│   │   └── MetaMaskService.ts
│   ├── types/             # TypeScript type definitions
│   │   └── navigation.ts
│   ├── constants/         # App constants and configurations
│   │   └── index.ts
│   └── App.tsx           # Root component
├── android/              # Android-specific code
├── ios/                 # iOS-specific code
├── package.json
├── tsconfig.json
├── metro.config.js
└── babel.config.js
```

## Configuration

### Backend Integration

The app connects to the BharatVote backend API for KYC verification and Merkle proof generation. Update the backend URL in `src/constants/index.ts`:

```typescript
export const BACKEND_URL = "http://your-backend-url:3001";
```

For Android emulator, use:
```typescript
export const BACKEND_URL = "http://10.0.2.2:3001";
```

### MetaMask Integration

The app uses deep linking to connect with MetaMask mobile app. Key features:

- **Auto-detection**: Checks if MetaMask is installed
- **Deep linking**: Opens MetaMask for wallet operations
- **Fallback**: Redirects to Play Store if not installed

## User Flow

1. **KYC Verification**
   - User enters Voter ID (EPIC number)
   - Backend validates against electoral rolls
   - OTP verification for identity confirmation

2. **Wallet Connection**
   - Check MetaMask installation
   - Connect to user's wallet via deep linking
   - Verify wallet address against eligible voters

3. **Voting Process**
   - View registered candidates
   - Commit vote with cryptographic hash
   - Reveal vote in reveal phase
   - View election results

4. **Admin Functions** (for administrators)
   - Add/remove candidates
   - Advance election phases
   - Reset elections
   - View statistics

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# Android
npm run build:android

# Debug build
npm run build:android-debug
```

### Debugging

- Use React Native Debugger
- Enable Metro logging for detailed debug info
- Check device logs for MetaMask integration issues

## MetaMask Integration

The app integrates with MetaMask mobile through:

1. **Deep Links**: `metamask://` for direct app opening
2. **Universal Links**: `https://metamask.app.link` for complex operations
3. **Fallback URLs**: Play Store/App Store for installation

### Supported Wallets

- MetaMask Mobile (primary)
- Future support planned for:
  - Trust Wallet
  - Coinbase Wallet
  - WalletConnect protocol

## Security Considerations

- **Private Keys**: Never stored in app, remain in user's wallet
- **KYC Data**: Validated against backend, not stored locally
- **Network Security**: All API calls use HTTPS
- **Deep Link Validation**: Verify MetaMask responses

## Troubleshooting

### Common Issues

1. **MetaMask not opening**
   - Ensure MetaMask mobile app is installed
   - Check device deep link permissions
   - Verify network connectivity

2. **KYC Verification Fails**
   - Check backend server is running
   - Verify voter ID format (minimum 6 characters)
   - Ensure network connectivity

3. **Build Errors**
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Clean build: `npm run clean`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Network Configuration

For local development with Hardhat:
- Backend: `http://10.0.2.2:3001` (Android emulator)
- Blockchain: `http://10.0.2.2:8545` (Hardhat node)

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow existing code style and patterns
4. Add tests for new functionality
5. Submit pull request

## License

This project is part of the BharatVote blockchain voting system. See main repository for license information.

## Related Projects

- **Smart Contracts**: `/contracts/BharatVote.sol`
- **Backend API**: `/backend/server.js`
- **Web Frontend**: `/frontend/src/`
- **Testing Suite**: `/tests/`

## Support

For issues and support:
1. Check troubleshooting section above
2. Review existing GitHub issues
3. Create new issue with detailed description
4. Include device info, app version, and error logs 