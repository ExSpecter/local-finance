<script>
    import { get } from 'svelte/store';
    import csv from 'csvtojson';

    import readFile from '@shared/utils/fileReader.js';
    import CashFlow from '@shared/models/cashFlow.model.js';

    import {dbCashflow} from '@shared/store/store.js'
    
    let dbCashflowList = []
    const unsubscribe = dbCashflow.subscribe(newCashflowList => dbCashflowList = newCashflowList)

    async function importCsv(event) {
        let file = event.target.files[0]
        let content = await readFile(file);

        csv({delimiter: ";"}).fromString(content)
        .then(result => {
            const newFlowItems = result.filter(notExists(dbCashflowList));
            console.log("New Items: ", newFlowItems);
            dbCashflow.addItem(newFlowItems);
        })
    }

    function notExists(existingItems) {
        return (itemToCheck) => !existingItems.some(item => new CashFlow(itemToCheck).isEqual(item))
    }


</script>

<importer class="dropbox">
    <input type="file" on:change={importCsv} />
    <p>Csv Cashflow <i>Import</i> <br/> (CAMT) </p>
</importer>

<style type="text/scss">
@import './file-upload.scss';
    importer {
        margin-top: 30px;
    }
</style>