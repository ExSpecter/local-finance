<script>
	import Card from './cards/Card.svelte'
	import CardModel from './models/card.model.js'

	import UploadArea from './components/UploadArea.svelte'


	let periodicalFlow = new CardModel('periodical-flow')
	let cards = [periodicalFlow]

</script>

<main>

	{#each cards as { type, props }}
		<Card {type} {props}></Card>
	{/each}

	<!-- <div class="upload-area-text" on:mouseover={showUploadArea}>Upload Area</div> -->
	<UploadArea></UploadArea>
</main>

<style type="text/scss">
	main {
		width: 100vw;
		height: 100vh;
		background: #E0EAFC;  /* fallback for old browsers */
		background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);  /* Chrome 10-25, Safari 5.1-6 */
		background: linear-gradient(to right, #CFDEF3, #E0EAFC); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		overflow-y: hidden;
		overflow-x: hidden;

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