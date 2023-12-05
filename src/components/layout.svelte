<script>
	import '../routes/styles.scss';
	import Menu from "./menu.svelte";
	import MenuLeft from "./menu_left.svelte";

	import { theme } from '../store.ts';

</script>
<MenuLeft />
<Menu />
<div class="app {$theme}">
		<slot />

	<footer>
		<p>visit <a href="https://portfolio-kai-kleinbard-sand.vercel.app/">https://portfolio-kai-kleinbard-sand.vercel.app/</a> to learn about my work</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		/* width: 100%; */
		/* max-width: 70rem; */
		margin: 0 auto;
		box-sizing: border-box;

         width: 90%;

 @media (min-width: 720px) {
  width: 60%;
 }
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
