import { describe, it, expect } from 'vitest';
import { firstCharToUpper, formatTimeAgo } from './utils';

describe('firstCharToUpper', () => {
    it('should capitalize the first character of a normal string', () => {
        expect(firstCharToUpper('hello')).toBe('Hello');
        expect(firstCharToUpper('world')).toBe('World');
        expect(firstCharToUpper('test')).toBe('Test');
    });

    it('should handle strings that are already capitalized', () => {
        expect(firstCharToUpper('Hello')).toBe('Hello');
        expect(firstCharToUpper('WORLD')).toBe('WORLD');
    });

    it('should handle empty strings', () => {
        expect(firstCharToUpper('')).toBe('');
    });

    it('should handle single character strings', () => {
        expect(firstCharToUpper('a')).toBe('A');
        expect(firstCharToUpper('Z')).toBe('Z');
    });

    it('should preserve the rest of the string', () => {
        expect(firstCharToUpper('hello world')).toBe('Hello world');
        expect(firstCharToUpper('hELLO')).toBe('HELLO');
    });
});

describe('formatTimeAgo', () => {
    const now = new Date();

    it('should format time in minutes for recent dates', () => {
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        expect(formatTimeAgo(fiveMinutesAgo.toISOString())).toBe('Il y a 5 minutes');

        const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
        expect(formatTimeAgo(oneMinuteAgo.toISOString())).toBe('Il y a 1 minute');
    });

    it('should handle plural correctly for minutes', () => {
        const zeroMinutesAgo = new Date(now.getTime());
        expect(formatTimeAgo(zeroMinutesAgo.toISOString())).toBe('Il y a 0 minute');

        const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
        expect(formatTimeAgo(oneMinuteAgo.toISOString())).toBe('Il y a 1 minute');

        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
        expect(formatTimeAgo(twoMinutesAgo.toISOString())).toBe('Il y a 2 minutes');
    });

    it('should format time in hours for dates within 24 hours', () => {
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        expect(formatTimeAgo(twoHoursAgo.toISOString())).toBe('Il y a 2 heures');

        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        expect(formatTimeAgo(oneHourAgo.toISOString())).toBe('Il y a 1 heure');
    });

    it('should handle plural correctly for hours', () => {
        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        expect(formatTimeAgo(oneHourAgo.toISOString())).toBe('Il y a 1 heure');

        const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
        expect(formatTimeAgo(fiveHoursAgo.toISOString())).toBe('Il y a 5 heures');
    });

    it('should format time in days for older dates', () => {
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(twoDaysAgo.toISOString())).toBe('Il y a 2 jours');

        const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(oneDayAgo.toISOString())).toBe('Il y a 1 jour');
    });

    it('should handle plural correctly for days', () => {
        const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(oneDayAgo.toISOString())).toBe('Il y a 1 jour');

        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(sevenDaysAgo.toISOString())).toBe('Il y a 7 jours');
    });

    it('should handle boundary between minutes and hours (59 minutes)', () => {
        const fiftyNineMinutesAgo = new Date(now.getTime() - 59 * 60 * 1000);
        expect(formatTimeAgo(fiftyNineMinutesAgo.toISOString())).toBe('Il y a 59 minutes');
    });

    it('should handle boundary between hours and days (23 hours)', () => {
        const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
        expect(formatTimeAgo(twentyThreeHoursAgo.toISOString())).toBe('Il y a 23 heures');
    });
});
