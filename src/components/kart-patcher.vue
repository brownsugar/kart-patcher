<template>
  <div class="column full-height">
    <div class="col-grow column flex-center">
      <q-knob
        :model-value="overallProgress"
        :min="0"
        :max="100"
        :thickness="0.13"
        size="150px"
        color="primary"
        track-color="secondary"
        show-value
        readonly
      >
        <div class="flex column flex-center q-mt-xs">
          <div class="text-h4 text-bold">
            {{ overallProgress }}%
          </div>
          <div class="text-body2 text-generic">
            {{ overallLabel }}
          </div>
        </div>
      </q-knob>
      <div class="flex justify-center full-width q-mt-lg">
        <q-btn
          color="primary"
          :label="primaryActionLabel"
          :loading="busy"
          :disable="primaryActionDisabled"
          unelevated
          rounded
          @click="patch"
        >
          <template #loading>
            <q-spinner-hourglass />
          </template>
        </q-btn>
        <q-btn
          class="q-ml-md"
          color="primary"
          :label="$t('patcher.fixRegistry')"
          :loading="fixRegistry.busy"
          :disable="fixRegistryDisabled"
          unelevated
          outline
          rounded
          @click="ensureRegistrySetting(false)"
        />
      </div>
    </div>
    <q-separator class="q-my-md" />
    <div class="q-py-sm">
      <div class="row justify-between">
        <q-badge
          v-if="filesTotal"
          class="q-mr-xs"
          color="generic"
          :label="fileCounterLabel"
          transparent
          outline
        />
        <div class="col ellipsis">
          {{ fileStatusLabel }}
        </div>
        <div
          v-if="fileProgressLabel"
          class="text-generic text-caption"
        >
          {{ fileProgressLabel }}
        </div>
      </div>
      <div class="q-mt-xs">
        <q-linear-progress
          class="step-progress"
          color="accent"
          track-color="secondary"
          size="18px"
          :value="stepProgress / 100"
          :indeterminate="step.indeterminate"
          instant-feedback
          rounded
        >
          <div
            v-if="busy && !step.indeterminate"
            class="absolute-full flex flex-center"
          >
            <div
              class="text-caption line-height-1"
              :class="[stepProgress < 50 ? 'text-generic' : 'text-white']"
            >
              {{ stepProgress }}%
            </div>
          </div>
        </q-linear-progress>
      </div>
    </div>
  </div>
  <q-dialog v-model="fixRegistry.dialog">
    <q-card>
      <q-card-section>
        <div class="text-body2 flex items-center no-wrap">
          <q-avatar
            icon="fa-solid fa-info"
            color="primary"
            text-color="white"
            size="md"
          />
          <span class="q-ml-sm">{{ $t('patcher.registry.missing') }}</span>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-close-popup
          color="primary"
          :label="$t('general.no')"
          flat
        />
        <q-btn
          color="primary"
          :label="$t('general.yes')"
          :loading="fixRegistry.busy"
          unelevated
          @click="writeRegistry"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="patchError.dialog">
    <q-card style="width: 60%;">
      <q-card-section class="bg-negative text-white">
        <div class="text-h6">
          {{ t('patcher.errorDialog.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-body2">
          {{ t('patcher.errorDialog.description') }}
        </div>
        <div class="text-caption q-mt-sm">
          <div>
            <strong>{{ t('patcher.errorDialog.code') }}</strong>
            <q-chip
              :ripple="false"
              dense
            >
              {{ patchError.code }}
            </q-chip>
          </div>
          <div v-if="patchError.message">
            <strong>{{ t('patcher.errorDialog.message') }}</strong><br>
            {{ patchError.message }}
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-close-popup
          color="negative"
          :label="t('general.ok')"
          flat
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {
  PropType,
  ref,
  computed,
  watch,
  onBeforeUnmount
} from 'vue'
import {
  onBeforeRouteLeave
} from 'vue-router'
import { format } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRegionStore, regionStatus } from 'stores/region'
import { useNotify } from 'src/composables/notify'
import type { IRegion } from 'stores/region'

const props = defineProps({
  region: {
    type: Object as PropType<IRegion>,
    required: true
  }
})

const { humanStorageSize } = format
const { checkStatus } = useRegionStore()
const { t } = useI18n()
const notify = useNotify()

type stepT =
  | 'processPatchInfo'
  | 'checkLocal'
  | 'checkDisk'
  | 'download'
  | 'extract'
  | 'apply'
  | 'validate'

const stepsProgress = ref<number[]>([])
const step = ref<{
  index: number
  active: stepT | null
  indeterminate: boolean
}>({
  index: -1,
  active: null,
  indeterminate: false
})
const filesTotal = ref(0)
const file = ref({
  index: -1,
  name: '',
  progress: 0,
  size: 0,
  speed: 0,
  receivedBytes: 0
})
const busy = ref(false)

const fixRegistry = ref({
  dialog: false,
  busy: false
})
const patchError = ref({
  dialog: false,
  code: '',
  message: ''
})

const patchMode = computed(() => {
  if ([regionStatus.LATEST_VERSION, regionStatus.CLIENT_DAMAGED].includes(props.region.status))
    return 'repair'
  if (props.region.status === regionStatus.CLIENT_OUTDATED)
    return 'update'
  return 'install'
})
const primaryActionLabel = computed(() => {
  if (patchMode.value === 'repair')
    return t('patcher.repair')
  if (patchMode.value === 'update')
    return t('patcher.updateNow')
  return t('patcher.installNow')
})
const primaryActionDisabled = computed(() => {
  return props.region.refreshing ||
    props.region.status === regionStatus.UNKNOWN ||
    props.region.status >= regionStatus.CLIENT_PATH_NOT_SET ||
    fixRegistry.value.busy
})
const fixRegistryDisabled = computed(() => {
  return props.region.status === regionStatus.CLIENT_PATH_NOT_SET ||
    busy.value
})
const patchDone = computed(() => {
  return !busy.value && step.value.index === stepsProgress.value.length - 1
})
const overallProgress = computed(() => {
  if (stepsProgress.value.length === 0)
    return 0

  const sum = stepsProgress.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / stepsProgress.value.length)
})
const overallLabel = computed(() => {
  if (step.value.index === -1)
    return t('patcher.ready')

  if (patchDone.value)
    return t('patcher.done')

  return step.value.active ? t(`patcher.step.${step.value.active}`) : t('patcher.inProgress')
})
const stepProgress = computed(() => {
  if (step.value.index === -1 || step.value.indeterminate || patchDone.value)
    return 0

  const value = step.value.active === 'download'
    ? file.value.progress
    : stepsProgress.value[step.value.index]
  return Number(value.toFixed(1))
})
const fileCounterLabel = computed(() => {
  return `${file.value.index + 1} / ${filesTotal.value}`
})
const fileStatusLabel = computed(() => {
  if (!step.value.active)
    return t('patcher.waiting')

  if (patchDone.value)
    return t('patcher.done')

  return filesTotal.value
    ? file.value.name
    : t('patcher.busying')
})
const fileProgressLabel = computed(() => {
  if (step.value.active === 'download') {
    const size = `${humanStorageSize(file.value.receivedBytes)} / ${humanStorageSize(file.value.size)}`
    const speed = `${file.value.speed === Infinity ? '0B' : humanStorageSize(file.value.speed)}/s`
    return `${size} (${speed})`
  }
  return null
})

watch(overallProgress, (value) => {
  window.__KP_APP__.setProgressBar(value / 100)
})

const { init, on, off } = window.__KP_CORE__.patcher
on('start', (data) => {
  step.value.index = -1
  stepsProgress.value = Array(data.count).fill(0)
  busy.value = true
  window.__KP_APP__.setProgressBar(true)
})
on('end', async () => {
  filesTotal.value = 0
  await checkStatus(props.region.code)
  step.value.indeterminate = false
  busy.value = false
  window.__KP_APP__.setProgressBar(false)
  ensureRegistrySetting(true)
})
on('step-start', (data) => {
  step.value.index = data.stepIndex
  step.value.active = data.name
  file.value.index = -1
  file.value.name = ''

  if (data.indeterminate)
    step.value.indeterminate = true
  else
    step.value.indeterminate = false

  filesTotal.value = data.count ?? 0
})
on('step-update', (data) => {
  if (data.type === 'step-meta') {
    step.value.indeterminate = data.indeterminate
    return
  }

  file.value.index = data.fileIndex

  const increaseStepProgress = () => {
    stepsProgress.value[data.stepIndex] = (data.fileIndex + 1) / filesTotal.value * 100
  }

  if (data.type === 'file-meta') {
    // file.value.size = data.meta.size
  } else if (data.type === 'file-start') {
    file.value.name = data.file
    file.value.size = data.size ?? 0
    file.value.progress = 0
    file.value.receivedBytes = 0
  } else if (data.type === 'file-download') {
    file.value.progress = data.progress?.percentage ?? 0
    if (data.progress?.speed && !isNaN(data.progress?.speed))
      file.value.speed = data.progress?.speed
    file.value.receivedBytes = data.progress?.bytes ?? 0
  } else if (data.type === 'file-build') {
    // Too fast so do nothing
  } else if (data.type === 'file-end') {
    file.value.progress = 100
    increaseStepProgress()
  } else {
    file.value.name = data.file
    if (filesTotal.value)
      increaseStepProgress()
  }
})
on('step-end', (data) => {
  stepsProgress.value[data.stepIndex] = 100
})
on('error', (error) => {
  let message = ''
  if (error.code === 'INSUFFICIENT_DISK_SPACE') {
    message = t('patcher.errorDialog.insufficientDiskSpace', {
      estimated: humanStorageSize(error.detail.estimated),
      free: humanStorageSize(error.detail.free)
    })
  } else if (error.code === 'DOWNLOAD_ERROR')
    message = error.detail.message

  step.value.index = -1
  step.value.active = null
  step.value.indeterminate = false
  stepsProgress.value = []
  filesTotal.value = 0
  busy.value = false
  window.__KP_APP__.setProgressBar(false)

  patchError.value.code = error.code
  patchError.value.message = message
  patchError.value.dialog = true
})
const patch = () => {
  const patchUrl = props.region?.server.patchUrl
  const version = props.region?.server.version
  const localPath = props.region?.client.path
  if (patchUrl && version && localPath) {
    init(patchUrl, version, localPath, {
      mode: patchMode.value
    })
  }
}

const getRegistrySettingValue = () => {
  if (!props.region?.client.path)
    return null

  const { rootPathName, executableName } = props.region.registry
  const { resolve } = window.__KP_UTILS__.path

  return {
    [rootPathName]: props.region.client.path,
    [executableName]: resolve(props.region.client.path, props.region.exeFile)
  }
}
const ensureRegistrySetting = async (ignorePassedNotify = false) => {
  const { path, rootPathName, executableName } = props.region.registry
  const registry = await window.__KP_APP__.readRegistry(path)
  const value = getRegistrySettingValue()
  if (registry !== null && value !== null) {
    const passed = [rootPathName, executableName].every((name) => {
      const reg = registry.find(item => item.name === name)
      if (reg?.value === value[name])
        return true

      return false
    })
    if (passed) {
      if (!ignorePassedNotify)
        notify.success(t('patcher.registry.nothingToFix'))

      return
    }
  }
  fixRegistry.value.dialog = true
}
const writeRegistry = async () => {
  fixRegistry.value.busy = true
  const { path, rootPathName, executableName } = props.region.registry
  const value = getRegistrySettingValue()
  if (value === null)
    return

  const tasks = [
    window.__KP_APP__.writeRegistry(path, rootPathName, value[rootPathName]),
    window.__KP_APP__.writeRegistry(path, executableName, value[executableName])
  ]
  const result = await Promise.all(tasks)

  fixRegistry.value.busy = false
  fixRegistry.value.dialog = false

  if (result.every(item => item))
    notify.success(t('patcher.registry.fixSuccess'))
  else
    notify.warning(t('patcher.registry.fixFailed'))
}

onBeforeRouteLeave((_to, _from, next) => {
  if (busy.value) {
    notify.warning(t('patcher.noLeaving'))
    return
  }
  next()
})
onBeforeUnmount(() => {
  off()
})
</script>

<style lang="scss" scoped>
.step-progress {

  :deep(.q-linear-progress__track) {
    opacity: 1;
  }
}
</style>
