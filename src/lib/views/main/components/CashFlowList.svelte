<script>
    import MdKeyboardArrowUp from 'svelte-icons/md/MdKeyboardArrowUp.svelte'
    import MdKeyboardArrowDown from 'svelte-icons/md/MdKeyboardArrowDown.svelte'
    import MdClose from 'svelte-icons/md/MdClose.svelte'

    import { fly, slide } from 'svelte/transition';

    export let title = "Cash Flow List"
    export let cashFlowList = []
    export let searchValue = ''
    export let withSorting = true
    export let showTotalAmount = true
    export let isPeriodical = false
    export let sublist = false
    export let submenu = {}

    let showSubmenu = null

    let sorting = "bookingDay"
    let reverse = false

    const columns = [
        { 
            name: 'bookingDay',
            css: 'date'
        },{ 
            name: 'beneficiary',
            css: 'text'
        },{ 
            name: 'amount',
            css: 'amount'
        }
    ]

    let displayMergedItems = {
        index: 0,
        items: [],
        visible: false
    }

    $: filteredList = cashFlowList.filter(({ usageText, beneficiary }) => 
            usageText.toLowerCase().includes(searchValue.toLowerCase()) 
            || beneficiary.toLowerCase().includes(searchValue.toLowerCase())
        ).sort((a,b) => {
            if (typeof a[sorting] === 'string') return sortByName(a,b);
            if (sorting === 'amount') return sortByAmount(a,b);
            return (reverse ? b : a)[sorting] - (reverse ? a : b)[sorting];
        });

    function sortByName(a, b) {
        return ('' + (reverse ? b : a)[sorting]).localeCompare((reverse ? a : b)[sorting]);
    }
    function sortByAmount(a,b) {
        return (reverse ? b : a).getTotalAmount() - (reverse ? a : b).getTotalAmount();
    }

    $: if (filteredList) {
        closeSublist();
        closeSubmenu();
    }

    $: totalAmount = filteredList.reduce((acc, item) => acc + item.getTotalAmount(), 0)
    $: submenuItems = Object.keys(submenu)

    function setSorting(name) {
        reverse = name === sorting ? !reverse : false;
        sorting = name;
    }

    function getDateString(date) {
        return `${doubleDigitString(date.getDate())}.${doubleDigitString(date.getMonth() + 1)}.${date.getFullYear()}`
    }

    function doubleDigitString(number) {
        return ("0" + number).slice(-2)
    }

    function toggleSublist(cashflow, index) {
        if(displayMergedItems.items.length > 0 && index === displayMergedItems.index) {
            closeSublist();
        } else {
            showSubmenu = null
            displayMergedItems.index = index
            setTimeout(() => {
                displayMergedItems.items = [cashflow, ...cashflow.mergedItems];
                displayMergedItems.visible = true;
            }, 0);
        }
    }

    function closeSublist(fast = false) {
        if (fast) displayMergedItems.index = -1;
        displayMergedItems.visible = false
        setTimeout(() => displayMergedItems.items = [], 280);
    }

    function toggleSubmenu(index) {
        closeSublist();
        if (showSubmenu === index) closeSubmenu()
        else showSubmenu = index;
    }

    function closeSubmenu() { showSubmenu = null }

    function callSubmenu(item, parameter) {
        submenu[item](parameter);
    }

    function getCashflowAmount(cashflow) {
        return isPeriodical 
            ? (cashflow.getTotalAmount() || cashflow.getAmount()).toFixed(2)
            : cashflow.getAmount().toFixed(2)  
    }

    function cashflowAmountEqualToPeriodical(cashflow) {
        if (!cashflow.periodical) return false;
        return getCashflowAmount(cashflow) === cashflow.periodical.amount.toFixed(2);
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

<div class="flow-list" class:sublist="{sublist}" style="overflow: {sublist ? 'hidden' : 'auto'}">
    <ul>
        {#each filteredList as cashflow, i}
            <li class="flow-item" 
                class:with-periodical="{cashflow.hasPeriodical()}"
                class:amount-unequal="{cashflow.hasPeriodical() && !cashflowAmountEqualToPeriodical(cashflow)}"
                transition:fly="{ sublist ? {duration: 0, delay: 0} : { x: -100, duration: 150, delay: i * 40 }}"
                on:click={() => toggleSubmenu(i)}
            >
                <span class="date">
                    {getDateString(cashflow.bookingDay)}
                </span>
                <span class="text">
                    {#if !sublist}
                        <p>{cashflow.beneficiary}</p>
                    {/if}
                    {#if cashflow.mergedItems.length === 0 || !isPeriodical }
                        <div class="tooltip-wrapper">
                            <div class="usageText">
                                {cashflow.usageText}

                            </div>

                            {#if !sublist}
                                <div class="tooltip" class:last="{i + 1 === filteredList.length}">
                                    {cashflow.usageText}
                                </div>
                            {/if}
                        </div>
                    {/if}
                </span>
                <div class="amount-wrapper { cashflow.isIncome() ? 'income' : 'spending'}">
                    <span class="amount">
                        { getCashflowAmount(cashflow) } €
                    </span>

                    {#if isPeriodical && cashflow.mergedItems.length > 0}
                        <div class="merged-item-count" on:click|stopPropagation={() => toggleSublist(cashflow, i)}>
                            {#if displayMergedItems.visible && displayMergedItems.index === i}
                                <div class="close-botton"><MdClose /></div>
                            {:else}
                                + { cashflow.mergedItems.length + 1 }
                            {/if}
                        </div>
                    {/if}
                </div>
            </li>

            {#if showSubmenu === i}
                <li class="submenu" transition:slide>
                    {#each submenuItems as submenuItem, i}
                        <div class="item" on:click|stopPropagation={() => callSubmenu(submenuItem, cashflow)}>
                            { submenuItem }
                        </div>
                    {/each}
                </li>
            {/if}

            {#if isPeriodical && displayMergedItems.index === i && displayMergedItems.visible}
                <li class="merged-items" transition:slide>
                    <svelte:self cashFlowList={displayMergedItems.items} withSorting={false} showTotalAmount={false} sublist={true} />
                </li>
            {/if}

        {/each}
    </ul>
</div>

{#if showTotalAmount}
    <div class="total-amount { totalAmount >= 0 ? 'income': 'spending' }">{totalAmount.toFixed(2)} €</div>
{/if}

<style lang="scss">
    @import './list-style.scss';

    .flow-item {
        padding-left: 8px;
        border-radius: 5px;

        &.with-periodical {
            border-left: 6px solid var(--color-main);

            &.amount-unequal {
                border-left-style: double;
            }
        }
    }
    
</style>