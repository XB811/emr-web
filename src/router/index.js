import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import adminRoutes from './admin'
import doctorRoutes from './doctor'
import patientRoutes from './patient'
import layout from "@/layout/index.vue";

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/common/login/index'),
    hidden: true
  },
  {
    path: '/register',
    component:() => import('@/views/common/registration/index'),
    hidden: true
  },
  {
    path: '/resetPassword',
    component:() => import ("@/views/common/resetPassword"),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 开发页面
  {path: '/dev',
    component: layout,
    hidden:  process.env.NODE_ENV !== 'development',
    children: [
      {
        path: '',
        name: 'dev',
        component:  () =>  process.env.NODE_ENV === 'development'?
              import('@/views/dev/dev.vue'):import('@/views/404.vue'),
        meta: { title: '开发页面', icon: 'el-icon-s-tools' }
      }
    ]

  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
  },

  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

// 按角色配置路由映射
export const roleRoutes = {
  admin: adminRoutes,
  doctor: doctorRoutes,
  patient: patientRoutes
}


const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
