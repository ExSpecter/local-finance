<script>
	import Home from '$lib/views/main/Main.svelte'
	import EditPeriodicalModal from '$lib/shared/components/EditPeriodicalModal.svelte'
</script>

<main>
	<Home></Home>
	<EditPeriodicalModal></EditPeriodicalModal>
</main>


<style lang="scss" global>
	:root {
		--color-black: rgba(11, 19, 43, 1);
		--color-grey-dark: rgba(28, 37, 65, 1);
		--color-grey: rgba(58, 80, 107, 1);
		--color-main-dark: rgba(91, 192, 190, 1);
		--color-main: rgba(111, 255, 233, 1);

		--incomeFlowColor: rgba(129, 199, 132, 0.8);
		--spendingFlowColor: rgba(245, 103, 103, 1);

		--menu-bg: rgba(black, .08);
	}

	@import '../lib/styles/global.scss';


	main {
		width: 100vw;
		height: 100vh;
	}
</style>