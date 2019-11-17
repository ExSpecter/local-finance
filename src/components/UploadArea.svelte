<script>
	import SelectDbFile from './SelectDbFile.svelte'
	import CsvImport from './CsvImporter.svelte'
</script>

<wrapper>
    <div class="title">Upload Area</div>
    <div class="upload-areas">
    	<SelectDbFile></SelectDbFile>
	    <CsvImport></CsvImport>
    </div>
</wrapper>

<style type="text/scss">
    $width: 60vw;

    wrapper {
        width: $width;
        height: 100vh;
        position: absolute;
        left: 95vw;
        top: 0;

        display: flex;
        align-items: center;

        transition: all 0.6s ease-in-out;

        &:hover {
            left: 100-$width;
            background-color: rgba(#311B92, .9);
            color: white;
        }

        .title {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            
            margin: 0 2vw;
        }

        .upload-areas {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
    }
</style>