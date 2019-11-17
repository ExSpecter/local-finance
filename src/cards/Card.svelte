<script>
    import PeriodicalFlow from './PeriodicalFlow.svelte'

    export let type
    export let props
</script>

<card>
    {#if type === 'periodical-flow'}
	    <PeriodicalFlow {...props}></PeriodicalFlow>
    <!-- {:else if 5 > x}
        <p>{x} is less than 5</p>
    {:else}
        <p>{x} is between 5 and 10</p> -->
    {/if}
</card>

<style>
    card {
        height: 80vh;
        width: 80vw;

        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 10px;

        display: flex;

        /* -webkit-box-shadow: 10px 10px 23px -12px rgba(133,133,133,1);
        -moz-box-shadow: 10px 10px 23px -12px rgba(133,133,133,1);
        box-shadow: 10px 10px 23px -12px rgba(133,133,133,1); */
    }
</style>