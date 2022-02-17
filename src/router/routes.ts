import type { RouteRecordRaw } from 'vue-router'
import HelloWorld from '../pages/HelloWorld.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: HelloWorld
  },
  {
    path: '/hello-threejs',
    component: () => import('../pages/HelloThreejs.vue')
  },
]

export default routes
