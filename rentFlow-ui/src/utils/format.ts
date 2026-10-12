const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * "2026-11-01T00:00:00.000Z" -> "1 Nov 2026" (dates are stored as UTC days).
 */
export function formatDate(iso: string): string {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * 15000 -> "₹15,000"
 */
export function formatRupees(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * "01-11-2026" (DD-MM-YYYY) -> "2026-11-01", or null if not a real date.
 */
export function parseDisplayDate(value: string): string | null {
    const match = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(value.trim());

    if (!match) {
        return null;
    }

    const [, day, month, year] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    const isReal =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;

    if (!isReal) {
        return null;
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * "2026-09" -> "Sep 2026"
 */
export function formatPeriod(period: string): string {
    const [year, month] = period.split("-").map(Number);

    return MONTHS[month - 1] ? `${MONTHS[month - 1]} ${year}` : period;
}

/**
 * "09-2026" or "9-2026" (MM-YYYY) -> "2026-09", or null.
 */
export function parseDisplayPeriod(value: string): string | null {
    const match = /^(\d{1,2})[-/.](\d{4})$/.exec(value.trim());
    const month = match ? Number(match[1]) : 0;

    if (!match || month < 1 || month > 12) {
        return null;
    }

    return `${match[2]}-${String(month).padStart(2, "0")}`;
}

/**
 * Message timestamp in local time: "5:40 PM" today, else "12 Oct, 5:40 PM".
 */
export function formatMessageTime(iso: string): string {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const hours = date.getHours();
    const time = `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${
        hours < 12 ? "AM" : "PM"
    }`;

    const isToday = date.toDateString() === new Date().toDateString();

    return isToday ? time : `${date.getDate()} ${MONTHS[date.getMonth()]}, ${time}`;
}
