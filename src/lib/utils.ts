const test = () => true;

if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	describe("utils", async () => {
		describe("test", async () => {
			it("returns true", async () => {
				expect(test()).to.be.true;
			});
		});
	});
}
