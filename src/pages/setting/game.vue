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
import { useI18n } from 'vue-i18n'
import { useRegionStore, regionPresets } from 'stores/region'
import type { regionCodeT } from 'stores/region'
import { useNotify } from 'src/composables/notify'

const regionStore = useRegionStore()
const { regions } = storeToRefs(regionStore)
const { updateClientPath, checkStatus } = regionStore
const notify = useNotify()
const { t } = useI18n()

const selectPath = async (regionCode: regionCodeT) => {
  const pathRaw = await window.__KP_APP__.selectDirectory({
    title: t('setting.game.content.selectDirectory')
  })
  const { normalize, resolve } = window.__KP_UTILS__.path
  const { existsSync } = window.__KP_UTILS__.fs
  const path = normalize(pathRaw)
  if (!path || !existsSync(path))
    return

  const pinFile = regionPresets[regionCode].pinFile
  const installed = existsSync(resolve(path, pinFile))
  if (installed)
    notify.success(t('setting.game.content.pathSelected'))
  else
    notify.warning(t('setting.game.content.emptyPathSelected'))

  updateClientPath(regionCode, path)
  checkStatus(regionCode)
}
</script>
<script lang="ts">
export default defineComponent({
  name: 'SettingGame'
})
</script>
