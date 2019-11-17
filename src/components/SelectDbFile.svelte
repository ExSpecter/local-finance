<script>
    import DbFileHandler from '../models/dbHandler.model.js'
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    
    async function handleFileChange(event) {
        let file = event.target.files[0];
        await DbFileHandler.importFile(file)

        dispatch('databaseCreated');
    }

    function exportDbFile() {
        DbFileHandler.exportFile();
    }
</script>

<div class="dropbox">
    <input type="file" class="db-file-input" on:change={handleFileChange} />
    <p>Database - File - Import</p>
</div>

<div class="dropbox" on:click={exportDbFile}>
    <p>Database - File - Export</p>
</div>

<style type="text/scss">
@import '../styles/file-upload.scss';
    .db-file-input {

    }
</style>