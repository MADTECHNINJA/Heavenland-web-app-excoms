import { defineNuxtPlugin } from '#app';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import Oruga from '@oruga-ui/oruga-next';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Oruga, 
        {
            iconComponent: FontAwesomeIcon,
            iconPack: 'fas',
            loading: {
    
                icon: 'spinner-third',
              },

    })
})