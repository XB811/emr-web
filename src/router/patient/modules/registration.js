import Layout from '@/layout'
export default {
  path: '/registration',
  component: Layout,
  name: 'Registration',
  children: [{
    path: '',
    component: () => import('@/views/patient/registration/index.vue'),
    name: 'Registration',
    meta:{
      //路由元信息
      title: '挂号', //用于显示在侧边栏和面包屑导航中
      icon: 'registration', //用于显示在侧边栏中
    }
  }]
}
