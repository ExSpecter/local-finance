import { writable } from 'svelte/store';

import DbHandler from './models/dbHandler.model.js';
import CashFlow from './models/cashFlow.model.js';

const maxUpdateNumber = 10;

function createDbCashflowHandler() {
    const { subscribe, update } = writable(0);

    let db = DbHandler.getDatabase();

    function triggerUpdate() {
        update(n => (n >= maxUpdateNumber) ? 0 : n + 1)
    }

    return {
        subscribe: (callback) => subscribe(() => db.find({}, (err, result) => {
            callback(result.map(item => new CashFlow(item)))
        })),
        addItem: item => {
            db.insert(item, (err) => triggerUpdate())
        }
    }
}
export const dbCashflow = createDbCashflowHandler();