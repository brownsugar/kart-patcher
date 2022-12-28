import { RouteRecordRaw } from 'vue-router'
import { settingPages } from 'src/pages/setting.vue'

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
        component: () => import('src/pages/setting.vue'),
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
