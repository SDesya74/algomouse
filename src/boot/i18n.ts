import messages from "src/i18n"
import Vue from "vue"
import VueI18n from "vue-i18n"
import { boot } from "quasar/wrappers"

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: "en-us",
  fallbackLocale: "en-us",
  messages
})

export default boot(({ app }) => {
  app.i18n = i18n
})
