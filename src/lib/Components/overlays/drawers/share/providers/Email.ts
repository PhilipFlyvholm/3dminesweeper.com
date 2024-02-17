import type { ShareProvider } from "./index";
const EmailProvider: ShareProvider = {
    name: 'Email',
    icon: 'tabler:mail',
    getShareUrl: (shareData) => {
        const message = shareData.text || shareData.title;
        const url = new URL(shareData.url);
        const text = encodeURIComponent(message + " Try to beat me at: "+ url.toString());
        const shareUrl = `mailto:?body=${text}`
        return shareUrl;
    },
    valid: true
};

export default EmailProvider;