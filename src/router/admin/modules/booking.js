import Layout from '@/layout'
export default {
  path: '/booking',
  component: Layout,
  name: 'Booking',
  children: [{
    path: '',
    component: () => import('@/views/admin/booking'),
    name: 'Booking',
    meta:{
      //路由元信息
      title: '预约时间管理', //用于显示在侧边栏和面包屑导航中
      icon: 'booking', //用于显示在侧边栏中
    }
  }]
}
