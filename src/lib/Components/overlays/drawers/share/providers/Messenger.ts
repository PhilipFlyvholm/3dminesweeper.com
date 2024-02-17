import type { ShareProvider } from "./index";
import { PUBLIC_FACEBOOK_APP_ID } from "$env/static/public";
const MessengerProvider: ShareProvider = {
    name: 'Messenger',
    icon: 'tabler:brand-messenger',
    getShareUrl: (shareData) => {
        const text = shareData.text || shareData.title;
        const url = new URL(shareData.url);
        url.searchParams.append("title", text)
        const urlEncoded = encodeURIComponent(url.toString());
        const app_id = encodeURIComponent(PUBLIC_FACEBOOK_APP_ID)
        const shareUrl = `http://www.facebook.com/dialog/send?&app_id=${app_id}&link=${urlEncoded}&redirect_uri=https://3dminesweeper.com`
        return shareUrl;
    },
    valid: PUBLIC_FACEBOOK_APP_ID !== undefined && PUBLIC_FACEBOOK_APP_ID !== "0000"
};

export default MessengerProvider;