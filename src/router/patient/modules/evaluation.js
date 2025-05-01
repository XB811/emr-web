import Layout from '@/layout'
export default {
  path: '/evaluation',
  component: Layout,
  name: 'Evaluation',
  children: [{
    path: '',
    component: () => import('@/views/patient/evaluation'),
    name: 'Evaluation',
    meta:{
      //路由元信息
      title: '就诊评价管理', //用于显示在侧边栏和面包屑导航中
      icon: 'evaluation', //用于显示在侧边栏中
    }
  }]
}
