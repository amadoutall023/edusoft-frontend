const ACTIVE_YEAR_ID_KEY = 'edusoft.activeYearId';
export const ACTIVE_YEAR_CHANGED_EVENT = 'edusoft:active-year-changed';

export function getStoredActiveYearId(): string | null {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(ACTIVE_YEAR_ID_KEY);
    return value && value.trim() ? value : null;
}

export function setStoredActiveYearId(yearId: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACTIVE_YEAR_ID_KEY, yearId);
}

export function clearStoredActiveYearId(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACTIVE_YEAR_ID_KEY);
}

export function notifyActiveYearChanged(yearId: string | null): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent(ACTIVE_YEAR_CHANGED_EVENT, {
            detail: { yearId }
        })
    );
}
