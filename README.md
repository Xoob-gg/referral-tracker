# Referral Tracker

Client-side referral tracking script for EVM wallet connections. Automatically detects referral parameters and tracks wallet connections across multiple Web3 providers.

## CDN Usage

### Quick Start

```html
<!-- Auto-initialization -->
<script
  src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/dist/tracker.min.js"
  data-referral-tracker-url="https://your-server.com/api/track"
></script>
```

### Manual Initialization

```html
<script src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/dist/tracker.min.js"></script>
<script>
  new ReferralTracker('https://your-server.com/api/track');
</script>
```

### Version Pinning (Recommended for Production)

```html
<!-- Pin to specific version -->
<script src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@v1.0.0/dist/tracker.min.js"></script>
```

## How It Works

1. **Detects referral parameters** from URL: `?ref=`, `?referral=`, `#ref=`, `#referral=`
2. **Stores referral hash** in localStorage for session persistence
3. **Listens for wallet connections** (MetaMask, WalletConnect, Web3Modal, etc.)
4. **Sends tracking data** to your server endpoint when a wallet connects

## Supported Wallets

- MetaMask
- WalletConnect
- Web3Modal
- Coinbase Wallet
- Any EIP-1193 compatible wallet
- Custom wallet implementations via events

## Data Collected

The script sends a POST request with the following data:

```json
{
  "referralHash": "ABC123",
  "walletAddress": "0x...",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "metadata": {
    "userAgent": "...",
    "language": "en-US",
    "platform": "MacIntel",
    "screenResolution": "1920x1080",
    "viewport": "1200x800",
    // ... and more browser metadata
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build minified version
pnpm run build

# Development mode (build + serve)
pnpm run dev

# Watch mode
pnpm run watch
```

## Publishing New Versions

1. Update version in `package.json`
2. Create and push a git tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. GitHub Actions will automatically build and create a release
4. jsDelivr CDN will pick up the new version within minutes

## Testing

Open `example.html` in your browser with a referral parameter:
```
http://localhost:3000/example.html?ref=TEST123
```

Use the simulation buttons to test wallet connection tracking.

## License

ISC
