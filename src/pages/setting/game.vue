<template>
  <q-form>
    <div class="q-gutter-sm">
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
    </div>
  </q-form>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useRegionStore, regionPresets } from 'stores/region'
import type { regionCodeT } from 'stores/region'
import { useNotify } from 'src/composables/notify'

const regionStore = useRegionStore()
const { regions } = storeToRefs(regionStore)
const { updateClientPath, checkStatus } = regionStore
const notify = useNotify()

const selectPath = async (regionCode: regionCodeT) => {
  const pathRaw = await window.__KP_APP__.selectDirectory({
    title: '請選擇遊戲主程式安裝路徑'
  })
  const { normalize, resolve } = window.__KP_UTILS__.path
  const { existsSync } = window.__KP_UTILS__.fs
  const path = normalize(pathRaw)
  if (!path || !existsSync(path))
    return

  const pinFile = regionPresets[regionCode].pinFile
  const installed = existsSync(resolve(path, pinFile))
  if (installed)
    notify.success('已選擇遊戲主程式安裝路徑')
  else
    notify.warning('選擇的路徑不包含遊戲主程式，將執行全新安裝')

  updateClientPath(regionCode, path)
  checkStatus(regionCode)
}
</script>
<script lang="ts">
export default defineComponent({
  name: 'SettingGame'
})
</script>
