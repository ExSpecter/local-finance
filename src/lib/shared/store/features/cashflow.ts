import { writable } from 'svelte/store';

import database from '../db.service';
import CashFlow from '$lib/shared/models/cashFlow.model.js';

const maxUpdateNumber = 10;

export function createDbCashflowHandler() {
    const { subscribe, update } = writable(0);

    let db = database.cashflow;

    function triggerUpdate() {
        update(n => (n >= maxUpdateNumber) ? 0 : n + 1)
    }

    return {
        subscribe: (callback: Function) => subscribe(async () => {
            const allCashFlows = await db.find({});
            callback(allCashFlows.map((item: any) => new CashFlow(item)));
        }),
        addItem: async (item: any) => {
            await db.insert(item)
            triggerUpdate();
        }
    }
}