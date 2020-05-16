<script>
    import { fly } from 'svelte/transition';
    import { expoIn, expoOut } from 'svelte/easing';
    
    import CashflowsCard from './cards/CashflowsCard.svelte'
    import AllFlows from './cards/AllFlows.svelte'
    import PeriodicalsCard from './cards/PeriodicalsCard.svelte'

    export let type = 'cashflows'
    export let props

    let activeType = 'cashflows'
    let typeChanged = false
    let windowHeight
    let duration = 400

    let dirDown = true
    let availableCardNames = ['cashflows', 'all-flows', 'periodicals'];

    $: if (type != activeType) {
        typeChanged = true
        dirDown = availableCardNames.indexOf(activeType) < availableCardNames.indexOf(type);
    }

    $: {
        console.log(windowHeight)
    }

    $: inAnimation = {
        y: (dirDown ? 1 : -1) * windowHeight, duration, easing: expoOut
    }
    $: outAnimation = {
        y: (dirDown ? -1 : 1) * windowHeight, duration, easing: expoIn
    }

    $: showCashflows = (activeType === availableCardNames[0] && !typeChanged)
    $: showAll = (activeType === availableCardNames[1] && !typeChanged)
    $: showPeriodicals = (activeType === availableCardNames[2] && !typeChanged)

    async function outroEnded() {
        activeType = type
        typeChanged = false
    }
</script>

<svelte:window bind:outerHeight={windowHeight} />

{#if showCashflows}
    <div class="card" 
        in:fly="{inAnimation}" out:fly="{outAnimation}"
        on:outroend={()=> outroEnded()}
    >
        <CashflowsCard {...props}></CashflowsCard>
    </div>
{:else if showAll}
    <div class="card" 
        in:fly="{inAnimation}" out:fly="{outAnimation}"
        on:outroend={()=> outroEnded()}
    >
        <AllFlows {...props}></AllFlows>
    </div>
{:else if showPeriodicals}
    <div class="card" 
        in:fly="{inAnimation}" out:fly="{outAnimation}"
        on:outroend={()=> outroEnded()}
    >
        <PeriodicalsCard {...props}></PeriodicalsCard>
    </div>
{/if}

<style type="text/scss">
    .card {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        height: 95vh;
        width: 80vw;

        background-color: var(--color-black);
        border-radius: 10px;

        display: flex;
    }
</style>