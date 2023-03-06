<template>
  <div class="row full-height q-pa-lg">
    <div class="col-4 column">
      <div class="column col-grow flex-center bg-white rounded-borders q-pa-md shadow-generic">
        <q-img
          class="no-border-radius"
          :src="region?.flag"
          :alt="region?.name"
          width="40px"
          height="40px"
          no-spinner
        />
        <div class="text-h6 text-bold q-mt-sm">
          {{ region?.name }}
        </div>
        <RegionStatus
          :code="region?.code"
        />
      </div>
      <div class="column bg-white rounded-borders q-mt-md shadow-generic">
        <q-list
          class="full-width"
          padding
        >
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('client.localVersion') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>
                {{ region?.client.version ?? 'N/A' }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset />
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('client.serverVersion') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label
                :class="{
                  'text-negative': region?.server.version !== region?.client.version
                }"
              >
                {{ region?.server.version ?? 'N/A' }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset />
          <q-item>
            <q-item-section>
              <q-btn
                color="primary"
                :href="region?.patchNewsUrl"
                target="_blank"
                rounded
                flat
              >
                {{ $t('action.viewPatchNews') }}
                <q-icon
                  class="q-ml-md"
                  name="fa-solid fa-arrow-up-right-from-square"
                  size="xs"
                />
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
    <div class="col q-ml-lg shadow-backdrop">
      <div class="bg-white full-height relative-position q-pa-md rounded-borders shadow-generic">
        <KartPatcher
          v-if="region"
          :region="region"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import RegionStatus from 'components/region-status.vue'
import KartPatcher from 'components/kart-patcher.vue'
import { useRegionStore } from 'stores/region'

const { regions } = storeToRefs(useRegionStore())
const route = useRoute()
const router = useRouter()

const region = computed(() => regions.value.find(r => r.code === route.params.code))

onBeforeMount(() => {
  if (!region.value)
    router.replace('/')
})
</script>
<script lang="ts">
export default defineComponent({
  name: 'PageRegion'
})
</script>
