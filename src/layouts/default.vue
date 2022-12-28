<template>
  <q-layout view="hHh LpR fFf">
    <q-header
      class="layout-header rounded-borders q-pb-md"
    >
      <q-toolbar
        ref="toolbar"
        class="bg-primary q-electron-drag q-px-lg"
      >
        <q-avatar>
          <q-icon name="fa-solid fa-wrench" />
        </q-avatar>
        <q-toolbar-title class="text-bold">
          Kart Patcher
        </q-toolbar-title>
        <template v-for="(item, i) in headerMenuItems">
          <q-separator
            v-if="item.separator"
            :key="'sep-' + i"
            class="q-my-md"
            :class="{
              'q-ml-md': i > 0,
              'q-mr-sm': i < headerMenuItems.length - 1
            }"
            dark
            inset
            vertical
          />
          <q-btn
            v-else
            :key="'btn-' + i"
            :class="{
              active: isItemActive(item.to),
              'q-ml-sm': i > 0
            }"
            :icon="item.icon"
            :to="item.to"
            :href="item.href"
            :target="item.href ? '_blank' : undefined"
            :color="item.color ?? 'secondary'"
            size="sm"
            round
            flat
            @click="item.method && item.method()"
          >
            <q-tooltip
              v-if="item.label"
              :offset="[0, 20]"
              class="bg-accent"
            >
              {{ item.label }}
            </q-tooltip>
          </q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container class="layout-container">
      <q-page
        class="layout-page bg-light rounded-borders"
        :style-fn="styleFn"
      >
        <div
          ref="indicator"
          class="indicator"
          :class="{
            invisible: indicatorOffsetX < 0
          }"
          :style="{
            transform: `translateX(${indicatorOffsetX}px)`
          }"
        />
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import {
  defineComponent,
  ref,
  watch,
  onMounted,
  nextTick
} from 'vue'
import { useRoute } from 'vue-router'
import type { QToolbar } from 'quasar'

const toolbar = ref<QToolbar>()
const indicator = ref<HTMLDivElement>()
const indicatorOffsetX = ref(-1)
const route = useRoute()

const headerMenuItems = [
  {
    icon: 'fa-solid fa-home',
    label: 'Home',
    to: '/'
  },
  {
    icon: 'fa-solid fa-gear',
    label: 'Settings',
    to: '/setting'
  },
  {
    icon: 'fa-solid fa-sparkles',
    label: 'New version found!',
    href: 'https://github.com/brownsugar/kartrider-patcher/releases/latest',
    color: 'warning'
  },
  {
    separator: true
  },
  {
    icon: 'fa-solid fa-minus',
    label: 'Minimize',
    method: () => {
      window.__KART_PATCHER__.app.minimize()
    }
  },
  {
    icon: 'fa-solid fa-xmark',
    label: 'Close',
    method: () => {
      window.__KART_PATCHER__.app.close()
    }
  }
]

const styleFn = (offset: number) => {
  return { height: offset ? `calc(100vh - ${offset}px + 16px)` : '100vh' }
}
const isItemActive = (to?: string) => {
  if (!to) {
    return false
  }
  return to === '/' ? route.path === to : route.path.startsWith(to ?? '')
}
const updateIndicatorStyle = async () => {
  await nextTick()
  const toolbarEl = toolbar.value?.$el
  const indicatorEl = indicator.value
  if (!toolbarEl || !indicatorEl) {
    indicatorOffsetX.value = -1
    return
  }
  const indicatorWidth = indicatorEl.offsetWidth
  const activeBtnEl = toolbarEl.querySelector('.q-btn.active')
  if (!activeBtnEl) {
    indicatorOffsetX.value = -1
    return
  }
  const { left: btnLeft, width: btnWidth } = activeBtnEl.getBoundingClientRect()
  indicatorOffsetX.value = btnLeft + (btnWidth - indicatorWidth) / 2
}

watch(() => route.path, updateIndicatorStyle)

onMounted(() => {
  updateIndicatorStyle()
})
</script>
<script lang="ts">
export default defineComponent({
  name: 'LayoutDefault'
})
</script>

<style lang="scss" scoped>
.layout-header {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  .q-toolbar {
    min-height: 60px;
  }
}
.layout-container {
  position: relative;
  z-index: 2001;
  pointer-events: none;
}
.layout-page {
  margin-top: -$space-base;
  pointer-events: auto;

  .indicator {
    display: block;
    width: 80px;
    height: 10px;
    background: url('assets/images/indicator.svg') center/cover no-repeat;
    position: absolute;
    bottom: 100%;
  }
}
</style>
