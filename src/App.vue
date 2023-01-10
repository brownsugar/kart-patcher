<template>
  <router-view />
</template>

<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useRegionStore } from 'stores/region'

const { initState } = useRegionStore()

onBeforeMount(() => {
  initState()
})
</script>
