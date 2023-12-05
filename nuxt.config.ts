import { defineNuxtConfig } from 'nuxt';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: ['@pinia/nuxt'],

    modules: ['@nuxtjs/tailwindcss'],

    css: ['@/styles/swv.css', '@/styles/form.css', '@/styles/style.css', '@/styles/oruga.css'],

    meta: {
        title: 'Excoms App',
        link: [
            { rel: 'icon', href: '/favicon.ico' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'stylesheet', href: 'https://use.typekit.net/ygo0fdl.css' },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Courier+Prime&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap',
            },
        ],
        charset: 'UTF-8',
    },

    vue: {
        config: {
            devtools: true,
        },
    },

    vite: {
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
                plugins: [
                    NodeGlobalsPolyfillPlugin({
                        process: true,
                        buffer: true,
                    }),
                ],
            },
        },

        resolve: {
            alias: [
                {
                    find: '@jup-ag/cykura-sdk',
                    replacement: 'node_modules/@jup-ag/cykura-sdk/dist/index.js',
                },
                {
                    find: '@jup-ag/cykura-sdk-core',
                    replacement: 'node_modules/@jup-ag/cykura-sdk-core/dist/index.js',
                },
                {
                    find: '@cykura/sdk-core',
                    replacement: 'node_modules/@cykura/sdk-core/dist/index.js',
                },
            ],
        },
    },

    ssr: false,
});
