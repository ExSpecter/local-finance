<script>
    import readFile from '../utils/fileReader.js';
    import csv from 'csvtojson';
    import CashFlow from '../models/cashFlow.model.js';

    import {dbCashflow} from '../store.js'

    async function importCsv(event) {
        let file = event.target.files[0]
        let content = await readFile(file);

        csv({delimiter: ";"}).fromString(content)
        .then(result => {
            dbCashflow.addItem(result)
        })
    }

</script>

<importer class="dropbox">
    <input type="file" on:change={importCsv} />
    <p>Csv - Cashflow - Import</p>
</importer>

<style type="text/scss">
@import '../styles/file-upload.scss';
    importer {
        margin-top: 30px;
    }
</style>