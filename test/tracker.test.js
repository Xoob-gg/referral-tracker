// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import the script which registers the class on window
import '../src/tracker.js'

const getReferralTracker = () => window.ReferralTracker

describe('ReferralTracker', () => {
  beforeEach(() => {
    // reset url to a clean state
    window.history.replaceState({}, '', '/')

    // Clear any flags
    sessionStorage.clear()

    // Reset spies/mocks
    vi.restoreAllMocks()

    // Ensure there is no pre-existing global instance
    delete window.referralTracker
  })

  it('generates a session id', () => {
    const ReferralTracker = getReferralTracker()
    const rt = new ReferralTracker('https://example.com/api')
    expect(rt.sessionId).toBeTruthy()
    expect(typeof rt.sessionId).toBe('string')
    expect(rt.sessionId.includes('-')).toBe(true)
  })

  it('auto-initializes from script data attribute on DOMContentLoaded', () => {
    // Create a script tag with the data attribute
    const script = document.createElement('script')
    script.setAttribute('data-referral-tracker-url', 'https://example.com/api')
    document.body.appendChild(script)

    // Dispatch DOMContentLoaded to trigger auto-init
    const event = new window.Event('DOMContentLoaded')
    window.dispatchEvent(event)

    expect(window.referralTracker).toBeDefined()
    expect(window.referralTracker.serverUrl).toBe('https://example.com/api')
  })

  it('detects referral hash from query string', () => {
    window.history.pushState({}, '', '/?ref=myhash123')
    const ReferralTracker = getReferralTracker()
    const rt = new ReferralTracker('https://example.com/api')
    expect(rt.referralHash).toBe('myhash123')
    expect(rt.isTrackingNeeded()).toBe(true)
  })

  it('detects referral hash from hash fragment', () => {
    window.history.pushState({}, '', '/#referral=abcDEF')
    const ReferralTracker = getReferralTracker()
    const rt = new ReferralTracker('https://example.com/api')
    expect(rt.referralHash).toBe('abcDEF')
  })

  it('manualTrackWallet triggers sendReferralData once when referral is present', async () => {
    window.history.pushState({}, '', '/?ref=xyz')

    const ReferralTracker = getReferralTracker()
    const sendSpy = vi.spyOn(ReferralTracker.prototype, 'sendReferralData').mockResolvedValue()

    const rt = new ReferralTracker('https://example.com/api')
    expect(rt.walletConnected).toBe(false)

    rt.manualTrackWallet('0x123')

    expect(sendSpy).toHaveBeenCalledTimes(1)
    expect(sendSpy).toHaveBeenCalledWith('0x123', expect.any(Object))
    expect(rt.walletConnected).toBe(true)

    // Second call should be ignored because already connected
    rt.manualTrackWallet('0x123')
    expect(sendSpy).toHaveBeenCalledTimes(1)
  })

  it('collectMetadata returns expected fields', () => {
    window.history.pushState({}, '', '/?ref=xyz')
    const ReferralTracker = getReferralTracker()
    const rt = new ReferralTracker('https://example.com/api')

    const meta = rt.collectMetadata()
    expect(meta).toHaveProperty('userAgent')
    expect(meta).toHaveProperty('language')
    expect(meta).toHaveProperty('platform')
    expect(meta).toHaveProperty('timezone')
    expect(meta).toHaveProperty('referrer')
    expect(meta).toHaveProperty('currentUrl')
    expect(meta.currentUrl).toContain('ref=xyz')
    expect(meta).toHaveProperty('sessionId', rt.sessionId)
  })

  it('sendReferralData posts payload and sets sessionStorage on success', async () => {
    window.history.pushState({}, '', '/?ref=abc')
    const ReferralTracker = getReferralTracker()
    const rt = new ReferralTracker('https://example.com/api/tracking/events')

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, statusText: 'OK' })
    // @ts-ignore
    globalThis.fetch = fetchMock

    const meta = { any: 'thing' }
    await rt.sendReferralData('0xABC', meta)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.com/api/tracking/events')
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    const body = JSON.parse(options.body)
    expect(body.walletAddress).toBe('0xABC')
    expect(body.referralHash).toBe('abc')
    expect(body.metadata).toEqual(meta)

    expect(sessionStorage.getItem('referralTracked')).toBe('true')
  })

  it('sendReferralData handles non-ok responses', async () => {
    window.history.pushState({}, '', '/?ref=abc')
    const ReferralTracker = getReferralTracker()
    const rt = new ReferralTracker('https://example.com/api/tracking/events')

    const fetchMock = vi.fn().mockResolvedValue({ ok: false, statusText: 'Bad Request' })
    // @ts-ignore
    globalThis.fetch = fetchMock

    const meta = {}
    await rt.sendReferralData('0xABC', meta)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('isTrackingNeeded reflects state before/after connection', () => {
    window.history.pushState({}, '', '/?ref=zzz')
    const ReferralTracker = getReferralTracker()
    const rt = new ReferralTracker('https://example.com/api')

    expect(rt.isTrackingNeeded()).toBe(true)
    rt.manualTrackWallet('0x1')
    expect(rt.isTrackingNeeded()).toBe(false)
  })
})
