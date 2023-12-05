import { NotificationManager } from '~/types/NotificationManager.types';
import { NotificationTitles } from '~/types/Notification.data';
import { Variant } from '~/types/Notification.types';

export const copyClipboard = async (text: string) => {
    await navigator.clipboard
        .writeText(text)
        .then(() => {
            NotificationManager.getInstance().create({
                title: NotificationTitles.TEXT_COPIED,
                variant: Variant.SUCCESS,
            });
        })
        .catch(() => {
            NotificationManager.getInstance().create({
                title: NotificationTitles.GENERAL_ERROR,
                variant: Variant.ERROR,
            });
        });
};
