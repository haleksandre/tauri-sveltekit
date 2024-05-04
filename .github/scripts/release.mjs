export const run = async (releases, { core, context, github }) => {
	const { name, version } = releases[0];

	const { setOutput, info } = core;
	const { owner, repo } = context.repo;

	const tag = `v${version}`;
	const {
		data: { id, prerelease, ...data }
	} = await github.rest.repos.getReleaseByTag({
		owner,
		repo,
		tag
	});

	// Use to convert to a numbered prerelease for WIX releases
	const toWix = (version) => {
		const [base, pre] = version.split("-");

		const prerelease = {
			alpha: 1000,
			beta: 2000,
			next: 3000,
			rc: 5000
		};

		if (base && pre) {
			const [label, build] = pre.split(".");

			if (prerelease[label]) {
				const number = parseInt(build || "0", 10);

				return `${base}-${prerelease[label] + number}`;
			}
		}

		return version;
	};

	const wix = toWix(version);
	const semver = wix.replace(/[-+]/g, ".");

	info(`set outputs`);

	info(`  data: ${JSON.stringify({ id, prerelease, ...data })}`);
	setOutput(`data`, { id, prerelease, ...data });

	info(`  id: "${id}"`);
	setOutput(`id`, id);

	info(`  version: "${version}"`);
	setOutput(`version`, version);

	info(`  tag: "${tag}"`);
	setOutput(`tag`, tag);

	info(`  wix: "${wix}"`);
	setOutput(`wix`, wix);

	info(`  semver: "${semver}"`);
	setOutput(`semver`, semver);

	info(`  prerelease: "${prerelease}"`);
	setOutput(`prerelease`, prerelease);
};
