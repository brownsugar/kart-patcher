import { RouteRecordRaw } from 'vue-router'

export const settingPages = [
  {
    key: 'game',
    icon: 'fa-solid fa-gamepad',
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

const settingChildComponents = import.meta.glob('pages/setting/*.vue')
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/default.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/index.vue')
      },
      {
        path: '/region/:code',
        component: () => import('pages/region.vue')
      },
      {
        path: 'setting',
        component: () => import('pages/setting.vue'),
        redirect: settingPages[0].path,
        children: settingPages.map(page => ({
          path: page.path,
          component: () => settingChildComponents[`../pages${page.path}.vue`]()
        }))
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/error.vue')
  }
]

export default routes
