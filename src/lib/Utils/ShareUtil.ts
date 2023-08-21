import { createToast } from "$lib/Utils/ToastUtil";
import { gameStore } from "$lib/Stores/GameStore";
import { get } from "svelte/store";
import { imageStore } from "$lib/Stores/ImageStore";
function dataURLtoFile(dataurl: string, filename: string) {
    let arr = dataurl.split(',');
    if (arr.length < 2) return null;
    let mime = arr[0].match(/:(.*?);/);
    if (!mime) return null;
    let bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime[1] });
}


export function share(prettyDate: string) {
    const $gameStore = get(gameStore);
    const $imageStore = get(imageStore);
    if (!$gameStore || !$gameStore.isGameOver || !$gameStore.isGameWon) return;
    const time = prettyDate.split(':');
    const hours = parseInt(time[0]);
    const minutes = parseInt(time[1]);
    const seconds = parseInt(time[2]);
    const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${
        seconds > 0 ? seconds + 's' : ''
    }`;

    const message = `I just played 3D Minesweeper and cleared a ${$gameStore.size.width}x${$gameStore.size.height}x${$gameStore.size.depth} in ${timeString}!`;
    if (navigator.canShare) {
        console.log('Sharing');

        const file = $imageStore.gameOverImage !== '' ? dataURLtoFile($imageStore.gameOverImage, '3dminesweeper.png') : null;
        const title = '3D Minesweeper';
        const url = 'https://3dminesweeper.com';
        let shareObject: {
            title: string;
            url: string;
            text?: string;
            files?: File[];
        } = {
            title: title,
            url: url
        };

        if (
            file &&
            navigator.canShare({
                ...shareObject,
                text: message,
                files: file ? [file] : undefined
            })
        ) {
            shareObject = {
                ...shareObject,
                text: message,
                files: file ? [file] : undefined
            };
        } else if (
            navigator.canShare({
                ...shareObject,
                text: message
            })
        ) {
            shareObject = {
                ...shareObject,
                text: message
            };
        }
        navigator
            .share(shareObject)
            .then(() => {
                createToast('Successfully shared!');
                console.log('Share was successful.');
            })
            .catch((error) => {
                createToast('Something went wrong during sharing', true);
                console.log('Sharing failed', error);
            });
    } else {
        //Copy to clipboard

        console.log('Copying to clipboard');
        const url = `https://3dminesweeper.com/play/${$gameStore.size.width}x${$gameStore.size.height}x${$gameStore.size.depth}`;
        const string = message + ` Try to beat me at ${url}`;
        if(navigator.clipboard){
            navigator.clipboard.writeText(string);
            createToast('Copied to clipboard!');
        }else{
            createToast('Failed to copy to clipboard', true)
        }
            
    }
}