<script lang="ts">
	import { onMount } from "svelte";
	import { check } from "@tauri-apps/plugin-updater";
	import { relaunch } from "@tauri-apps/plugin-process";

	const update = async () =>
		check().then(
			(update) =>
				update || {
					available: false,
					downloadAndInstall: async () => void 0
				}
		);

	onMount(async () => {
		const { available, downloadAndInstall } = await update();

		if (available) {
			await downloadAndInstall();
			await relaunch();
		}
	});
</script>
