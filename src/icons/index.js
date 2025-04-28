import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'// svg component

// register globally
// 使用公共组件components下的SvgIcon.vue对svg进行全局注册
Vue.component('svg-icon', SvgIcon)

// 引入目录下所有的svg文件
//  require.context(目标目录，是否扫描子目录，正则表达式匹配文件) 扫描目录下的所有svg文件
const req = require.context('./svg', false, /\.svg$/)
// requireContext.keys() 即可获取目录下所有文件的路径数组
// map 循环遍历数组
// const 函数名 = 参数 =》方法
// 参数的 key（即文件路径）调用map方法 循环每一个svg文件
const requireAll = requireContext => requireContext.keys().map(requireContext)
// 调用方法
requireAll(req)
