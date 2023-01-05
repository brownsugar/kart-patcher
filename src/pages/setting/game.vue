<template>
  <q-form>
    <q-input
      v-for="region in regions"
      :key="region.code"
      :model-value="region.client.path"
      :label="region.name"
      readonly
    >
      <template #append>
        <q-btn
          round
          flat
          @click="selectPath(region.code)"
        >
          <q-icon
            name="fa-solid fa-folder"
            size="xs"
          />
        </q-btn>
      </template>
    </q-input>
  </q-form>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useRegionStore } from 'stores/region'
import type { regionCodeT } from 'stores/region'

const regionStore = useRegionStore()
const { regions } = storeToRefs(regionStore)
const { updateClientPath } = regionStore
const $q = useQuasar()

const selectPath = async (regionCode: regionCodeT) => {
  const pathRaw = await window.__KART_PATCHER__.dialog.selectDirectory({
    title: '請選擇遊戲主程式安裝路徑'
  })
  const { normalize, resolve } = window.__KART_PATCHER__.node.path
  const { existsSync } = window.__KART_PATCHER__.node.fs
  const path = normalize(pathRaw)
  const executable = regions.value.find(r => r.code === regionCode)?.executable
  if (!path || !existsSync(path) || !executable) {
    return
  }

  const installed = existsSync(resolve(path, executable))
  if (installed) {
    $q.notify({
      classes: 'half-rounded-borders',
      message: '已選擇遊戲主程式安裝路徑',
      color: 'positive',
      icon: 'fa-solid fa-circle-check',
      progress: true
    })
  } else {
    $q.notify({
      classes: 'half-rounded-borders',
      message: '選擇的路徑不包含遊戲主程式，將執行全新安裝',
      color: 'warning',
      icon: 'fa-solid fa-triangle-exclamation',
      progress: true
    })
  }
  updateClientPath(regionCode, path)
}
</script>
<script lang="ts">
export default defineComponent({
  name: 'SettingGame'
})
</script>
