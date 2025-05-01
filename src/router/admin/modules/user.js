import Layout from '@/layout'
export default {
  path: '/user',
  component: Layout,
  redirect: '/user/doctor', // 当用户名不是root时重定向到医生管理
  name: 'user',
  meta: {
    title: '用户管理', //用于显示在侧边栏和面包屑导航中
    icon: 'user', //用于显示在侧边栏中
  },
  children: [
    {
      path:'admin',
      name:'admin',
      component: () => import('@/views/admin/admin'),
      meta: {
        title: '管理员管理', //用于显示在侧边栏和面包屑导航中
        icon: 'admin', //用于显示在侧边栏中
      }
    },
    {
      path: 'doctor',
      name: 'doctor',
      component: () => import('@/views/admin/doctor'),
      meta: {
        title: '医生管理', //用于显示在侧边栏和面包屑导航中
        icon: 'doctor', //用于显示在侧边栏中
      }
    },
    {
      path: 'patient',
      name: 'patient',
      component: () => import('@/views/admin/patient'),
      meta: {
        title: '患者管理', //用于显示在侧边栏和面包屑导航中
        icon: 'patient', //用于显示在侧边栏中
      }
    }
  ]
}
