<script>
    import { fade } from 'svelte/transition';
    import MdClose from 'svelte-icons/md/MdClose.svelte'

    import Input from '@shared/components/Input.svelte';
    import Checkbox from '@shared/components/Checkbox.svelte';
    import periodicalModalService from '@shared/services/periodical-modal.service';

    import { dbPeriodicals } from '@shared/store/store.js'

    let showModal = false
    let periodical = null

    periodicalModalService.register(() => {
        showModal = periodicalModalService.show
        periodical = periodicalModalService.periodical
    })

    function cancel() {
        periodicalModalService.resetAndClose();
    }

    function save() {
        if (!periodical._id) {
            console.log("new", periodical)
            dbPeriodicals.addItem(periodical);
        } else {
            console.log("edit", periodical)
            dbPeriodicals.updateItem(periodical)
        }

        periodicalModalService.resetAndClose();
    }
</script>

{#if showModal}
    <edit-periodical transition:fade>
        <div class="modal">
            <div class="close-button" on:click={() => cancel()}>
                <MdClose />
            </div>
            
            <h1>Edit / Create Periodical</h1>

            {#if !periodical}
                <h2>There was an error. No periodical is selected</h2>
            {:else}
                <div class="master-data">
                    <div class="input-form max-width">
                        <Input type="text" label="Beneficiary" bind:value={periodical.beneficiary} />
                    </div>
                    <div class="input-form max-width">
                        <Input type="text" label="Comment" bind:value={periodical.comment} />
                    </div>
                    <div class="input-form max-width">
                        <Input type="number" label="Amount" bind:value={periodical.amount} />
                    </div>
                    <div class="input-form">
                        <Checkbox label="is Monthly" bind:checked={periodical.valueIsMonthly} />
                    </div>
                </div>
            {/if}

            <div class="save-button" on:click={() => save()}>
                {#if periodical._id}
                    Save
                {:else}
                    Create
                {/if}
            </div>
        </div>

    </edit-periodical>
{/if}

<style lang="scss">
    $border-radius: 24px;

    edit-periodical {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;

        z-index: 100;
        background-color: rgba(#000, .55);

        display: flex;
        align-items: center;
        justify-content: center;

        .modal {
            position: relative;
            width: 38vw;
            height: 75vh;

            padding: 50px;

            background-color: var(--color-grey-dark);
            border-radius: $border-radius;

            overflow: hidden;

            box-shadow: 0 10px 60px -10px rgba(91, 192, 190, 0.7);

            display: flex;
            flex-direction: column;

            h1 {
                color: var(--color-main);
                margin-bottom: 30px;
            }

            .master-data {
                flex: 1;
                margin-bottom: 90px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;

                .input-form {
                    margin-bottom: 50px;

                    &.max-width {
                        width: 100%;
                    }
                }
            }

            .save-button {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 90px;
                font-size: 30px;
                font-weight: bold;

                background-color: var(--color-main-dark);
                color: white;

                cursor: pointer;

                text-align: center;
                padding: 30px 0px;

                &:hover {
                    background-color: var(--color-main);
                }

            }

            .close-button {
                box-sizing: content-box;
                position: absolute;
                top: 5px;
                right: 5px;

                color: white;

                cursor: pointer;

                width: $border-radius; 
                height: $border-radius;
                border-radius: 50%;

                padding: 10px;

                &:hover {
                    background-color: rgba(#fff, .5);
                }
            }
        }
    }
</style>