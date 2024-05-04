import { expect, test } from "@playwright/test";

const { describe, beforeEach } = test;

describe("/", async () => {
	beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("heading h1", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /.*SvelteKit.*/ })).toBeVisible({
			timeout: 20_000
		});
	});
});
