import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@primevue/nuxt-module'],
  primevue: {
    options: {
      theme: { preset: Aura }
    }
  },
  css: ['~/assets/css/main.css', '~/assets/css/checklist.css', '~/assets/css/nav.css', '~/assets/css/calendar.css', '~/assets/css/timechart.css']
})