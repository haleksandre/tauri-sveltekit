import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		exclude: ["node_modules/**", "dist/**", "src-tauri/**", "**/@*.spec.ts"],
		includeSource: ["src/**/*.{js,ts}"]
	}
});
