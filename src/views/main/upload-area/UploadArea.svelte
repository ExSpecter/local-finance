<script>
	import SelectDbFile from './SelectDbFile.svelte'
	import CsvImport from './CsvImporter.svelte'
</script>

<wrapper class="upload-area-wrapper">
    <div class="title">Upload Area</div>
    <div class="upload-areas">
    	<SelectDbFile></SelectDbFile>
	    <CsvImport></CsvImport>
    </div>
</wrapper>

<style type="text/scss">
    $width: 30vw;

    wrapper {
        width: $width;
        height: 100vh;
        position: absolute;
        left: calc(100vw - 70px);
        top: 0;

        opacity: .7;

        display: flex;
        align-items: center;

        transition: all $menu-transition;

        z-index: 10;

        &:hover {
            left: 100 - $width;
            background-color: $menu-background;
            color: white;
        }

        .title {
            writing-mode: vertical-rl;
            text-orientation: mixed;

            color: white;
            
            margin: 0 25px;
        }

        .upload-areas {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
    }
</style>