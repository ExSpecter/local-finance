// main/src/db.js
const {app} = require('electron').remote;
const Datastore = require('nedb-promises');

const dbFactory = (fileName) => Datastore.create({
    filename: `${process.env.NODE_ENV === 'dev' ? '.' : app.getAppPath('userData')}/data/${fileName}`, 
    timestampData: true,
    autoload: true
});

const db = {
    cashflow: dbFactory('cashflow.db'),
    periodicals: dbFactory('periodicals.db')
}

export default db;