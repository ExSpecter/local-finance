import { writable } from 'svelte/store';

import database from '../db.service';
import Periodical from '$lib/shared/models/periodical.model.js';

const maxUpdateNumber = 10;

export function createDbPeriodicalHandler() {
    const { subscribe, update } = writable(0);

    let db = database.periodicals;

    function triggerUpdate() {
        update(n => (n >= maxUpdateNumber) ? 0 : n + 1)
    }

    return {
        subscribe: (callback: Function) => subscribe(async () => {
            const allPeriodicals = await db.find({});
            callback(allPeriodicals.map((periodical: any) => new Periodical(periodical)));
        }),
        addItem: async (item: any) => {
            await db.insert(item)
            triggerUpdate();
        },
        updateItem: async (item: any) => {
            console.log(item);
            await db.update({_id: item._id}, item);
            triggerUpdate();
        },
        removeItem: async({_id}: { _id: any }) => {
            await db.remove({ _id });
            triggerUpdate();
        }
    }
}