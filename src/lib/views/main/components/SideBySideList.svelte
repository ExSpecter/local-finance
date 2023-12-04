<script>
    import CashFlowList from './CashFlowList.svelte';

    export let incomeFlow = []
    export let spendingFlow = []
    export let isPeriodical = false
    export let submenu = {}

    let searchValue = ''

    $: balance = [...incomeFlow, ...spendingFlow]
        .reduce((balance, cashFlow) => balance + cashFlow.getTotalAmount(), 0)
</script>

<input bind:value={searchValue} placeholder="Search for cashflow" />

<div class="lists">
    <in><CashFlowList title="Income" cashFlowList={incomeFlow} searchValue={searchValue} {isPeriodical} {submenu}></CashFlowList></in>
    <out><CashFlowList title="Spending" cashFlowList={spendingFlow} searchValue={searchValue} {isPeriodical} {submenu}></CashFlowList></out>
</div>

<div class="balance  { balance < 0 ? 'negative' : 'positive' }">{balance.toFixed(2)} €</div>

<style lang="scss">
    input {
        width: 70%;
        flex: 0 0 auto;

        color: white;
        text-align: center;

        border: none;
        background-color: var(--color-grey-dark);
        border-radius: 5px;
        outline: none;

        margin: 20px 0px;
    }

    .lists {
        flex: 1;
        width: 100%;
        display: flex;
        justify-content: center;

        overflow: hidden;

        in, out {
            flex: 0 1 50%;
            display: flex;
            flex-direction: column;
            margin: 20px;

            overflow: hidden;
        }

        in {
            margin-right: 40px;
        }

        out {
            margin-left: 40px;
        }
    }

    .balance {
        flex: 0 1 auto;
        font-size: 2em;
        &.positive {
            color: var(--incomeFlowColor);
        }
        &.negative {
            color: var(--spendingFlowColor);
        }
    }
    
</style>