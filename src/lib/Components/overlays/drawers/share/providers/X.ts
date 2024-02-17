import type { ShareProvider } from ".";

const XProvider: ShareProvider = {
   
    name: 'X',
    icon: 'tabler:brand-x',
    getShareUrl: (shareData) => {
        const text = encodeURIComponent(shareData.text || shareData.title);
        const url = new URL(shareData.url);
        const urlEncoded = encodeURIComponent(url.toString());
        const shareUrl = ` https://twitter.com/intent/tweet?text=${text}&url=${urlEncoded}`
        return shareUrl;
    },
    valid: true
}

export default XProvider;