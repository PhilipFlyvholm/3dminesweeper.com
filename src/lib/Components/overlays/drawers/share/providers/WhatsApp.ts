import type { ShareProvider } from "./index";
const WhatsAppProvider: ShareProvider = {
    name: 'WhatsApp',
    icon: 'tabler:brand-whatsapp',
    getShareUrl: (shareData) => {
        const message = shareData.text || shareData.title;
        const url = new URL(shareData.url);
        const text = encodeURIComponent(message + " Try to beat me at: "+ url.toString());
        const shareUrl = `https://wa.me/?text=${text}`
        return shareUrl;
    },
    valid: true
};

export default WhatsAppProvider;