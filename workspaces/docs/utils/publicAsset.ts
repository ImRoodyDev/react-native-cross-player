const baseUrl = (process.env.EXPO_BASE_URL ?? '').replace(/^\/?/, '/').replace(/\/$/, '');

export function publicAsset(path: string) {
	const normalizedPath = path.replace(/^\/+/, '');
	return `${baseUrl}/${normalizedPath}`;
}
