// Stub for react-native-blob-util that uses Node.js fs for testing
const fs = require("fs").promises;
const path = require("path");

const stubFs = {
	dirs: {
		CacheDir: path.join(__dirname, "..")
	},
	writeFile: async (filePath, data, encoding) => {
		// Ensure directory exists
		const dir = path.dirname(filePath);
		await fs.mkdir(dir, { recursive: true });
		// Write the file
		await fs.writeFile(filePath, data, encoding);
		return Promise.resolve(true);
	},
	readFile: async (filePath, encoding = "utf8") => {
		// Return file contents as string using the provided encoding
		const data = await fs.readFile(filePath, encoding);
		return data;
	},
	exists: async (filePath) => {
		try {
			await fs.access(filePath);
			return true;
		} catch (err) {
			return false;
		}
	},
	mkdir: async (dirPath) => {
		await fs.mkdir(dirPath, { recursive: true });
		return true;
	},
	unlink: async (filePath) => {
		try {
			await fs.unlink(filePath);
			return Promise.resolve(true);
		} catch (error) {
			// If file doesn't exist, that's fine
			return Promise.resolve(true);
		}
	}
};

const stub = {
	fs: stubFs
};

module.exports = stub;
