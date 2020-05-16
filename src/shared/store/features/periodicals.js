import { writable } from 'svelte/store';

import database from '../db.service.js';
import Periodical from '@shared/models/periodical.model.js';

const maxUpdateNumber = 10;

export function createDbPeriodicalHandler() {
    const { subscribe, update } = writable(0);

    let db = database.periodicals;

    function triggerUpdate() {
        update(n => (n >= maxUpdateNumber) ? 0 : n + 1)
    }

    return {
        subscribe: (callback) => subscribe(async () => {
            const allPeriodicals = await db.find({});
            callback(allPeriodicals.map(periodical => new Periodical(periodical)));
        }),
        addItem: async (item) => {
            await db.insert(item)
            triggerUpdate();
        },
        updateItem: async (item) => {
            console.log(item);
            await db.update({_id: item._id}, item, {});
            triggerUpdate();
        },
        removeItem: async({_id}) => {
            await db.remove({ _id }, {});
            triggerUpdate();
        }
    }
}