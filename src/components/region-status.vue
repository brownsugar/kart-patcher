<template>
  <q-badge
    class="q-mt-sm q-px-sm q-py-xs"
    :color="color"
    rounded
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
  </q-badge>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRegionStore } from 'stores/region'
import type { regionCodeT } from 'stores/region'

const props = defineProps({
  code: {
    type: String as PropType<regionCodeT>,
    default: ''
  }
})

const store = storeToRefs(useRegionStore())
const region = computed(() => store[props.code].value)

const color = computed(() => {
  if (region.value.status === 100)
    return 'positive'

  if (region.value.status >= 200 && region.value.status < 300)
    return 'negative'

  return 'grey'
})
const icon = computed(() => {
  if (region.value.status === 100)
    return 'fa-solid fa-circle-check'

  if (region.value.status >= 200 && region.value.status < 300)
    return 'fa-solid fa-exclamation-triangle'

  return null
})
</script>
