<template>
  <q-form>
    <div class="q-gutter-sm">
      <q-select
        v-model="locale"
        :options="localeOptions"
        :label="$t('setting.language.content.locale')"
        emit-value
        map-options
        @update:model-value="updatePref('locale', $event)"
      />
    </div>
  </q-form>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotify } from 'src/composables/notify'

const { locale, t, availableLocales } = useI18n({ useScope: 'global' })
const preference = window.__KP_STORE__.preference
const notify = useNotify()

const localeOptions = availableLocales
  .map(key => ({
    value: key,
    label: t('lang', 0, { locale: key })
  }))

const updatePref = (key: string, value: any) => {
  preference.set(`language.${key}`, value)
  notify.success(t('setting.message.updateSuccess'))
}
</script>
<script lang="ts">
export default defineComponent({
  name: 'SettingLanguage'
})
</script>
