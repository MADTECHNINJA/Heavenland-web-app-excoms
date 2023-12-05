import { defineNuxtPlugin } from '#app';
import Cleave from 'vue-cleave-component';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Cleave)
})