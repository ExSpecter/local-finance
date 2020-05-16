<script>
    import MdKeyboardArrowUp from 'svelte-icons/md/MdKeyboardArrowUp.svelte'
    import MdKeyboardArrowDown from 'svelte-icons/md/MdKeyboardArrowDown.svelte'
    import MdClose from 'svelte-icons/md/MdClose.svelte'

    import { fly, slide } from 'svelte/transition';

    export let title = "Cash Flow List"
    export let periodicalList = []
    export let searchValue = ''
    export let withSorting = true
    export let showTotalAmount = true
    export let submenu = {}

    let showSubmenu = null

    let sorting = "beneficiary"
    let reverse = false

    const columns = [
        { 
            name: 'beneficiary',
            css: 'text'
        },{ 
            name: 'amount',
            css: 'amount'
        }
    ]

    $: filteredList = periodicalList.filter(({ usageText, beneficiary }) => 
            beneficiary.toLowerCase().includes(searchValue.toLowerCase())
        ).sort((a,b) => {
            if (typeof a[sorting] === 'string') 
                return ('' + (reverse ? b : a)[sorting]).localeCompare((reverse ? a : b)[sorting]);
            if (sorting === 'amount') 
                return (reverse ? b : a).getTotalAmount() - (reverse ? a : b).getTotalAmount();
            return (reverse ? b : a)[sorting] - (reverse ? a : b)[sorting];
        });

    $: if (filteredList) {
        closeSubmenu();
    }

    $: filteredAndIncomeSortedFlows = [
        ...filteredList.filter(cashflow => cashflow.isIncome()),
        ...filteredList.filter(cashflow => !cashflow.isIncome()).reverse()
    ]

    $: totalAmount = filteredList.reduce((acc, item) => acc + item.getTotalAmount(), 0)
    $: submenuItems = Object.keys(submenu)

    function setSorting(name) {
        reverse = name === sorting ? !reverse : false;
        sorting = name;
    }


    function toggleSubmenu(index) {
        if (showSubmenu === index) closeSubmenu()
        else showSubmenu = index;
    }

    function closeSubmenu() { showSubmenu = null }

    function callSubmenu(item, parameter) {
        submenu[item](parameter);
    }


</script> 

<!-- <div class="title">{title}</div> -->
{#if filteredList.length > 0 && withSorting}
    <div class="filter-buttons">
        {#each columns as column}
            <span class="icon {column.css}" class:active="{sorting === column.name}" on:click={() => setSorting(column.name)}>
                {#if reverse}
                    <MdKeyboardArrowUp />
                {:else}
                    <MdKeyboardArrowDown />
                {/if}    
            </span>
        {/each}
    </div>
{/if}

<div class="flow-list">
    <ul>
        {#each filteredAndIncomeSortedFlows as periodical, i}
            <li class="flow-item" 
                transition:fly="{{ x: -100, duration: 150, delay: i * 40 }}"
                on:click={() => toggleSubmenu(i)}
            >
                <span class="text">
                    <p>{periodical.beneficiary}</p>
                    {#if periodical.comment}
                        <div class="tooltip-wrapper">
                            <div class="usageText">
                                {periodical.comment}
                            </div>

                            <div class="tooltip" class:last="{i + 1 === filteredAndIncomeSortedFlows.length}">
                                {periodical.comment}
                            </div>
                        </div>
                    {/if}
                </span>
                <div class="amount-wrapper { periodical.isIncome() ? 'income' : 'spending'}">
                    <span class="amount">
                        { 
                            periodical.getAmount().toFixed(2)
                        } €
                    </span>
                </div>
            </li>

            {#if showSubmenu === i}
                <li class="submenu" transition:slide>
                    {#each submenuItems as submenuItem, i}
                        <div class="item" on:click|stopPropagation={() => callSubmenu(submenuItem, periodical)}>
                            { submenuItem }
                        </div>
                    {/each}
                </li>
            {/if}
        {/each}
    </ul>
</div>

{#if showTotalAmount}
    <div class="total-amount { totalAmount >= 0 ? 'income': 'spending' }">{totalAmount.toFixed(2)} €</div>
{/if}

<style type="text/scss">
    @import './list-style.scss';

    .filter-buttons {
        width: 100%;
    }

    .flow-list {
        width: 100%;
        overflow: auto;
    }
</style>