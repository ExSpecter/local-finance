<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    
    async function handleFileChange(event) {
        
    }

    function exportDbFile() {
    }
</script>

<div class="dropbox">
    <input type="file" class="db-file-input" on:change={handleFileChange} />
    <p>Database File <i>Import</i></p>
</div>

<div class="dropbox" on:click={exportDbFile}>
    <p>Database File <i>Export</i></p>
</div>

<style type="text/scss">
@import './file-upload.scss';
    .db-file-input {

    }
</style>