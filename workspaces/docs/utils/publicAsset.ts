const envBaseUrl =
	typeof process !== 'undefined' && typeof process.env !== 'undefined' ? process.env.EXPO_BASE_URL ?? '' : '';
const nodeEnv = typeof process !== 'undefined' && typeof process.env !== 'undefined' ? process.env.NODE_ENV : undefined;
const defaultBaseUrl = nodeEnv === 'development' ? '' : '/react-native-cross-player';
const baseUrl = (envBaseUrl || defaultBaseUrl).replace(/^\/?/, '/').replace(/\/$/, '');

export function publicAsset(path: string) {
	const normalizedPath = path.replace(/^\/+/, '');
	return baseUrl ? `${baseUrl}/${normalizedPath}` : `/${normalizedPath}`;
}
