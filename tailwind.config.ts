import { join } from "path";

import { skeleton } from "@skeletonlabs/skeleton/plugin";
// import * as themes from "@skeletonlabs/skeleton/themes";

/** @type {import('tailwindcss').Config} \*/
const config = {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		join(require.resolve("@skeletonlabs/skeleton-svelte"), "../**/*.{html,js,svelte,ts}")
	],
	theme: {
		extend: {}
	},
	plugins: [skeleton({})]
};

export default config;
