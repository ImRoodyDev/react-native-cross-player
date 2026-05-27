const workspaceTsc = process.platform === "win32" ? "../../node_modules/.bin/tsc.cmd" : "../../node_modules/.bin/tsc";

module.exports = {
	source: "src",
	output: "dist",
	targets: [
		"module",
		[
			"typescript",
			{
				tsc: workspaceTsc
			}
		]
	]
};
