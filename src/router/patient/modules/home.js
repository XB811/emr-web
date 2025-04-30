import Layout from '@/layout'
export default {
  path: '/home',
  component: Layout,
  children: [{
    path: '',
    component: () => import('@/views/doctor/home/index'),
    name: 'home', //可以用来跳转， 也可以标记路由
    meta:{
      //路由元信息
      title: '首页', //用于显示在侧边栏和面包屑导航中
      icon: 'dashboard', //用于显示在侧边栏中
    }
  }]
}
