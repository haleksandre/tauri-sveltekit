import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export const main = async (tag, { core, context, github }) => {
	const { setOutput, info } = core;
	const { owner, repo } = context.repo;

	const parse = (assets) =>
		assets.reduce((assets, { name, browser_download_url: url, assets }) => {
			const platforms = [
				{ pattern: "app-x86_64.app.tar.gz", platform: "darwin-x86_64" },
				{ pattern: "app-aarch64.app.tar.gz", platform: "darwin-aarch64" },
				{ pattern: "app-amd64.AppImage.tar.gz", platform: "linux-x86_64" },
				{ pattern: "app-x64-setup.nsis.zip", platform: "windows-x86_64" }
			];

			for (const { pattern, platform } of platforms) {
				if (name.includes(pattern)) {
					assets = {
						...assets,
						[platform]: {
							url,
							signature: `${url}.sig`
						}
					};

					break;
				}
			}

			return assets;
		}, {});

	const {
		data: { id, body: notes, published_at: pub_date, assets }
	} = await github.rest.repos.getReleaseByTag({
		owner,
		repo,
		tag
	});

	const file = join(github.workspace, "latest.json");
	const latest = JSON.stringify(
		{
			version: tag,
			notes,
			pub_date,
			platforms: parse(assets)
		},
		null,
		2
	);

	await writeFile(file, latest);

	setOutput(`write file to ${file}`);
};
