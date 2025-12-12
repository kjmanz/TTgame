/**
 * Cache Management Utilities for TTgame
 * Monitors localStorage usage and provides auto-cleanup functionality
 */

// Get total localStorage usage in bytes
export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
    let used = 0;

    for (const key of Object.keys(localStorage)) {
        const value = localStorage.getItem(key);
        if (value) {
            // Calculate string size in bytes (UTF-16 = 2 bytes per character)
            used += (key.length + value.length) * 2;
        }
    }

    // Most browsers allow ~5-10MB for localStorage
    const total = 5 * 1024 * 1024; // 5MB estimate

    return {
        used,
        total,
        percentage: Math.round((used / total) * 100)
    };
};

// Format bytes to human readable string
export const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Get size of a specific key
export const getKeySize = (key: string): number => {
    const value = localStorage.getItem(key);
    if (!value) return 0;
    return (key.length + value.length) * 2;
};

// Save slot keys for reference
const SAVE_SLOT_KEYS = [
    'takeru_tales_slot_1',
    'takeru_tales_slot_2',
    'takeru_tales_slot_3'
];

// Get old save data items sorted by date (oldest first)
export const getOldSaveSlots = (): { key: string; date: number; size: number }[] => {
    const slots: { key: string; date: number; size: number }[] = [];

    for (const key of SAVE_SLOT_KEYS) {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                slots.push({
                    key,
                    date: parsed.lastSaveDate || 0,
                    size: getKeySize(key)
                });
            }
        } catch (e) {
            console.error(`Error parsing save slot ${key}:`, e);
        }
    }

    // Sort by date, oldest first
    return slots.sort((a, b) => a.date - b.date);
};

// Clean up oldest save slot to free space
export const cleanOldestSlot = (): { cleaned: boolean; freedBytes: number } => {
    const slots = getOldSaveSlots();

    if (slots.length === 0) {
        return { cleaned: false, freedBytes: 0 };
    }

    // Remove the oldest slot
    const oldest = slots[0];
    try {
        localStorage.removeItem(oldest.key);
        return { cleaned: true, freedBytes: oldest.size };
    } catch (e) {
        console.error('Failed to clean oldest slot:', e);
        return { cleaned: false, freedBytes: 0 };
    }
};

// Check if storage is near full (>80%)
export const isStorageNearFull = (): boolean => {
    const { percentage } = getStorageUsage();
    return percentage >= 80;
};

// Try to save with automatic cleanup if needed
export const safeStorageSet = (key: string, value: string): boolean => {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        // Storage might be full, try cleaning up
        console.warn('Storage full, attempting cleanup...', e);

        // Try up to 3 cleanup attempts
        for (let i = 0; i < 3; i++) {
            const { cleaned, freedBytes } = cleanOldestSlot();
            if (!cleaned) break;

            console.log(`Cleaned ${formatBytes(freedBytes)} from old save`);

            try {
                localStorage.setItem(key, value);
                return true;
            } catch {
                // Continue trying
            }
        }

        return false;
    }
};

// Get storage summary for display
export const getStorageSummary = (): string => {
    const { used, total, percentage } = getStorageUsage();
    return `${formatBytes(used)} / ${formatBytes(total)} (${percentage}%)`;
};
