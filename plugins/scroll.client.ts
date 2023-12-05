import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.$router.options.scrollBehavior = (to, from, savedPosition) => {
        return new Promise((resolve, reject) => {
            resolve({ left: 0, top: 0, behaviour: 'smooth' });
        });
    };
});
