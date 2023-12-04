<script>
    import SideBySideList from '../components/SideBySideList.svelte';
    import CashFlow from '$lib/shared/models/cashFlow.model.js';
    import Periodical from '$lib/shared/models/periodical.model.js';
    import CashflowAnalysis from '$lib/shared/utils/cashflowAnalysis.js';
    import { dateFilter } from '$lib/shared/utils/dateFilter.js'
    import { dbCashflow, dbPeriodicals } from '$lib/shared/store/store.ts'
    import periodicalModalService from '$lib/shared/services/periodical-modal.service';

    import Input from '$lib/shared/components/Input.svelte';
    import Checkbox from '$lib/shared/components/Checkbox.svelte';
    import { fly } from 'svelte/transition';

    let monthSelection = new Date().getMonth(); if (monthSelection === 0) monthSelection = 12;
    let yearSelection = new Date().getFullYear();
    let periodicalDepth = 1
    let considerAmount = false
    let submenu = {
        '+ periodicals': (item) => {
            if (item.hasPeriodical()) periodicalModalService.editItem(item.periodical)
            else periodicalModalService.createItem(Periodical.fromCashflow(item))
        },
        'log': console.log
    }

    let cashflowList = []
    const unsubscribe = dbCashflow.subscribe(newCashflowList => {
        cashflowList = newCashflowList
        console.log(cashflowList)
    })
    let periodicals = []
    const unsubscribePeriodical = dbPeriodicals.subscribe(newPeriodicals => periodicals = newPeriodicals);

    $: withPeriodicals = cashflowList.map(cashflow => {
        const periodical = periodicals.find(periodical => periodical.beneficiary === cashflow.beneficiary)
        if (periodical) cashflow.setPeriodical(periodical)
        return cashflow;
    })

    $: flows = {
        income: withPeriodicals.filter(cashflow => cashflow.isIncome()),
        spending: withPeriodicals.filter(cashflow => !cashflow.isIncome())
    }

    $: monthlyFlows = {
        income: flows.income.filter(dateFilter(yearSelection, monthSelection)),
        spending: flows.spending.filter(dateFilter(yearSelection, monthSelection))
    }

    $: periodicalFlows = {
        income: new CashflowAnalysis(flows.income, periodicalDepth, considerAmount).getPeriodical(monthSelection).map(({item}) => item),
        spending: new CashflowAnalysis(flows.spending, periodicalDepth, considerAmount).getPeriodical(monthSelection).map(({item}) => item)
    }

    $: activeFlow = [monthlyFlows, periodicalFlows].find((item, index) => flowLists[index].active)

    $: isPeriodical = flowLists[1].active

    let flowLists = [
        {
            name: "Monthly",
            active: true
        },{
            name: "Periodical",
            active: false
        }
    ]

    function setActiveList(index) {
        flowLists.forEach(listItem => listItem.active = false);
        flowLists[index].active = true;
        activeFlow = flowLists[index].data;
    }
</script>


<periodical-flow>
    <div class="flow-selector-wrapper">
        {#each flowLists as {name, active}, i}
            <div class="{name} { active ? 'active': ''}" on:click={() => setActiveList(i)}>{name}</div>
        {/each}
    </div>
    <div class="input-fields">
        <div class="input-form">
            <Input type="number" label="Month" placeholder="month" min="1" max="12" bind:value={monthSelection}/>
        </div>

        <div class="input-form">
            <Input type="number" label="Year" placeholder="year" min="2000" max="{new Date().getFullYear() + 1}" bind:value={yearSelection}/>
        </div>

        {#if flowLists[1].active}
            <div class="input-form">
                <Input type="number" label="Depth" placeholder="depth" min="0" step="1" bind:value={periodicalDepth} />
            </div>

            <div class="checkbox" transition:fly="{{ x: 100, duration: 150 }}">
                <Checkbox label="Consider Amount" bind:checked={considerAmount} />
            </div>
        {/if}
    </div>

    <SideBySideList 
        incomeFlow={activeFlow.income} 
        spendingFlow={activeFlow.spending}
        {isPeriodical}
        {submenu}
    ></SideBySideList>
</periodical-flow>



<style lang="scss">

	periodical-flow {
        width: 100%;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .flow-selector-wrapper {
        display: flex;
        border-radius: 6px;
        overflow: hidden;
        margin: 20px 0px;

        * {
            cursor: pointer;
            padding: 5px 30px;
            background-color: var(--color-main-dark);

            transition: background-color .1s linear;

            &.active {
                background-color: var(--color-main);
            }
        }
    }

    .input-fields {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .input-form {
            flex: 0 1 18%;
            min-width: 0px;
            margin-right: 20px;


            &:last-child {
                margin-right: 0px;
            }
        }

        .checkbox {
            margin-top: 1em;
        }
    }
    
</style>