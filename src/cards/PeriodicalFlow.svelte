<script>
    import CashFlowList from '../components/CashFlowList.svelte';
    import CashFlow from '../models/cashFlow.model.js';
    import {dbCashflow} from '../store.js'

    export let db = null
    let cashflowList = []

    const unsubscribe = dbCashflow.subscribe(newCashflowList => cashflowList = newCashflowList)

    $: incomeFlow = cashflowList.filter(cashflow => cashflow.isIncome())
    $: spendingFlow = cashflowList.filter(cashflow => !cashflow.isIncome())

    $: balance = cashflowList
        .reduce((balance, cashFlow) => balance + ((cashFlow.isIncome ? 1 : -1) * cashFlow.amount), 0)
</script>

<periodical-flow>
    <div class="lists">
        <in><CashFlowList title="Income" cashFlowList={incomeFlow}></CashFlowList></in>
        <out><CashFlowList title="Spending" cashFlowList={spendingFlow}></CashFlowList></out>
    </div>

    <div class="balance  { balance < 0 ? 'negative' : 'positive' }">{balance} €</div>
</periodical-flow>



<style type="text/scss">
@import '../styles/colors.scss';

	periodical-flow {
        width: 100%;
        margin: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        .lists {
            flex: 1;
            width: 100%;
            display: flex;
            justify-content: center;
            // align-items: flex-start;

            overflow: hidden;

            in, out {
                flex: 1;
                display: flex;
                flex-direction: column;
                margin: 20px;
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
                color: $incomeFlowColor;
            }
            &.negative {
                color: $spendingFlowColor;
            }
        }
    }
    
</style>