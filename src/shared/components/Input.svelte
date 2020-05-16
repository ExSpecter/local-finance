<script>
    import MdKeyboardArrowUp from 'svelte-icons/md/MdKeyboardArrowUp.svelte'
    import MdKeyboardArrowDown from 'svelte-icons/md/MdKeyboardArrowDown.svelte'

    export let value
    export let min = 0
    export let max = Number.MAX_SAFE_INTEGER
    export let step = 1
    export let placeholder = ''
    export let type = "number"
    export let disabled = false
    export let label = ''

    function increase() {
        if (value < max) value++;
    }
    function decrease() {
        if (value > min) value--;
    }
</script>

<div class="input-form">
    {#if !!label}
        <p class="month">{label}</p>
    {/if}

    <div class="input-wrapper">
        {#if type === "number"}
            <input type="number" {placeholder} {disabled}  {min} {max} {step} bind:value={value} />
        {:else}
            <input type="text" {placeholder} {disabled} bind:value={value} />
        {/if}

        {#if type === "number" && !disabled}
            <div class="number-arrows">
                <div class="icon" on:click="{() => increase()}"><MdKeyboardArrowUp /></div>
                <div class="icon" on:click="{() => decrease()}"><MdKeyboardArrowDown /></div>
            </div>
        {/if}
    </div>
</div>

<style type="text/scss">
    .input-form {
        // transition: all .4s linear;
        position: relative;


        p {
            flex: 5 1 0;
            color: white;
            font-size: .9em;

            white-space: nowrap;

            padding-left: 10px;
            text-align: left;
        }

        .input-wrapper {
            display: flex;

            input {
                margin: 0px;
                width: 100%;

                color: white;

                border-radius: 10px;
                background-color: var(--color-grey-dark);
                text-align: center;

                &:disabled {
                    color: var(--color-grey);
                    background-color: var(--color-black);
                }

                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                /* Firefox */
                &[type=number] {
                    -moz-appearance: textfield;
                }

                &:focus {
                    outline-width: 0;
                }
            }

            .number-arrows {
                margin-left: 5px;

                .icon {
                    width: 18px;
                    height: 18px;
                    color: white;

                    cursor: pointer;

                    transition: background-color .1s linear;

                    &:hover {
                        background-color: var(--color-main);
                        opacity: .8;
                        color: black;
                    }

                    &:active {
                        background-color: var(--color-main-dark);
                    }
                }
            }
        }
    }

</style>