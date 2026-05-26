/**
 * Request fullscreen for a given DOM element using cross-browser APIs.
 * Tries the modern `requestFullscreen` API first and falls back to
 * vendor-prefixed implementations used by older browsers or WebKit-based
 * environments. Returns `true` when a request was issued, `false` when
 * no fullscreen API is available on the element.
 * @param element The HTML element to make fullscreen
 * @returns `true` when the request was invoked, otherwise `false`
 */
export function requestFullscreen(element: HTMLElement): boolean {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if ((element as any).mozRequestFullScreen) {
		(element as any).mozRequestFullScreen();
	} else if ((element as any).webkitRequestFullscreen) {
		(element as any).webkitRequestFullscreen();
	} else if ((element as any).msRequestFullscreen) {
		(element as any).msRequestFullscreen();
	} else if ((element as any).webkitEnterFullscreen) {
		(element as any).webkitEnterFullscreen();
	} else return false;

	return true;
}

/**
 * Exit fullscreen mode using the appropriate browser API.
 * Returns `true` when an exit request was issued, `false` when no
 * compatible API was found on the document.
 * @returns `true` when exit was invoked, otherwise `false`
 */
export function exitFullscreen(): boolean {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if ((document as any).mozCancelFullScreen) {
		(document as any).mozCancelFullScreen();
	} else if ((document as any).webkitExitFullscreen) {
		(document as any).webkitExitFullscreen();
	} else if ((document as any).msExitFullscreen) {
		(document as any).msExitFullscreen();
	} else {
		return false;
	}
	return true;
}

/**
 * Check whether the document is currently in fullscreen mode.
 * Uses multiple vendor-specific document properties for broad browser support.
 * @returns `true` when fullscreen is active, otherwise `false`
 */
export function fullscreenDetected(): boolean {
	return !!(
		document.fullscreenElement ||
		(document as any).mozFullScreenElement ||
		(document as any).webkitFullscreenElement ||
		(document as any).msFullscreenElement
	);
}
