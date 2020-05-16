<script>
	import Home from './views/main/Main.svelte'
	import EditPeriodicalModal from '@shared/components/EditPeriodicalModal.svelte'
</script>

<main>
	<Home></Home>
	<EditPeriodicalModal></EditPeriodicalModal>
</main>


<style type="text/scss" global>
	:root {
		--color-black: rgba(11, 19, 43, 1);
		--color-grey-dark: rgba(28, 37, 65, 1);
		--color-grey: rgba(58, 80, 107, 1);
		--color-main-dark: rgba(91, 192, 190, 1);
		--color-main: rgba(111, 255, 233, 1);

		--incomeFlowColor: rgba(129, 199, 132, 0.8);
		--spendingFlowColor: rgba(245, 103, 103, 1);
	}

	@import './styles/global.scss';


	main {
		width: 100vw;
		height: 100vh;
	}
</style>