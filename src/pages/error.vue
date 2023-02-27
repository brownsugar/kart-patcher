<template>
  <div class="fullscreen bg-primary q-pa-md column flex-center">
    <div class="text-h2 text-light text-bold">
      Error
    </div>
    <div class="text-h5 text-secondary q-mt-md">
      Oops. Nothing here...
    </div>
    <q-btn
      class="q-mt-xl"
      color="secondary"
      text-color="accent"
      to="/"
      :label="$t('action.backToHome')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageError'
})
</script>
