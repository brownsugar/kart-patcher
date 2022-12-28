<template>
  <div class="page-index full-height row no-wrap q-pa-lg">
    <div
      v-for="region in regions"
      :key="region.code"
      class="region shadow-backdrop"
    >
      <q-card class="column justify-between full-height shadow-generic q-px-md q-py-lg">
        <q-card-section>
          <q-img
            :src="region.flag"
            :alt="region.name"
            width="40px"
            height="40px"
            no-spinner
          />
          <div
            class="text-h5 text-bold q-mt-lg"
            v-html="region.name.split(' ').join('<br>')"
          />
          <RegionStatus
            :value="region.status"
          />
        </q-card-section>
        <q-card-actions>
          <q-btn
            :to="`/region/${region.code}`"
            class="full-width"
            color="generic"
            label="查看詳情"
            icon-right="fa-solid fa-circle-arrow-right"
            padding="sm md"
            align="between"
            rounded
            outline
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue'
import RegionStatus from 'components/region-status.vue'
import { useRegionStore } from 'src/stores/region'

const { regions } = useRegionStore()
</script>
<script lang="ts">
export default defineComponent({
  name: 'PageIndex'
})
</script>

<style lang="scss" scoped>
.page-index {
  gap: 12px;
}
.region {
  flex: 1;
}
</style>
