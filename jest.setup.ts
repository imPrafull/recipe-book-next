// Polyfill fetch API for MSW v2 in Node.js environment
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

// Ensure TextEncoder/TextDecoder are available globally
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
  // Clear localStorage between tests to prevent auth state pollution
  localStorage.clear();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});

// Mock localStorage for jsdom environment
// jsdom doesn't reliably persist localStorage across test isolation
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index: number) {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.matchMedia (used by many UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver (used by lazy loading components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock lucide-react icons (ESM-only package)
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    Search: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'search-icon', className }),
    Heart: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'heart-icon', className }),
    Clock: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'clock-icon', className }),
    ChefHat: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'chef-hat-icon', className }),
    User: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'user-icon', className }),
    Users: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'users-icon', className }),
    LogOut: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'logout-icon', className }),
    Plus: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'plus-icon', className }),
    Trash: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'trash-icon', className }),
    Edit: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'edit-icon', className }),
    X: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'x-icon', className }),
    Lock: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'lock-icon', className }),
    Check: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'check-icon', className }),
    RotateCcw: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'rotate-ccw-icon', className }),
    ChevronLeft: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'chevron-left-icon', className }),
    ChevronRight: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'chevron-right-icon', className }),
    Flame: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'flame-icon', className }),
    CalendarPlus: ({ className }: { className?: string }) => React.createElement('svg', { 'data-testid': 'calendar-plus-icon', className }),
  };
});
