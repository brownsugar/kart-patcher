<template>
  <div class="column full-height">
    <div class="col-grow column flex-center">
      <q-knob
        :model-value="overallProgress"
        :min="0"
        :max="100"
        :thickness="0.15"
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
          label="開始更新"
          unelevated
          rounded
          :loading="busy"
          @click="patch"
        />
        <!-- <q-btn
          class="q-ml-md"
          color="primary"
          label="修復安裝路徑"
          unelevated
          rounded
        /> -->
      </div>
    </div>
    <q-separator class="q-my-md" />
    <div class="q-py-sm">
      <div class="row justify-between">
        <div
          v-if="filesTotal"
          class="text-accent q-mr-xs"
        >
          {{ fileCounterLabel }}
        </div>
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
          :indeterminate="stepIndeterminate"
          instant-feedback
          rounded
        >
          <div
            v-if="busy && !stepIndeterminate"
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
</template>

<script lang="ts" setup>
import { PropType, ref, computed, onBeforeUnmount } from 'vue'
import { format } from 'quasar'
import { useRegionStore } from 'stores/region'
import type { IRegion } from 'stores/region'

const props = defineProps({
  region: {
    type: Object as PropType<IRegion>,
    required: true
  }
})

const { humanStorageSize } = format
const { checkStatus } = useRegionStore()
const stepTitle = {
  processPatchInfo: '獲取更新資訊中',
  checkLocal: '檢查本機檔案中',
  download: '下載檔案中',
  extract: '解壓縮檔案中',
  apply: '套用檔案中',
  validate: '驗證檔案中'
}

const stepsProgress = ref<number[]>([])
const stepIndex = ref(-1)
const stepActive = ref<keyof typeof stepTitle | null>(null)
const stepIndeterminate = ref(false)
const filesTotal = ref(0)
const fileIndex = ref(-1)
const fileName = ref('')
const fileProgress = ref(0)
const fileSize = ref(0)
const fileSpeed = ref(0)
const fileReceivedBytes = ref(0)
const busy = ref(false)

const patchDone = computed(() => {
  return !busy.value && stepIndex.value === stepsProgress.value.length - 1
})
const overallProgress = computed(() => {
  if (stepsProgress.value.length === 0)
    return 0

  const sum = stepsProgress.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / stepsProgress.value.length)
})
const overallLabel = computed(() => {
  if (stepIndex.value === -1)
    return '就緒'

  if (patchDone.value)
    return '更新完成'

  return stepActive.value ? stepTitle[stepActive.value] : '更新進行中'
})
const stepProgress = computed(() => {
  if (stepIndex.value === -1 || stepIndeterminate.value || patchDone.value)
    return 0

  const value = stepActive.value === 'download'
    ? fileProgress.value
    : stepsProgress.value[stepIndex.value]
  return Number(value.toFixed(1))
})
const fileCounterLabel = computed(() => {
  return `[${fileIndex.value + 1} / ${filesTotal.value}]`
})
const fileStatusLabel = computed(() => {
  if (!stepActive.value)
    return '等候操作'

  if (patchDone.value)
    return '更新完成 ✔️'

  return filesTotal.value
    ? fileName.value
    : '請稍候...'
})
const fileProgressLabel = computed(() => {
  if (stepActive.value === 'download') {
    const size = `${humanStorageSize(fileReceivedBytes.value)} / ${humanStorageSize(fileSize.value)}`
    const speed = `${fileSpeed.value === Infinity ? '0B' : humanStorageSize(fileSpeed.value)}/s`
    return `${size} (${speed})`
  }
  return null
})

const { init, on, off } = window.__KP_CORE__.patcher
on('start', (data) => {
  stepIndex.value = -1
  busy.value = true
  stepsProgress.value = Array(data.count).fill(0)
})
on('end', async () => {
  await checkStatus(props.region.code)
  busy.value = false
  stepIndeterminate.value = false
})
on('step-start', (data) => {
  stepIndex.value = data.stepIndex
  stepActive.value = data.name
  fileIndex.value = -1
  fileName.value = ''

  if (data.indeterminate)
    stepIndeterminate.value = true
  else
    stepIndeterminate.value = false

  filesTotal.value = data.count ?? 0
})
on('step-update', (data) => {
  fileIndex.value = data.fileIndex

  const increaseStepProgress = () => {
    stepsProgress.value[data.stepIndex] = (data.fileIndex + 1) / filesTotal.value * 100
  }

  if (data.type === 'file-meta')
    fileSize.value = data.meta.size
  else if (data.type === 'file-start') {
    fileName.value = data.file
    fileProgress.value = 0
    fileSize.value = 0
    fileReceivedBytes.value = 0
  } else if (data.type === 'file-download') {
    fileProgress.value = data.progress?.percentage ?? 0
    if (data.progress?.speed && !isNaN(data.progress?.speed))
      fileSpeed.value = data.progress?.speed
    fileReceivedBytes.value = data.progress?.bytes ?? 0
  } else if (data.type === 'file-build') {
    // Too fast so do nothing
  } else if (data.type === 'file-end') {
    fileProgress.value = 100
    increaseStepProgress()
  } else {
    fileName.value = data.file
    if (filesTotal.value)
      increaseStepProgress()
  }
})
on('step-end', (data) => {
  stepsProgress.value[data.stepIndex] = 100
})
on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(error)
})
const patch = () => {
  const patchUrl = props.region?.server.patchUrl
  const version = props.region?.server.version
  const localPath = props.region?.client.path
  if (patchUrl && version && localPath)
    init(patchUrl, version, localPath)
}

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
