import type { KeyboardEvent } from 'react';

const controlKeys = new Set([
    'Backspace',
    'Delete',
    'Tab',
    'Enter',
    'Escape',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
]);

export function digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}

export function decimalOnly(value: string): string {
    const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
    const [first, ...rest] = normalized.split('.');

    return rest.length === 0 ? first : `${first}.${rest.join('')}`;
}

export function preventNonNumericKey(
    event: KeyboardEvent<HTMLInputElement>,
    decimal = false,
): void {
    if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        controlKeys.has(event.key)
    ) {
        return;
    }

    if (/^\d$/.test(event.key)) {
        return;
    }

    if (decimal && (event.key === '.' || event.key === ',')) {
        return;
    }

    event.preventDefault();
}
