import type { PlaywrightTestConfig } from "@playwright/test";

import { join } from "node:path";

const ci = (
	process.env.CI
		? {
				workers: 1,
				reporter: [
					["line"],
					[
						"html",
						{
							open: "never",
							outputFolder: join(process.cwd(), "reports", `${process.env.PLATFORM}`, "integration")
						}
					],
					[
						"json",
						{
							outputFile: join(
								process.cwd(),
								"reports",
								`${process.env.PLATFORM}`,
								"integration",
								"result.json"
							)
						}
					]
				]
			}
		: {}
) satisfies Partial<PlaywrightTestConfig>;

const config: PlaywrightTestConfig = {
	webServer: {
		command: "bun run build:frontend && bun run preview",
		url: "http://localhost:4173"
	},
	use: {
		baseURL: "http://localhost:4173"
	},
	timeout: 10 * 60 * 1000,
	testDir: "./src/",
	testMatch: ["**/@*.spec.ts"],
	testIgnore: ["utils/**"],
	outputDir: "./playwright/results",
	retries: 2,
	...ci
};

export default config;
