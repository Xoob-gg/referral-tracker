# Referral Tracker

A lightweight, client-side script that detects referral hashes in the URL and sends a single tracking event when a user connects their crypto wallet. It supports automatic initialization via a data attribute or manual initialization via JavaScript.

- Detects referral codes from query string (?ref= or ?referral=) or hash fragment (#ref= or #referral=)
- Listens to multiple wallet connection sources (MetaMask/EIP‑1193, Web3Modal, WalletConnect, and custom browser events)
- Gathers non-sensitive metadata (user agent, language, platform, timezone, referrer, current URL, session id)
- Sends a POST request to your backend endpoint once per session, and marks success in sessionStorage to avoid duplicates in the same session


## Contents
- What is it?
- Quick start
- Auto‑init vs Manual init
- API Reference
- Events the tracker listens to
- Metadata sent to your server
- Expected server endpoint (contract)
- Examples
- Development
- Testing
- Build
- Troubleshooting & FAQ


## What is it?
The Referral Tracker is a small JavaScript library that you embed into your website or dApp. When a visitor arrives with a referral code in the URL and subsequently connects a crypto wallet, the tracker sends a single POST request to your backend including the wallet address, the referral hash, and some basic, non‑sensitive context metadata.

The tracker aims to be:
- Easy to integrate (one script tag)
- Wallet‑provider agnostic (multiple events supported)
- Safe by default (no PII, minimal metadata, session‑based duplicate prevention)


## Quick start
1) Install dependencies and build the script

- Using npm
  - npm install
  - npm run build

- Using pnpm
  - pnpm install
  - pnpm run build

This outputs bundled files into dist/ (tracker.js for dev, tracker.min.js for production if you used the build script with --minify).

2) Include the script on your page

Auto‑initialize (recommended):

<script src="/dist/tracker.min.js" data-referral-tracker-url="https://your.api/endpoint"></script>

Manual initialization:

<script src="/dist/tracker.min.js"></script>
<script>
  // Make sure to set your backend URL
  window.referralTracker = new ReferralTracker('https://your.api/endpoint');
</script>

3) Make sure your backend is ready to accept POST requests at the configured URL. See Expected server endpoint below.

Tip: For a local demo, open index.html and adjust the data-referral-tracker-url to your local API.


## Auto‑init vs Manual init
- Auto‑init: If the script tag includes data-referral-tracker-url, the tracker auto‑initializes on DOMContentLoaded and assigns a global instance to window.referralTracker. It also exposes the class at window.ReferralTracker.
- Manual init: If you omit the data attribute, you can create your own instance in code: new ReferralTracker('<server-url>'). The class is exposed on window.ReferralTracker.


## How referral detection and sending works
- On page load, ReferralTracker looks for a referral hash in:
  - Query string: ?ref= or ?referral=
  - Hash fragment: #ref= or #referral=
- If a referral hash is found, the tracker sets up listeners for wallet connection events.
- Once a wallet address is detected, the tracker collects metadata and POSTs the payload to your server. On success, it sets sessionStorage['referralTracked'] = 'true' to avoid duplicates in the same session.

Note: The tracker will only send when both a referral hash is present and a wallet connection is detected, and only once per session.


## API Reference
Class: window.ReferralTracker

Constructor
- new ReferralTracker(serverUrl?: string)
  - serverUrl: string URL to your tracking endpoint. If omitted, the tracker uses a default URL hardcoded in the source (intended for development). You should set this explicitly in production.

Instance properties
- serverUrl: string – current endpoint URL used for POST.
- referralHash: string | null – the detected referral hash, or null if none is present.
- sessionId: string – unique ID for the current page session.
- walletConnected: boolean – whether a wallet address was already captured/sent for this session.

Instance methods
- manualTrackWallet(walletAddress: string): void
  - Manually trigger tracking when you already have the wallet address (only sends if referralHash exists and no send has occurred yet).

- setServerUrl(url: string): void
  - Update the endpoint dynamically at runtime.

- isTrackingNeeded(): boolean
  - Returns true if a referral hash exists and an event hasn’t been sent yet for this session.

- collectMetadata(): object
  - Returns the metadata object that will be sent alongside the payload.

- sendReferralData(walletAddress: string, metadata: object): Promise<void>
  - Sends the tracking POST. Normally called internally when a wallet is detected. You can call it directly if needed (ensure referralHash is present).


