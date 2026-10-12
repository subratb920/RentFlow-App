import { Bill } from "../models/Bill";

/**
 * Groups bills by billing month, keeping the incoming order
 * (newest month first).
 */
export function groupBillsByPeriod(bills: Bill[]): { period: string; bills: Bill[] }[] {
    const groups: { period: string; bills: Bill[] }[] = [];

    for (const bill of bills) {
        const last = groups[groups.length - 1];

        if (last && last.period === bill.period) {
            last.bills.push(bill);
        } else {
            groups.push({ period: bill.period, bills: [bill] });
        }
    }

    return groups;
}

export function totalDue(bills: Bill[]): number {
    return bills
        .filter((bill) => bill.status === "UNPAID")
        .reduce((sum, bill) => sum + bill.amount, 0);
}
