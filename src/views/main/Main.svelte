<script>
	import MdImportExport from 'svelte-icons/md/MdImportExport.svelte'
	import MdRefresh from 'svelte-icons/md/MdRefresh.svelte'
	import MdKeyboardArrowRight from 'svelte-icons/md/MdKeyboardArrowRight.svelte'
	import MdKeyboardArrowLeft from 'svelte-icons/md/MdKeyboardArrowLeft.svelte'

	import Card from './Card.svelte'
	import CardModel from '@shared/models/card.model.js'

	import UploadArea from './upload-area/UploadArea.svelte'

	let expandMenu = false

	let periodicalFlow = new CardModel('cashflows')
	let periodicals = new CardModel('periodicals')
	let activeCard = periodicalFlow

	function toggleExpand() {
		expandMenu = !expandMenu
	}

	function setActiveCard(card) {
		activeCard = card
	}
</script>

<home>
	<div class="menu {expandMenu ? 'expand' : ''}">
		<div class="menu-item home" on:click={() => setActiveCard(periodicalFlow)}>
			<div class="icon">
				<MdImportExport />
			</div>
			<div class="text">
				Cashflows
			</div>
		</div>
		<div class="menu-item home" on:click={() => setActiveCard(periodicals)}>
			<div class="icon">
				<MdRefresh />
			</div>
			<div class="text">
				Periodicals
			</div>
		</div>

		<div class="menu-item expand-toggle" on:click={() => toggleExpand()}>
			<div class="icon">
				{#if expandMenu}
					<MdKeyboardArrowLeft/>
				{:else}
					<MdKeyboardArrowRight/>
				{/if}
			</div>
			<div class="text">
				Collapse Menu
			</div>
		</div>
	</div>

	<UploadArea></UploadArea>


	<div class="card-wrapper">
		<Card {...activeCard} />
	</div>
</home>

<style type="text/scss">
	home {
		width: 100vw;
		height: 100vh;
		background: var(--color-main-dark);  

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		position: relative;

		overflow-y: hidden;
		overflow-x: hidden;

		.menu {
			$icon-width: 70px;
			$text-width: 300px;

			position: absolute;
			height: 100vh;
			width: $icon-width;
			overflow: hidden;

			background-color: transparent;
			opacity: .7;

			transition: width $menu-transition, background-color $menu-transition;

			top: 0px;
			left: 0px;

			display: flex;
			flex-direction: column;
			justify-content: center;

			z-index: 10;

			.menu-item {
				width: $icon-width + $text-width;
				display: flex;
				height: 70px;
				padding: 20px 0px;

				cursor: pointer;

				* {
					color: white;

					display: flex;
					align-items: center;
					justify-content: center;
				}

				.icon {
					flex: 0 0 $icon-width;
					width: 20px;
					width: 20px;
				}

				.text {
					flex: 0 0 $text-width;
					font-size: 1.2em;
				}

				&:hover {
					background: $menu-item-hover-background;
				}

				&.expand-toggle {
					justify-self: flex-end;
				}
			}

			&.expand:hover {
				width: $icon-width + $text-width;
				background-color: $menu-background;

				&~ .card-wrapper {
					transform: translate($text-width);
				}
			}
		}

		.card-wrapper {
			transition: transform $menu-transition;
		}

		.upload-area-text {
			writing-mode: vertical-rl;
			text-orientation: mixed;

			height: 100%;
			width: 10vw;
			position: absolute;
			right: 0;
			top: 0;
			text-align: center;

			cursor: default;
		}
	}
</style>