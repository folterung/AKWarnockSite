// Learn more: https://github.com/testing-library/jest-dom
// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEach` from `jest.config.js`

// JSDOM does not implement IntersectionObserver; components that use it
// (e.g. reveal-on-scroll on the ScratchyTD roadmap) need a minimal shim.
if (typeof global.IntersectionObserver === 'undefined') {
  class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  global.IntersectionObserver = IntersectionObserver
}
