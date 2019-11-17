<script>
    export let title = "Cash Flow List"
    export let cashFlowList = []

    let searchValue = ''

    $: filteredList = cashFlowList.filter(({ usageText, beneficiary }) => 
        usageText.toLowerCase().includes(searchValue.toLowerCase()) || 
        beneficiary.toLowerCase().includes(searchValue.toLowerCase()))
</script>

<div class="title">{title}</div>
<input bind:value={searchValue} placeholder="Search for cashflow" />
<div class="flow-list">
<ul>
    {#each filteredList as cashflow, i}
        <li>
            <span class="text">{cashflow.beneficiary}<br/><span class="usageText">{cashflow.usageText}</span></span>
            <span class="amount { cashflow.isIncome() ? 'income' : 'spending'}">{cashflow.amount} €</span>
        </li>
    {/each}
</ul>
</div>

<style type="text/scss">
@import '../styles/colors.scss';

    .title {
        margin: 0px 15px;
        flex: 0 0 auto;

        color: #455A64;
        font-weight: bold;
        font-size: 1.1em;

    }

    input {
        width: 100%;
        flex: 0 0 auto;

        border: none;
        background-color: rgba(0,0,0, 0.1);
        border-radius: 5px;
        outline: none;

        margin: 20px 0px;
    }

    .flow-list {
        overflow: auto;
        flex: 0 1 auto;
            padding: 0px 15px;
        ul {
            li {
                text-decoration: none;
                list-style-type: none;
                display: flex;
                justify-content: space-between;
                margin-bottom: 35px;

                cursor: default;

                span.income {
                    color: $incomeFlowColor;
                }

                span.spending {
                    color: $spendingFlowColor;
                }

                span.text {
                    word-break: break-word;

                    span.usageText {
                        color: #9E9E9E;
                    }
                }

                span.amount {
                    // white-space: nowrap;
                    // margin-left: 5px;
                    padding-left: 8px;
                    flex: 1 0 auto;
                    text-align: right;
                }
            }

            li:last-of-type {
                margin-bottom: 0px;
            }
        }
    }

    /* width */
    ::-webkit-scrollbar {
    width: 8px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
    background: #f1f1f1; 
    }
    
    /* Handle */
    ::-webkit-scrollbar-thumb {
    background: #888; 
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
    background: #555; 
    }
</style>