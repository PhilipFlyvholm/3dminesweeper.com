import type { ShareData } from "../ShareDrawerSettings";
import FacebookProvider from "./Facebook";

export interface ShareProvider {
	getShareUrl: (shareData: ShareData, providerData?: unknown) => string;
    name: string;
    icon: string;
}

export const shareProviders: ShareProvider[] = [FacebookProvider]

/**
 * Share Providers and their respective share URLs and parameters (may contain invalid or outdated information).
 *     Facebook:
        Share URL: https://www.facebook.com/sharer/sharer.php
        Parameters:
            u: The URL to be shared.
            quote: The text to be shared along with the URL.
            picture: The URL of an image to be shared (optional).

    Twitter:
        Share URL: https://twitter.com/intent/tweet
        Parameters:
            url: The URL to be shared.
            text: The text to be shared along with the URL.
            via: The Twitter username of the user to be credited (optional).
            hashtags: A comma-separated list of hashtags (optional).

    LinkedIn:
        Share URL: https://www.linkedin.com/sharing/share-offsite/
        Parameters:
            url: The URL to be shared.
            mini: A boolean value (true or false) to enable/disable the mini-share button (optional).

    Pinterest:
        Share URL: https://www.pinterest.com/pin/create/button/
        Parameters:
            url: The URL to be shared.
            media: The URL of an image to be shared (optional).
            description: The description text for the pin (optional).

    WhatsApp:
        Share URL: https://api.whatsapp.com/send
        Parameters:
            text: The text to be shared.
            phone: The phone number to share the message with (optional).

    Reddit:
        Share URL: https://www.reddit.com/submit
        Parameters:
            url: The URL to be shared.
            title: The title of the submission (optional).

    Telegram:
        Share URL: https://t.me/share/url
        Parameters:
            url: The URL to be shared.
            text: The text to be shared along with the URL.

    Email:
        Share URL: mailto:
        Parameters:
            subject: The subject of the email.
            body: The body of the email.
 */