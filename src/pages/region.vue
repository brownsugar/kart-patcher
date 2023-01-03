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
          :value="region?.status"
        />
      </div>
      <div class="column bg-white rounded-borders q-mt-md shadow-generic">
        <q-list
          class="full-width"
          padding
        >
          <q-item>
            <q-item-section>
              <q-item-label>本機版本</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>
                3064
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset />
          <q-item>
            <q-item-section>
              <q-item-label>線上版本</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>
                3069
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
                查看更新資訊
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
    <div class="col-grow q-ml-lg shadow-backdrop">
      <div class="bg-white full-height relative-position q-pa-md rounded-borders shadow-generic">
        <div class="column full-height">
          <div class="col-grow column flex-center">
            <q-knob
              v-model="knobValue"
              :min="0"
              :max="100"
              :thickness="0.1"
              size="150px"
              color="primary"
              track-color="secondary"
              show-value
              readonly
            >
              <div class="text-h4 text-bold">
                {{ knobValue }}%
              </div>
              <div class="text-generic text-body2">
                382 MB / 2.1 GB
              </div>
            </q-knob>
            <div class="flex justify-center full-width q-mt-lg">
              <q-btn
                color="primary"
                label="暫停更新"
                unelevated
                rounded
              />
              <q-btn
                class="q-ml-md"
                color="primary"
                label="啓動遊戲"
                unelevated
                rounded
              />
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div class="q-py-sm">
            <div class="row justify-between">
              <div class="text-accent">
                下載檔案：zeta_kr_loading.rho
              </div>
              <div class="text-generic text-caption">
                2.5 MB / 230.5 MB (9.9 MB/s)
              </div>
            </div>
            <div class="q-mt-xs">
              <q-linear-progress
                class="task-progress"
                color="accent"
                track-color="secondary"
                size="18px"
                :value="taskProgress / 100"
                :indeterminate="false"
                rounded
              >
                <div class="absolute-full flex flex-center">
                  <div
                    class="text-caption line-height-1"
                    :class="[taskProgress < 50 ? 'text-generic' : 'text-white']"
                  >
                    {{ taskProgress }}%
                  </div>
                </div>
              </q-linear-progress>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import RegionStatus from 'components/region-status.vue'
import { useRegionStore } from 'stores/region'

const { regions } = storeToRefs(useRegionStore())
const route = useRoute()
const router = useRouter()
const knobValue = ref(30)
const taskProgress = ref(55)

const region = computed(() => regions.value.find(r => r.code === route.params.code))

onBeforeMount(() => {
  if (!region.value) {
    router.replace('/')
  }
})
</script>
<script lang="ts">
export default defineComponent({
  name: 'PageRegion'
})
</script>

<style lang="scss" scoped>
.task-progress {

  :deep(.q-linear-progress__track) {
    opacity: 1;
  }
}
</style>
