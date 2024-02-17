import type { ShareData } from "../ShareDrawerSettings";
import EmailProvider from "./Email";
import FacebookProvider from "./Facebook";
import LinkedInProvider from "./LinkedIn";
import MessengerProvider from "./Messenger";
import WhatsAppProvider from "./WhatsApp";
import XProvider from "./X";

export interface ShareProvider {
    getShareUrl: (shareData: ShareData, providerData?: unknown) => string;
    name: string;
    icon: string;
    valid: boolean;
}

export const shareProviders: ShareProvider[] = [FacebookProvider, MessengerProvider, XProvider, WhatsAppProvider, LinkedInProvider, EmailProvider]