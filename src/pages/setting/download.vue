<template>
  <q-form>
    <div class="q-gutter-sm">
      <q-field
        label="最大連線數"
        hint="設置適當的連線數有助於提升下載速度。"
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
        label="智慧下載模式"
        hint="僅下載必要的更新檔片段（跟隨遊戲本身機制），加快下載速度，若無法順利完成更新時請關閉此選項。"
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
import { useNotify } from 'src/composables/notify'

const preference = window.__KART_PATCHER__.store.preference
const download = ref(preference.get('download'))
const notify = useNotify()

const connectionsSliderLabel = [1, 8, 16, 24, 32]
  .reduce((result, value) => {
    result[value] = value.toString()
    return result
  }, {} as Record<number, string>)

const updatePref = debounce((key: string, value: any) => {
  preference.set(`download.${key}`, value)
  notify.success('設定已成功更新')
}, 700)
</script>
<script lang="ts">
export default defineComponent({
  name: 'SettingDownload'
})
</script>
