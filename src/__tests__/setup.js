/**
 * Test Setup Configuration
 */

// Mock global objects
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  clear: () => {},
};

global.fetch = async () => ({
  ok: true,
  json: async () => ({}),
});

console.log('Test environment initialized');
