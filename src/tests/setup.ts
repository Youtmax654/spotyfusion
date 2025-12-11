import { beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

// Assign to global
global.localStorage = localStorageMock as Storage;

// Mock fetch globally
global.fetch = vi.fn();

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});
