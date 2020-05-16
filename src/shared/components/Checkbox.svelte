<script>
    export let checked = false
    export let label = ''
</script>

<custom-checkbox>
    <label class="container">
        { label }
        <input type="checkbox" bind:checked={checked}>
        <span class="checkmark"></span>
    </label>
</custom-checkbox>

<style type="text/scss">
    $size: 18px; // if changed .checkmark:after sizes has to be changed too
    
    .container {
        display: block;
        position: relative;
        padding-left: $size + 10px;
        cursor: pointer;
        font-size: 22px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        font-size: .9em;
        color: white;
    }

    /* Hide the browser's default checkbox */
    .container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }

    /* Create a custom checkbox */
    .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: $size;
        width: $size;
        background-color: #eee;
    }

    /* On mouse-over, add a grey background color */
    .container:hover input ~ .checkmark {
        background-color: #ccc;
    }

    /* When the checkbox is checked, add a blue background */
    .container input:checked ~ .checkmark {
        background-color: var(--color-main-dark);
    }

    /* Create the checkmark/indicator (hidden when not checked) */
    .checkmark:after {
    content: "";
        position: absolute;
        display: none;
    }

    /* Show the checkmark when checked */
    .container input:checked ~ .checkmark:after {
        display: block;
    }

    /* Style the checkmark/indicator */
    .container .checkmark:after {
        left: $size - 12px;
        top: $size - 16px;
        width: $size - 14px;
        height: $size - 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
</style>