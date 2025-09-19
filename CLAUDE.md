# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side referral tracking script that monitors URL parameters for referral hashes and tracks wallet connections for EVM-compatible wallets. When a user with a referral link connects their wallet, the script sends tracking data to a configured server endpoint.

## Key Commands

```bash
# Build minified production version
pnpm run build

# Build development version (not minified)
pnpm run build:dev

# Watch mode for development
pnpm run watch

# Start local server for testing
pnpm run serve

# Build and serve for development
pnpm run dev
```

## Architecture

### Core Components

**src/tracker.js** - Main tracking script that:
- Detects referral hashes from URL parameters (`?ref=`, `?referral=`, `#ref=`, `#referral=`)
- Listens for multiple wallet connection events (MetaMask, Web3Modal, WalletConnect, custom events)
- Collects browser metadata while respecting GDPR considerations
- Sends tracking data via POST request when wallet is connected

### Integration Methods

1. **Auto-initialization**: Include script with `data-referral-tracker-url` attribute
2. **Manual initialization**: Create new `ReferralTracker` instance with server URL

### Event Listeners

The tracker listens for:
- EIP-1193 provider events (`accountsChanged`)
- Custom events (`walletConnected`, `wallet:connected`)
- Web3Modal events (`Web3Modal:accountsChanged`)
- WalletConnect events (`walletconnect:connect`)

### Data Collection

Collects comprehensive browser metadata including:
- Basic browser info (userAgent, language, platform)
- Display metrics (resolution, viewport, color depth)
- Capabilities (storage, WebGL, canvas support)
- Performance metrics (page load time)
- Network info (connection type when available)

GDPR-sensitive fields are clearly marked with comments in the code.

## Testing

Use `example.html` to test the tracking functionality:
1. Build the script: `pnpm run build:dev`
2. Start server: `pnpm run serve`
3. Open http://localhost:3000/example.html
4. Add referral parameters to URL (e.g., `?ref=TEST123`)
5. Use simulation buttons to test wallet connections

## Important Notes

- The script uses an IIFE pattern for browser compatibility
- Tracking only occurs once per session when a referral hash is present
- Failed tracking attempts are logged but don't break the page
- The script is designed to be lightweight and non-intrusive