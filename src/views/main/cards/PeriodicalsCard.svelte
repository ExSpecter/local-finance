<script>
    import MdAdd from 'svelte-icons/md/MdAdd.svelte'

    import {dbPeriodicals} from '@shared/store/store.js'
    import PeriodicalList from '../components/PeriodicalList.svelte';
    import periodicalModalService from '@shared/services/periodical-modal.service';

    let searchValue = ''
    let submenu = {
        'edit': (item) => periodicalModalService.editItem(item),
        '- remove': removeItem,
    }

    let periodicals = []
    const unsubscribe = dbPeriodicals.subscribe(newPeriodicals => periodicals = newPeriodicals);

    $: balance = periodicals
        .reduce((balance, periodical) => balance + periodical.getTotalAmount(), 0)

    function removeItem(item) {
        dbPeriodicals.removeItem(item);
    }

    function addPeriodical() {
        periodicalModalService.createItem()
    }
</script>

<periodicals>
    <div class="search"></div>
    <div class="add-button" on:click={() => addPeriodical()}>
        <span class="icon"><MdAdd /></span>
        Add
    </div>

    <div class="list">
        <PeriodicalList 
            periodicalList={periodicals} 
            {submenu}
            showTotalAmount={false}
        ></PeriodicalList>
    </div>

    <div class="balance  { balance < 0 ? 'negative' : 'positive' }">{balance.toFixed(2)} €</div>
</periodicals>


<style type="text/scss">
    periodicals {
        width: 60%;
        height: 100%;
        margin: 0px auto;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .add-button {
            $size: 32px;

            margin: 20px 0px 50px;
            display: flex;
            align-items: center;
            font-size: $size;

            cursor: pointer;

            color: var(--color-main);

            &:hover {
                text-shadow: 0 1px 20px rgba(91, 192, 190, 1);
            }

            .icon {
                width: $size;
                height: $size;
            }
        }

        .list {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .balance {
            flex: 0 1 auto;
            font-size: 2em;
            margin-top: 50px;

            &.positive {
                color: var(--incomeFlowColor);
            }
            &.negative {
                color: var(--spendingFlowColor);
            }
        }
    }
</style>