//https://stackoverflow.com/questions/69850527/why-is-navigator-maxtouchpoints-10-in-chrome-on-desktop
export function isTouchDevice() {
	const navigator = (window.top || window).navigator;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore msMaxTouchPoints is not in the lib
	const maxTouchPoints = Number.isFinite(navigator.maxTouchPoints)
		? navigator.maxTouchPoints
		: navigator.msMaxTouchPoints;
	if (Number.isFinite(maxTouchPoints)) {
		// Windows 10 system reports that it supports touch, even though it acutally doesn't (ignore msMaxTouchPoints === 256).
		return maxTouchPoints > 0 && maxTouchPoints !== 256;
	}
	return 'ontouchstart' in window;
}
