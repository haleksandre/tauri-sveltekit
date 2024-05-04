import { expect, test } from "@playwright/test";

const { describe, beforeEach } = test;

describe("/about", async () => {
	beforeEach(async ({ page }) => {
		await page.goto("/");

		page.getByRole("link", { name: "About" }).click();
	});

	test("h1", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "About this app" })).toBeVisible({
			timeout: 20_000
		});
	});
});
