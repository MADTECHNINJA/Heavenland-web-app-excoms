import { Notification, Variant, Link } from '~/types/Notification.types';
import { reactive } from 'vue';

export type NotificationParams = {
    title: string;
    variant: Variant;
    closable?: boolean;
    minimizable?: boolean;
    link?: Link;
    indefinite?: boolean;
    additionalInfo?: string;
    message?:
        | string
        | {
              component: unknown;
              data: unknown;
          }
        | {
              component: unknown;
              data: unknown;
          }[];
    transactionFlow?: {
        component: unknown;
        data: unknown;
    };
};

export class NotificationManager {
    private static instance?: NotificationManager;
    notifications: Array<Notification> = reactive([]);
    private id = 0;

    public static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }

        return NotificationManager.instance;
    }

    create(params: NotificationParams) {
        this.id += 1;
        this.notifications.push(new Notification(params, this.id));
        return this.notifications.find((o) => {
            return o.id === this.id;
        });
    }

    async remove(id: number) {
        const index = this.notifications.findIndex(function (o) {
            return o.id === id;
        });
        if (index !== -1) {
            this.notifications.splice(index, 1);
        }
    }

    async setHidden(id: number, value: boolean) {
        const index = this.notifications.findIndex(function (o) {
            return o.id === id;
        });
        if (index !== -1) {
            this.notifications[index].hidden = value;
        }
    }

    clear() {
        this.notifications.forEach((notification) => {
            notification.close = true;
        });
    }
}
