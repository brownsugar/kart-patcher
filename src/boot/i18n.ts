import { boot } from 'quasar/wrappers'
import { Quasar } from 'quasar'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = typeof messages['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

const preference = window.__KP_STORE__.preference
const savedLocale = preference.get('language.locale') as string
const guessedLocale = Quasar.lang.getLocale() ?? ''
const defaultLocale = savedLocale ?? guessedLocale
const locale = Object.keys(messages).includes(defaultLocale)
  ? defaultLocale
  : (defaultLocale.toLowerCase().startsWith('zh')
    ? 'zh-TW'
    : 'en-US')

export const i18n = createI18n({
  locale,
  legacy: false,
  messages
})

export default boot(({ app }) => {
  app.use(i18n)
})
