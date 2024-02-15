import type { ShareData } from "../ShareDrawerSettings";
import FacebookProvider from "./Facebook";

export interface ShareProvider {
	getShareUrl: (shareData: ShareData, providerData?: unknown) => string;
    name: string;
    icon: string;
}

export const shareProviders: ShareProvider[] = [FacebookProvider]
