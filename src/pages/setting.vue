<template>
  <div class="row full-height q-pa-lg">
    <div class="col-4">
      <q-list class="text-generic">
        <q-item
          v-for="page in pages"
          :key="page.name"
          v-ripple
          class="half-rounded-borders non-draggable"
          active-class="text-light bg-primary"
          :to="page.path"
          :title="page.description"
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
              {{ page.name }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="col-grow q-ml-lg shadow-backdrop">
      <div class="bg-white relative-position full-height q-pa-md rounded-borders shadow-generic">
        <div class="bg-info text-light flex items-center q-pa-md half-rounded-borders">
          <q-icon
            name="fa-solid fa-circle-info"
            size="xs"
          />
          <div class="q-ml-sm text-body-1">
            選擇各伺服器遊戲主程式安裝路徑。
          </div>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export const settingPages = [
  {
    name: '遊戲設定',
    description: '選擇各伺服器遊戲主程式安裝路徑。',
    icon: 'fa-solid fa-gamepad-modern',
    path: '/setting/game'
  },
  {
    name: '語言設定',
    description: '選擇更新器界面顯示語言。',
    icon: 'fa-solid fa-language',
    path: '/setting/language'
  },
  {
    name: '下載設定',
    description: '選擇檔案下載偏好設定。',
    icon: 'fa-solid fa-download',
    path: '/setting/download'
  },
  {
    name: '關於',
    description: '查看程式作者及版本資訊。',
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
    name: '返回',
    description: '返回主頁面。',
    icon: 'fa-solid fa-circle-arrow-left',
    path: fromRoute?.path ?? '/'
  }
]
</script>

<style lang="scss" scoped>
.page-icon {
  min-width: 36px;
}
</style>
