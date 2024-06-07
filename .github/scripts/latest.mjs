import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export const main = async (tag, { core, context, github }) => {
	const { setOutput, info } = core;
	const { owner, repo } = context.repo;

	const parse = (assets) =>
		assets.reduce((assets, { name, browser_download_url: url, assets }) => {
			const platforms = [
				{ pattern: "_x64.app.tar.gz", platform: "darwin-x86_64" },
				{ pattern: "_aarch64.app.tar.gz", platform: "darwin-aarch64" },
				{ pattern: "_amd64.AppImage.tar.gz", platform: "linux-x86_64" },
				{ pattern: "x64-setup.nsis.zip", platform: "windows-x86_64" }
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
		data: { body: notes, published_at: pub_date, assets }
	} = await github.rest.repos.getReleaseByTag({
		owner,
		repo,
		tag
	});

	const file = join(github.workspace, "latest.json");
	const latest = {
		version: tag,
		notes,
		pub_date,
		platforms: parse(assets)
	};
	const json = JSON.stringify(latest, null, 2);

	await writeFile(file, json);

	info(`write file to ${file}`);

	setOutput(`raw`, latest);
	setOutput(`json`, json);
	setOutput(`file`, file);
};
