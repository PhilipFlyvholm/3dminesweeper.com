
import { toastStore, type ToastSettings } from '@skeletonlabs/skeleton';

export function createToast(message: string, isError = false) {
    const t: ToastSettings = {
        message: message,
        background: isError ? 'variant-filled-error' : undefined
    };

    // Trigger the toast:
    toastStore.trigger(t);
}