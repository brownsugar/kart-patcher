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
            @click="clientPathHandler(region.code)"
          >
            <q-icon
              name="fa-solid fa-folder"
              size="xs"
            />
            <q-tooltip
              anchor="center left"
              self="center right"
              :offset="[5, 0]"
            >
              {{ t('setting.game.content.browse') }}
            </q-tooltip>
          </q-btn>
        </template>
      </q-input>
    </div>
  </q-form>
  <q-dialog v-model="autofill.dialog">
    <q-card>
      <q-card-section>
        <div class="text-body2 flex items-center no-wrap">
          <q-avatar
            icon="fa-solid fa-info"
            color="primary"
            text-color="white"
            size="md"
          />
          <span class="q-ml-sm">{{ $t('setting.game.content.pathDetected') }}</span>
        </div>
        <div class="q-mt-md">
          <q-input
            :model-value="autofill.path"
            outlined
            readonly
            dense
          >
            <template #append>
              <q-btn
                size="sm"
                round
                flat
                @click="openDirectory(autofill.path)"
              >
                <q-icon
                  name="fa-solid fa-folder-open"
                  size="xs"
                />
                <q-tooltip
                  anchor="center left"
                  self="center right"
                  :offset="[5, 0]"
                >
                  {{ t('setting.game.content.openInExplorer') }}
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-close-popup
          color="primary"
          :label="$t('general.no')"
          flat
          @click="selectPath(autofill.regionCode)"
        />
        <q-btn
          v-close-popup
          color="primary"
          :label="$t('general.yes')"
          unelevated
          @click="confirmPath(autofill.regionCode, autofill.path)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue'
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

const autofill = ref({
  dialog: false,
  path: '',
  regionCode: '' as regionCodeT
})

const { normalize, resolve } = window.__KP_UTILS__.path
const { existsSync } = window.__KP_UTILS__.fs

const clientPathHandler = async (regionCode: regionCodeT) => {
  const region = regions.value.find(r => r.code === regionCode)
  if (!region?.client.path) {
    const { path, rootPathName } = regionPresets[regionCode].registry
    const registry = await window.__KP_APP__.readRegistry(path)
    if (registry !== null) {
      const rootPath = registry.find(item => item.name === rootPathName)
      if (rootPath) {
        autofill.value.path = rootPath.value
        autofill.value.regionCode = regionCode
        autofill.value.dialog = true
        return
      }
    }
  }
  await selectPath(regionCode)
}
const openDirectory = (path: string) => {
  window.__KP_APP__.openDirectory(path)
}
const selectPath = async (regionCode: regionCodeT) => {
  const region = regions.value.find(r => r.code === regionCode)
  const pathRaw = await window.__KP_APP__.selectDirectory({
    title: t('setting.game.content.selectDirectory'),
    defaultPath: region?.client.path ?? undefined
  })
  if (!pathRaw)
    return
  const path = normalize(pathRaw)
  if (!existsSync(path))
    return
  confirmPath(regionCode, path)
}
const confirmPath = (regionCode: regionCodeT, path: string) => {
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
