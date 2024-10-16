import { imageStore } from '$lib/Stores/ImageStore';
import { get } from 'svelte/store';

export const takeImageOfShape = (final: boolean) => {
	if (final) {
		imageStore.update((store) => {
			store.processesingGameOverImage = true;
			return store;
		});
	}
	const canvas = document.getElementsByTagName('canvas')[0];
	const CopyCanvas = document.createElement('canvas');
	CopyCanvas.width = canvas.width;
	CopyCanvas.height = canvas.height;
	const copyCtx = CopyCanvas.getContext('2d');
	if (!copyCtx) return;
	copyCtx.drawImage(canvas, 0, 0);

	const pixels = copyCtx.getImageData(0, 0, canvas.width, canvas.height).data;
	let leftCorner = { x: canvas.width, y: canvas.height };
	let rightCorner = { x: 0, y: 0 };
	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			const pixel = (y * canvas.width + x) * 4;
			const alpha = pixels[pixel + 3];
			if (alpha !== 0) {
				if (x < leftCorner.x) leftCorner = { x, y: leftCorner.y };
				if (y < leftCorner.y) leftCorner = { x: leftCorner.x, y };
				if (x > rightCorner.x) rightCorner = { x, y: rightCorner.y };
				if (y > rightCorner.y) rightCorner = { x: rightCorner.x, y };
			}
		}
	}

	const width = rightCorner.x - leftCorner.x;
	const height = rightCorner.y - leftCorner.y;
	const croppedCanvas = document.createElement('canvas');
	croppedCanvas.width = width;
	croppedCanvas.height = height;
	const newCtx = croppedCanvas.getContext('2d');

	if (!newCtx) return;

	newCtx.drawImage(canvas, leftCorner.x, leftCorner.y, width, height, 0, 0, width, height);

	const dataUrl = croppedCanvas.toDataURL('image/png', 1.0);
	if (dataUrl === 'data:,') return; //Something is wrong with the canvas
	imageStore.update((store) => {
		if (final) store.gameOverImage = dataUrl;
		else store.showcaseImages.push(dataUrl);
		store.processesingGameOverImage = false;
		return store;
	});
};

function addGradient(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	from: string,
	to: string
) {
	const x = width / 2,
		y = height / 2;
	const grd = ctx.createRadialGradient(x, y, 0, x, y, width);
	grd.addColorStop(0, from);
	grd.addColorStop(1, to);

	// Fill with gradient
	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, width, height);
}
function addText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	size = 100,
	color = 'white',
	align: CanvasTextAlign = 'left'
) {
	ctx.font = `${size}px VT323`;
	ctx.fillStyle = color;
	ctx.textAlign = align;
	ctx.fillText(text, x, y);
}

export const createShareableImage = async (
	time: string,
	clicks: number,
	threebv: number,
	efficiency: number,
	threebvpersecond: number
): Promise<string> => {
	return new Promise((resolve) => {
		console.log('Creating image');
		const shapeImage = get(imageStore).gameOverImage;
		const canvas = document.createElement('canvas');
		canvas.width = 1200;
		canvas.height = 630;
		const ctx = canvas.getContext('2d');
		if (!ctx) return resolve(shapeImage);
		console.log('Found context');

		addGradient(ctx, canvas.width, canvas.height, 'rgb(116, 74, 161)', 'rgb(21, 23, 31');
		addText(ctx, '3D Minesweeper', 25, 125, 100);

		const statsBaseY = 300;
		addText(ctx, `Time: ${time}`, 25, statsBaseY, 80);
		addText(ctx, `Clicks: ${clicks}`, 25, statsBaseY + 70 * 1, 70);
		addText(ctx, `Efficiency: ${efficiency.toFixed(2)}%`, 25, statsBaseY + 70 * 2, 70);
		addText(ctx, `3BV: ${threebv}`, 25, statsBaseY + 70 * 3, 70);
		addText(ctx, `3BV/s: ${threebvpersecond.toFixed(2)}`, 25, statsBaseY + 70 * 4, 70);
		const img = new Image();
		img.onload = () => {
			console.log('Image loaded');

			if (img.width > img.height) {
				const ratio = img.height / img.width;
				img.width = canvas.height * 0.8;
				img.height = canvas.height * 0.8 * ratio;
			} else {
				const ratio = img.width / img.height;
				img.height = canvas.height * 0.8;
				img.width = canvas.height * 0.8 * ratio;
			}
			ctx?.drawImage(
				img,
				-img.width + canvas.width - 50,
				-img.height / 2 + canvas.height / 2,
				img.width,
				img.height
			);
			const dataUrl = canvas.toDataURL('image/png', 1.0);
			resolve(dataUrl);
		};
		img.src = shapeImage;
	});
};
