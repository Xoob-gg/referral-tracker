# Referral Tracker

Client-side referral tracking script for EVM wallet connections. Automatically detects referral parameters and tracks wallet connections across multiple Web3 providers.

## CDN Usage

### Quick Start

```html
<!-- Auto-initialization -->
<script
  src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"
  data-referral-tracker-url="https://your-server.com/api/track"
></script>
```

### Manual Initialization

```html
<script src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"></script>
<script>
  new ReferralTracker('https://your-server.com/api/track');
</script>
```

### Version Pinning (Recommended for Production)

```html
<!-- Pin to specific version -->
<script src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@v1.0.0/tracker.min.js"></script>
```

## How It Works

1. **Detects referral parameters** from URL: `?ref=`, `?referral=`, `#ref=`, `#referral=`
2. **Stores referral hash** in localStorage for session persistence
3. **Listens for wallet connections** (MetaMask, WalletConnect, Web3Modal, etc.)
4. **Sends tracking data** to your server endpoint when a wallet connects

## Integration Examples

### Next.js App Router

```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"
          data-referral-tracker-url="https://api.yourapp.com/track-referral"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Next.js Pages Router

```tsx
// pages/_app.tsx
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"
        data-referral-tracker-url="https://api.yourapp.com/track-referral"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

### React (Vite/Create React App)

```tsx
// App.tsx or index.html
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js';
    script.setAttribute('data-referral-tracker-url', 'https://api.yourapp.com/track-referral');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div>Your App</div>;
}
```

Or simply add to `index.html`:

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <script
      src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"
      data-referral-tracker-url="https://api.yourapp.com/track-referral"
    ></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### Vue.js

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js';
    script.setAttribute('data-referral-tracker-url', 'https://api.yourapp.com/track-referral');
    document.head.appendChild(script);
  }
}
</script>
```

Or in `index.html`:

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <script
      src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"
      data-referral-tracker-url="https://api.yourapp.com/track-referral"
    ></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

### Vanilla HTML/JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Auto-initialization -->
    <script
      src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"
      data-referral-tracker-url="https://api.yourapp.com/track-referral"
    ></script>
  </head>
  <body>
    <button id="connectWallet">Connect Wallet</button>
  </body>
</html>
```

### With Web3Modal

```html
<script src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/web3modal@latest/dist/index.js"></script>

<script>
  // Initialize tracker manually
  new ReferralTracker('https://api.yourapp.com/track-referral');

  // Setup Web3Modal as usual
  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
  });

  // The tracker automatically listens to wallet connection events
  async function connectWallet() {
    const provider = await web3Modal.connect();
    // Tracker will automatically detect the connection
  }
</script>
```

### With RainbowKit (React)

```tsx
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load tracker script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js';
    script.setAttribute('data-referral-tracker-url', 'https://api.yourapp.com/track-referral');
    document.head.appendChild(script);
  }, []);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {/* Your app */}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
```

### With Wagmi + ConnectKit

```tsx
import { ConnectKitProvider } from 'connectkit';
import { WagmiConfig } from 'wagmi';
import Script from 'next/script';

function App() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/Xoob-gg/referral-tracker@latest/tracker.min.js"
        data-referral-tracker-url="https://api.yourapp.com/track-referral"
      />
      <WagmiConfig client={wagmiClient}>
        <ConnectKitProvider>
          {/* Your app */}
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
```

### Custom Wallet Connection

If you have a custom wallet connection implementation, trigger a custom event:

```javascript
// After successful wallet connection
const event = new CustomEvent('walletConnected', {
  detail: { address: '0x...' }
});
window.dispatchEvent(event);

// Or use the alternative event name
const event2 = new CustomEvent('wallet:connected', {
  detail: { address: '0x...' }
});
window.dispatchEvent(event2);
```

### Server-Side Endpoint Example

Your tracking endpoint should handle POST requests:

```typescript
// Next.js API Route (app/api/track-referral/route.ts)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();

  const { referralHash, walletAddress, timestamp, metadata } = data;

  // Store in your database
  await db.referrals.create({
    referralCode: referralHash,
    walletAddress: walletAddress.toLowerCase(),
    timestamp: new Date(timestamp),
    userAgent: metadata.userAgent,
    // ... other metadata
  });

  return NextResponse.json({ success: true });
}
```

```javascript
// Express.js endpoint
app.post('/api/track-referral', async (req, res) => {
  const { referralHash, walletAddress, timestamp, metadata } = req.body;

  // Store in your database
  await db.referrals.create({
    referralCode: referralHash,
    walletAddress: walletAddress.toLowerCase(),
    timestamp: new Date(timestamp),
    userAgent: metadata.userAgent,
    // ... other metadata
  });

  res.json({ success: true });
});
```

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
