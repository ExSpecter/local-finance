import { writable } from 'svelte/store';

import database from '../db.service.js';
import CashFlow from '@shared/models/cashFlow.model.js';

const maxUpdateNumber = 10;

export function createDbCashflowHandler() {
    const { subscribe, update } = writable(0);

    let db = database.cashflow;

    function triggerUpdate() {
        update(n => (n >= maxUpdateNumber) ? 0 : n + 1)
    }

    return {
        subscribe: (callback) => subscribe(async () => {
            const allCashFlows = await db.find({});
            callback(allCashFlows.map(item => new CashFlow(item)));
        }),
        addItem: async (item) => {
            await db.insert(item)
            triggerUpdate();
        }
    }
}