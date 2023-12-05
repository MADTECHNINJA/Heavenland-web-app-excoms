import { Buffer } from 'buffer';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
    window.Buffer = Buffer;
});
