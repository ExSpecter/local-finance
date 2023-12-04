// main/src/db.js
// @ts-ignore

export interface Database {
    find(query: any): Promise<any>
    insert(data: any): Promise<any>
    update(query: any, data: any): Promise<any>
    remove(query: any): Promise<any>
}

class DummyDatabase implements Database {
    constructor(private readonly id: string) {}

    async find(query: any): Promise<any[]> {
        // @ts-ignore
        return JSON.parse(localStorage.getItem(this.id)) || []
    }

    async insert(data: any): Promise<any> {
        const currentData = await this.find({})
        if (Array.isArray(data)) {
            currentData.push(...data)
        } else {
            currentData.push(data)
        }
        // @ts-ignore
        return localStorage.setItem(this.id, JSON.stringify(currentData));
    }

    async update(query: any, data: any): Promise<any> {
        return []
    }

    async remove(query: any): Promise<any> {
        return []
    }
}

const db = {
    cashflow: new DummyDatabase('cashflow'),
    periodicals: new DummyDatabase('periodicals')
}

export default db;

