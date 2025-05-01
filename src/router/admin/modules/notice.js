import Layout from '@/layout'
export default {
  path: '/notice',
  component: Layout,
  name: 'Notice',
  children: [{
    path: '',
    component: () => import('@/views/admin/notice'),
    name: 'Notice',
    meta:{
      //路由元信息
      title: '公告管理', //用于显示在侧边栏和面包屑导航中
      icon: 'notice', //用于显示在侧边栏中
    }
  }]
}
