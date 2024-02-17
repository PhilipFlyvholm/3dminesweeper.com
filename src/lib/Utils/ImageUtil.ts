import { imageStore } from "$lib/Stores/ImageStore";
import { get } from "svelte/store";

export const takeImageOfCube = (final: boolean) => {
	const canvas = document.getElementsByTagName('canvas')[0];
	const dataUrl = canvas.toDataURL('image/png', 1.0);
    if(dataUrl === 'data:,') return; //Something is wrong with the canvas
	imageStore.update((store) => {
        if(final) store.gameOverImage = dataUrl;
		else store.showcaseImages.push(dataUrl);
		return store;
	});
};


function addGradient(ctx: CanvasRenderingContext2D, width: number, height: number, from: string, to: string) {
	const x = width / 2, y =height / 2;
	const grd = ctx.createRadialGradient(x,y, 0, x, y, width);
	grd.addColorStop(0,from);
	grd.addColorStop(1,to);
	
	// Fill with gradient
	ctx.fillStyle = grd;
	ctx.fillRect(0,0,width,height);
}
function addText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 50, color = "white", align:CanvasTextAlign = "center") {
	ctx.font = `${size}px VT323`;
	ctx.fillStyle = color;
	ctx.textAlign = align;
	ctx.fillText(text, x, y);
}

export const createShareableImage = async (time: string, clicks: number, threebv: number, efficiency: number, threebvpersecond:number):Promise<string> => {
	return new Promise((resolve) => {
		console.log("Creating image");
		const cubeImage = get(imageStore).gameOverImage;
		const canvas = document.createElement('canvas');
		canvas.width = 512;
		canvas.height = 512;
		const ctx = canvas.getContext('2d');
		if(!ctx) return resolve(cubeImage);
		console.log("Found context");
		
		addGradient(ctx,canvas.width,canvas.height,"rgb(116, 74, 161)", "rgb(21, 23, 31");
		addText(ctx, "3D Minesweeper", canvas.width/2, 50);
		addText(ctx, `Time: ${time}`, canvas.width/2, 100, 40);
		const effeciencyText = `Efficiency: ${efficiency.toFixed(2)}%`;
		const clicksText = `Clicks: ${clicks}`;
		const alignment = effeciencyText.length > clicksText.length ? effeciencyText.length-clicksText.length-1 : 0;
		addText(ctx, `Clicks: ${clicks}${" ".repeat(alignment)} | 3BV: ${threebv}`, 10, canvas.height-60, 30, "white", "left");
		addText(ctx, `Efficiency: ${efficiency.toFixed(2)}% | 3BV/s: ${threebvpersecond.toFixed(2)}`, 10, canvas.height-20, 30, "white", "left");
		const img = new Image();
		img.onload = () => {
			console.log("Image loaded");
			
			if(img.width > img.height) {
				const ratio = img.height / img.width;
				img.width = 512;
				img.height = 512 * ratio;
			}else{
				const ratio = img.width / img.height;
				img.height = 512;
				img.width = 512 * ratio;
			}
			ctx?.drawImage(img, -img.width/2+canvas.width/2, -img.height/2+canvas.height/2, img.width, img.height);
			const dataUrl = canvas.toDataURL('image/png', 1.0);
			resolve(dataUrl);
		};
		img.src = cubeImage;
	});
}