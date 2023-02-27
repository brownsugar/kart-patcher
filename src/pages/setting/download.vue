<template>
  <q-form>
    <div class="q-gutter-sm">
      <q-field
        :label="$t('setting.download.content.connections.name')"
        :hint="$t('setting.download.content.connections.description')"
        :model-value="download.connections"
      >
        <template #control>
          <q-slider
            v-model="download.connections"
            color="primary"
            :min="0"
            :max="33"
            :inner-min="1"
            :inner-max="32"
            :marker-labels="connectionsSliderLabel"
            snap
            label
            switch-label-side
            @update:model-value="updatePref('connections', $event)"
          />
        </template>
      </q-field>
      <q-field
        :label="$t('setting.download.content.deltaMode.name')"
        :hint="$t('setting.download.content.deltaMode.description')"
        :model-value="download.deltaMode"
      >
        <template #control>
          <q-toggle
            v-model="download.deltaMode"
            @update:model-value="updatePref('deltaMode', $event)"
          />
        </template>
      </q-field>
    </div>
  </q-form>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue'
import { debounce } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useNotify } from 'src/composables/notify'

const preference = window.__KP_STORE__.preference
const download = ref(preference.get('download'))
const notify = useNotify()
const { t } = useI18n()

const connectionsSliderLabel = [1, 8, 16, 24, 32]
  .reduce((result, value) => {
    result[value] = value.toString()
    return result
  }, {} as Record<number, string>)

const updatePref = debounce((key: string, value: any) => {
  preference.set(`download.${key}`, value)
  notify.success(t('setting.message.updateSuccess'))
}, 700)
</script>
<script lang="ts">
export default defineComponent({
  name: 'SettingDownload'
})
</script>
