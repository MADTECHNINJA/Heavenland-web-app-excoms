import { createLogger } from 'vue-logger-plugin';

import { defineNuxtPlugin } from '#app';

export const logger = createLogger({
    enabled: import.meta.env.VITE_EXCOMS_MODE === 'development',
    level: 'debug',
});

export default defineNuxtPlugin(() => {
    createLogger({
        enabled: import.meta.env.VITE_EXCOMS_MODE === 'development',
        level: 'debug',
    });
});
