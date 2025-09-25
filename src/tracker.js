(function () {
  "use strict";

  class ReferralTracker {
    constructor(serverUrl) {
      // Fallback to default server URL if not provided
      this.serverUrl =
        serverUrl ||
        "https://quest-platform-development.up.railway.app/api/tracking/events";
      this.referralHash = null;
      this.sessionId = this.generateSessionId();
      this.walletConnected = false;
      this.init();
    }

    init() {
      this.detectReferralHash();
      if (this.referralHash) {
        this.setupWalletListener();
      }
    }

    generateSessionId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    detectReferralHash() {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.replace("#", "")
      );

      this.referralHash =
        urlParams.get("ref") ||
        urlParams.get("referral") ||
        hashParams.get("ref") ||
        hashParams.get("referral") ||
        null;

      if (this.referralHash) {
        console.log(
          "[ReferralTracker] Referral hash detected:",
          this.referralHash
        );
      }
    }

    setupWalletListener() {
      // Listen for EIP-1193 provider events
      if (typeof window !== "undefined" && window.ethereum) {
        this.setupEthereumListener();
      }

      // Listen for custom wallet connection events
      window.addEventListener(
        "walletConnected",
        this.handleWalletConnection.bind(this)
      );

      // Listen for Web3Modal events
      window.addEventListener(
        "Web3Modal:accountsChanged",
        this.handleAccountsChanged.bind(this)
      );

      // Listen for WalletConnect events
      window.addEventListener(
        "walletconnect:connect",
        this.handleWalletConnection.bind(this)
      );

      // Generic wallet connection event
      window.addEventListener(
        "wallet:connected",
        this.handleWalletConnection.bind(this)
      );
    }

    setupEthereumListener() {
      const ethereum = window.ethereum;

      // Listen for account changes
      if (ethereum.on) {
        ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0 && !this.walletConnected) {
            this.handleWalletAddress(accounts[0]);
          }
        });
      }

      // Check if already connected
      if (ethereum.selectedAddress && !this.walletConnected) {
        this.handleWalletAddress(ethereum.selectedAddress);
      }

      // Also check using eth_accounts
      if (ethereum.request) {
        ethereum
          .request({ method: "eth_accounts" })
          .then((accounts) => {
            if (accounts.length > 0 && !this.walletConnected) {
              this.handleWalletAddress(accounts[0]);
            }
          })
          .catch((err) => {
            console.error("[ReferralTracker] Error checking accounts:", err);
          });
      }
    }

    handleAccountsChanged(event) {
      const accounts = event.detail?.accounts || event.detail;
      if (
        Array.isArray(accounts) &&
        accounts.length > 0 &&
        !this.walletConnected
      ) {
        this.handleWalletAddress(accounts[0]);
      }
    }

    handleWalletConnection(event) {
      const address =
        event.detail?.address || event.detail?.account || event.detail;
      if (address && !this.walletConnected) {
        this.handleWalletAddress(address);
      }
    }

    handleWalletAddress(address) {
      if (!this.referralHash || this.walletConnected) {
        return;
      }

      this.walletConnected = true;
      const metadata = this.collectMetadata();
      this.sendReferralData(address, metadata);
    }

    collectMetadata() {
      const nav = window.navigator;

      const metadata = {
        // Basic browser information
        userAgent: nav.userAgent,
        language: nav.language,
        platform: nav.platform,

        // Location and time
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

        // Page information
        referrer: document.referrer,
        currentUrl: window.location.href,

        // Session tracking
        sessionId: this.sessionId,
      };

      return metadata;
    }

    async sendReferralData(walletAddress, metadata) {
      if (!this.referralHash) return;

      const data = {
        walletAddress: walletAddress,
        referralHash: this.referralHash,
        metadata: metadata,
      };

      try {
        const response = await fetch(this.serverUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          console.log("[ReferralTracker] Referral data sent successfully");
          // Store success in sessionStorage to prevent duplicate sends
          if (window.sessionStorage) {
            sessionStorage.setItem("referralTracked", "true");
          }
        } else {
          console.error(
            "[ReferralTracker] Failed to send referral data:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("[ReferralTracker] Error sending referral data:", error);
        // Could implement retry logic here
      }
    }

    // Manual method to track wallet if automatic detection fails
    manualTrackWallet(walletAddress) {
      if (!this.walletConnected && this.referralHash) {
        this.handleWalletAddress(walletAddress);
      }
    }

    // Method to update server URL dynamically
    setServerUrl(url) {
      this.serverUrl = url;
    }

    // Method to check if tracking is needed
    isTrackingNeeded() {
      return this.referralHash && !this.walletConnected;
    }
  }

  // Auto-initialize if data attributes are present
  if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      const script = document.querySelector(
        "script[data-referral-tracker-url]"
      );
      if (script) {
        const serverUrl = script.getAttribute("data-referral-tracker-url");
        if (serverUrl) {
          window.ReferralTracker = ReferralTracker;
          window.referralTracker = new ReferralTracker(serverUrl);
        }
      }
    });

    // Also expose the class globally for manual initialization
    window.ReferralTracker = ReferralTracker;
  }
})();
