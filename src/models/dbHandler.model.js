import saveAs from 'file-saver';

const dbName = 'NeDB'
const dbStoreName = 'nedbdata'
const dbKeyName = 'cashflowData'

class DbFileHandler {
    constructor() {
        this.file = null
        this.createDbHandler();
        this.openIndexDB();
    }

    dbIsConnected() {
        return (this.nedb);
    }

    openIndexDB() {
        return new Promise((resolve, reject) => {
            if(this.nedb) resolve();

            let DBOpenRequest = window.indexedDB.open(dbName, 4);
            DBOpenRequest.onsuccess = function(event) {
                this.nedb = DBOpenRequest.result;
                resolve();
            }.bind(this);
        })
    }

    createTransaction() {
        let transaction = this.nedb.transaction([dbStoreName], "readwrite");
        return transaction.objectStore(dbStoreName);
    }

    importFile(file) {
        if(!file) return;
        this.file = file
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");

            reader.onload = (event) => resolve(this.importIntoIndexDb(event))

            reader.onerror = function (evt) {
                reject("error reading file");
            }
        });
    }

    importIntoIndexDb(event) {
        return new Promise(async (resolve, reject) => {
            let fileContent = event.target.result;
            if(!this.dbIsConnected()) await this.openIndexDB();
            var updateNedb = this.createTransaction().put(fileContent, dbKeyName);
            
            updateNedb.onsuccess = function() {
                resolve(this.getDatabase());
            }.bind(this)
        });
    }

    createDbHandler() {
        this.db = new Nedb({ filename: dbKeyName, autoload: true });
        return this.db
    }

    getDatabase() {
        return this.db
    }

    exportFile() {
        let data = this.createTransaction().get(dbKeyName)
        data.onsuccess = function() {
            var blob = new Blob([data.result], {type: "text/plain;charset=utf-8"});
            saveAs(blob, (this.file) ? this.file.name : 'Local-Finance-Export.txt');
        }.bind(this)
    }
}

export default new DbFileHandler();