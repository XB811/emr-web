import Layout from '@/layout'
export default {
  path: '/home',
  component: Layout,
  name: 'Home',
  children: [{
    path: '',
    component: () => import('@/views/admin/home/index'),
    name: 'Home',
    meta:{
      //路由元信息
      title: '主页', //用于显示在侧边栏和面包屑导航中
      icon: 'home', //用于显示在侧边栏中
    }
  }]
}