## Events the tracker listens to
The tracker tries to be wallet‑agnostic by listening to several possible sources for a wallet address:
- EIP‑1193 compatible providers (e.g., MetaMask)
  - ethereum.on('accountsChanged', (accounts: string[]))
  - ethereum.selectedAddress
  - ethereum.request({ method: 'eth_accounts' })
- Custom browser event
  - window.dispatchEvent(new CustomEvent('walletConnected', { detail: { address: '0x...' } }))
- Web3Modal event
  - window.dispatchEvent(new CustomEvent('Web3Modal:accountsChanged', { detail: { accounts: ['0x...'] } }))
- WalletConnect event
  - window.dispatchEvent(new CustomEvent('walletconnect:connect', { detail: { address: '0x...' } }))
- Generic wallet event
  - window.dispatchEvent(new CustomEvent('wallet:connected', { detail: { address: '0x...' } }))

The tracker will ignore subsequent events after it has already sent once in the current session.


## Metadata sent to your server
The metadata object includes:
- userAgent: navigator.userAgent
- language: navigator.language
- platform: navigator.platform
- timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
- referrer: document.referrer
- currentUrl: window.location.href (often contains the referral parameter)
- sessionId: a generated value of the form `${Date.now()}-${randomString}`

No PII is collected by default. You can fork/extend the library if you need to add or strip fields.


## Expected server endpoint (contract)
Endpoint: POST {serverUrl}

Headers
- Content-Type: application/json

Request body (JSON)
{
  "walletAddress": "0xabc...",
  "referralHash": "abc123",
  "metadata": { ...metadata fields described above }
}

Responses
- 2xx: Treat as success. The tracker logs success and sets sessionStorage['referralTracked'] = 'true'.
- Non‑2xx: The tracker logs an error. You may implement retries by extending sendReferralData.

Security notes
- Always validate and sanitize incoming data on the server.
- Consider rate limiting to prevent abuse.


## Examples
- See index.html for a complete interactive demo showcasing:
  - Auto‑init via data attribute
  - Manual init example (commented)
  - Simulated events for MetaMask, Web3Modal, and custom events

- Minimal auto‑init example:

<script src="/dist/tracker.min.js" data-referral-tracker-url="https://your.api/endpoint"></script>

- Minimal manual init example:

<script src="/dist/tracker.min.js"></script>
<script>
  const tracker = new ReferralTracker('https://your.api/endpoint');
  // Optional: trigger manually if you already have an address
  tracker.manualTrackWallet('0x1234...');
</script>


## Development
- Dev server: pnpm run dev (or npm run dev)
  - Builds dist/tracker.js then serves the repository at http://localhost:3000
- Watch build: pnpm run watch
- Build (prod): pnpm run build (bundled + minified to dist/tracker.min.js)
- Build (dev): pnpm run build:dev (bundled, unminified to dist/tracker.js)

You can open index.html in your browser (or via the dev server) and adjust the data-referral-tracker-url to point to your local API (e.g., http://localhost:3001/api/referral).


## Testing
- Run tests: pnpm run test (or npm run test)
- Watch mode: pnpm run test:watch
- Coverage: pnpm run coverage

Tests run under Vitest with a jsdom environment and validate the core behaviors: referral detection, metadata collection, POST payload, session behavior, and auto‑initialization.


## Build
This project uses esbuild.
- Entry: src/tracker.js
- Outputs: dist/tracker.js (dev), dist/tracker.min.js (prod)

If you plan to publish the built file to a CDN, run the production build and upload dist/tracker.min.js.


## Troubleshooting & FAQ
- No event is being sent
  - Ensure the page URL contains ?ref= or ?referral= (or #ref= / #referral=)
  - Ensure a wallet address event actually fires (see Events the tracker listens to). Use the simulator buttons in index.html.
  - Check that your server URL is correctly configured in the script tag or when constructing ReferralTracker.

- It sends more than once per page
  - The tracker sets sessionStorage['referralTracked'] = 'true' only on successful response. If your server returns non‑2xx, retries are not attempted by default and the flag is not set. You can add retry logic or set your own guard.

- Where do I see logs?
  - Open the browser devtools console. The demo page (index.html) also mirrors console logs into the on‑page log area.

- Can I change the endpoint at runtime?
  - Yes: tracker.setServerUrl('https://new.url').

- What wallets are supported?
  - Any EIP‑1193 provider (MetaMask, many others). Also custom events, Web3Modal, WalletConnect, or your own integration emitting the documented events.


---

If you have questions or run into issues, please open an issue or PR in this repository.
