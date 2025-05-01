import Layout from '@/layout'
export default {
  path: '/emr',
  component: Layout,
  name: 'Emr',
  children: [{
    path: '',
    component: () => import('@/views/admin/emr'),
    name: 'emr',
    meta:{
      //路由元信息
      title: '病历管理', //用于显示在侧边栏和面包屑导航中
      icon: 'emr', //用于显示在侧边栏中
    }
  }]
}
