import type { ShareProvider } from "./index";

const FacebookProvider: ShareProvider = {
    name: 'Facebook',
    icon: 'tabler:brand-facebook',
    getShareUrl: (shareData) => {
        //const url = shareData.url;
        const url = encodeURIComponent(shareData.url);
        // Text to share
        const text = encodeURIComponent(shareData.text || shareData.title);

        // Construct the Facebook share URL
        const shareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + url + "&quote=" + text
       // const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        return shareUrl;
    }
};

export default FacebookProvider;