<template>
  <q-badge
    class="q-mt-sm q-px-sm q-py-xs"
    :color="color"
    rounded
  >
    <q-icon
      v-if="icon"
      :name="icon"
      class="q-mr-xs"
      color="white"
    />
    <span>{{ regionStatusLabel[value] }}</span>
  </q-badge>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { regionStatusLabel } from 'src/stores/region'
import type { regionStatusT } from 'src/stores/region'

const props = defineProps({
  value: {
    type: Number as PropType<regionStatusT>,
    default: 300
  }
})

const color = computed(() => {
  if (props.value === 100) {
    return 'positive'
  }
  if (props.value >= 200 && props.value < 300) {
    return 'negative'
  }
  return 'grey'
})
const icon = computed(() => {
  if (props.value === 100) {
    return 'fa-solid fa-circle-check'
  }
  if (props.value >= 200 && props.value < 300) {
    return 'fa-solid fa-exclamation-triangle'
  }
  return null
})
</script>
