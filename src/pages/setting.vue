<template>
  <div class="row full-height q-pa-lg">
    <div class="col-4">
      <q-list class="text-generic">
        <q-item
          v-for="page in pages"
          :key="page.key"
          v-ripple
          class="half-rounded-borders non-draggable"
          active-class="text-light bg-primary"
          :to="page.path"
          :title="$t(`setting.${page.key}.description`)"
          exact
        >
          <q-item-section
            class="page-icon"
            avatar
          >
            <q-icon
              size="xs"
              :name="page.icon"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ $t(`setting.${page.key}.name`) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="col-grow q-ml-lg shadow-backdrop">
      <div class="bg-white relative-position full-height q-pa-md rounded-borders shadow-generic">
        <div class="bg-info text-light flex items-center q-mb-md q-pa-md half-rounded-borders">
          <q-icon
            name="fa-solid fa-circle-info"
            size="xs"
          />
          <div class="q-ml-sm text-body-1">
            {{ $t(`setting.${activePage?.key}.description`) }}
          </div>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { RouteLocationNormalized, useRoute } from 'vue-router'

export const settingPages = [
  {
    key: 'game',
    icon: 'fa-solid fa-gamepad-modern',
    path: '/setting/game'
  },
  {
    key: 'language',
    icon: 'fa-solid fa-language',
    path: '/setting/language'
  },
  {
    key: 'download',
    icon: 'fa-solid fa-download',
    path: '/setting/download'
  },
  {
    key: 'about',
    icon: 'fa-solid fa-circle-info',
    path: '/setting/about'
  }
]
let fromRoute: RouteLocationNormalized

export default defineComponent({
  name: 'PageSetting',
  beforeRouteEnter (_to, from, next) {
    fromRoute = from
    next()
  }
})
</script>
<script lang="ts" setup>
const pages = [
  ...settingPages,
  {
    key: 'back',
    icon: 'fa-solid fa-circle-arrow-left',
    path: fromRoute?.path ?? '/'
  }
]

const route = useRoute()
const activePage = computed(() => settingPages.find(page => page.path === route.path))
</script>

<style lang="scss" scoped>
.page-icon {
  min-width: 36px;
}
</style>
