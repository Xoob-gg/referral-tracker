(() => {
  // src/tracker.js
  (function() {
    "use strict";
    class ReferralTracker {
      constructor(serverUrl, options = {}) {
        this.serverUrl = serverUrl || "https://quest-platform-development.up.railway.app/api/tracking/events";
        this.sessionId = this.generateSessionId();
        this.walletConnected = false;
        this.referralTTL = options.referralTTL || 30 * 24 * 60 * 60 * 1e3;
        this.storageKey = "xoob_referral_tracker_data";
        this.init();
      }
      init() {
        this.detectReferralHash();
        if (this.getReferralHash()) {
          this.setupWalletListener();
        }
      }
      generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      #parseReferralHash() {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "")
        );
        return urlParams.get("ref") || urlParams.get("referral") || hashParams.get("ref") || hashParams.get("referral") || null;
      }
      detectReferralHash() {
        const stored = this.getReferralHash();
        if (stored) {
          console.log(
            "[ReferralTracker] Referral hash loaded from storage:",
            stored
          );
          return;
        }
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "")
        );
        const urlHash = this.#parseReferralHash();
        if (!urlHash) {
          return;
        }
        console.log("[ReferralTracker] Referral hash detected:", urlHash);
        this.storeReferral(urlHash);
      }
      storeReferral(hash) {
        if (!window.localStorage) {
          return this.#parseReferralHash();
        }
        const data = {
          hash,
          timestamp: Date.now(),
          expiresAt: Date.now() + this.referralTTL
        };
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(data));
          console.log("[ReferralTracker] Referral hash stored in localStorage");
        } catch (error) {
          console.error(
            "[ReferralTracker] Failed to store referral hash:",
            error
          );
        }
      }
      getReferralHash() {
        if (!window.localStorage) return null;
        try {
          const stored = localStorage.getItem(this.storageKey);
          if (!stored) return null;
          const data = JSON.parse(stored);
          if (data.expiresAt && Date.now() > data.expiresAt) {
            console.log(
              "[ReferralTracker] Stored referral hash expired, clearing"
            );
            this.clearStoredReferral();
            return null;
          }
          return data.hash;
        } catch (error) {
          console.error(
            "[ReferralTracker] Failed to retrieve stored referral:",
            error
          );
          return null;
        }
      }
      clearStoredReferral() {
        if (!window.localStorage) return;
        try {
          localStorage.removeItem(this.storageKey);
          console.log(
            "[ReferralTracker] Referral hash cleared from localStorage"
          );
        } catch (error) {
          console.error(
            "[ReferralTracker] Failed to clear stored referral:",
            error
          );
        }
      }
      setupWalletListener() {
        if (typeof window !== "undefined" && window.ethereum) {
          this.setupEthereumListener();
        }
        window.addEventListener(
          "walletConnected",
          this.handleWalletConnection.bind(this)
        );
        window.addEventListener(
          "Web3Modal:accountsChanged",
          this.handleAccountsChanged.bind(this)
        );
        window.addEventListener(
          "walletconnect:connect",
          this.handleWalletConnection.bind(this)
        );
        window.addEventListener(
          "wallet:connected",
          this.handleWalletConnection.bind(this)
        );
      }
      setupEthereumListener() {
        const ethereum = window.ethereum;
        if (ethereum.on) {
          ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0 && !this.walletConnected) {
              this.handleWalletAddress(accounts[0]);
            }
          });
        }
        if (ethereum.selectedAddress && !this.walletConnected) {
          this.handleWalletAddress(ethereum.selectedAddress);
        }
        if (ethereum.request) {
          ethereum.request({ method: "eth_accounts" }).then((accounts) => {
            if (accounts.length > 0 && !this.walletConnected) {
              this.handleWalletAddress(accounts[0]);
            }
          }).catch((err) => {
            console.error("[ReferralTracker] Error checking accounts:", err);
          });
        }
      }
      handleAccountsChanged(event) {
        const accounts = event.detail?.accounts || event.detail;
        if (Array.isArray(accounts) && accounts.length > 0 && !this.walletConnected) {
          this.handleWalletAddress(accounts[0]);
        }
      }
      handleWalletConnection(event) {
        const address = event.detail?.address || event.detail?.account || event.detail;
        if (address && !this.walletConnected) {
          this.handleWalletAddress(address);
        }
      }
      handleWalletAddress(address) {
        const referralHash = this.getReferralHash();
        if (!referralHash || this.walletConnected) {
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
          sessionId: this.sessionId
        };
        return metadata;
      }
      async sendReferralData(walletAddress, metadata) {
        const referralHash = this.getReferralHash();
        if (!referralHash) return;
        const data = {
          walletAddress,
          referralHash,
          metadata
        };
        try {
          const response = await fetch(this.serverUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          });
          if (response.ok) {
            console.log("[ReferralTracker] Referral data sent successfully");
            this.clearStoredReferral();
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
        }
      }
      // Manual method to track wallet if automatic detection fails
      manualTrackWallet(walletAddress) {
        if (!this.walletConnected && this.getReferralHash()) {
          this.handleWalletAddress(walletAddress);
        }
      }
      // Method to update server URL dynamically
      setServerUrl(url) {
        this.serverUrl = url;
      }
      // Method to check if tracking is needed
      isTrackingNeeded() {
        return this.getReferralHash();
      }
    }
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
      window.ReferralTracker = ReferralTracker;
    }
  })();
})();
