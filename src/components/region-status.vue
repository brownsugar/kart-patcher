<template>
  <q-badge
    class="q-mt-sm q-px-sm q-py-xs"
    :class="{
      'cursor-pointer': !region.refreshing
    }"
    :color="color"
    rounded
    @click="action"
  >
    <q-spinner-ios
      v-if="region.refreshing"
    />
    <template v-else>
      <q-icon
        v-if="icon"
        :name="icon"
        class="q-mr-xs"
        color="white"
      />
      <span>{{ $t(`region.status.${region.status}`) }}</span>
    </template>
    <q-tooltip
      v-if="!region.refreshing"
      v-model="tooltipVisible"
      :offset="[0, 8]"
    >
      {{ tooltipLabel }}
    </q-tooltip>
  </q-badge>
</template>

<script lang="ts" setup>
import { PropType, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRegionStore, regionStatus } from 'stores/region'
import type { regionCodeT } from 'stores/region'

const props = defineProps({
  code: {
    type: String as PropType<regionCodeT>,
    default: ''
  }
})

const regionStore = useRegionStore()
const store = storeToRefs(regionStore)
const region = computed(() => store[props.code].value)
const { t } = useI18n()
const router = useRouter()

const tooltipVisible = ref(false)

const color = computed(() => {
  if (region.value.status === regionStatus.LATEST_VERSION)
    return 'positive'

  if (
    region.value.status >= regionStatus.CLIENT_OUTDATED &&
    region.value.status < regionStatus.CLIENT_NOT_FOUND
  )
    return 'negative'

  return 'grey'
})
const icon = computed(() => {
  if (region.value.status === regionStatus.LATEST_VERSION)
    return 'fa-solid fa-circle-check'

  if (
    region.value.status >= regionStatus.CLIENT_OUTDATED &&
    region.value.status < regionStatus.CLIENT_NOT_FOUND
  )
    return 'fa-solid fa-exclamation-triangle'

  return null
})
const tooltipLabel = computed(() => {
  if (region.value.status === regionStatus.CLIENT_PATH_NOT_SET)
    return t('region.clickToSet')
  else
    return t('region.clickToRefresh')
})

const action = async () => {
  if (region.value.refreshing)
    return
  tooltipVisible.value = false
  if (region.value.status === regionStatus.CLIENT_PATH_NOT_SET)
    router.push('/setting/game')
  else
    await regionStore.checkStatus(props.code)
}
</script>
