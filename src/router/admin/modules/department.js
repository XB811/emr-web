import Layout from '@/layout'
export default {
  path: '/department',
  component: Layout,
  name: 'Department',
  children: [{
    path: '',
    component: () => import('@/views/admin/department'),
    name: 'Department',
    meta:{
      //路由元信息
      title: '科室管理', //用于显示在侧边栏和面包屑导航中
      icon: 'department', //用于显示在侧边栏中
    }
  }]
}
