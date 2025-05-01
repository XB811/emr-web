<!--这个组件在顶栏的左侧第二个，负责显示当前路径-->
<template>
  <!-- 面包屑导航容器，使用 el-breadcrumb 组件，设置分隔符为 "/" -->
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <!-- 使用 transition-group 为面包屑项添加过渡动画效果 -->
    <transition-group name="breadcrumb">
      <!-- 循环渲染面包屑项，使用 item.path 作为 key 值 -->
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <!-- 如果是最后一项或设置了 noRedirect，则显示为不可点击的文本 -->
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <!-- 否则显示为可点击的链接 -->
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
// 引入 path-to-regexp 库，用于路径编译和参数替换
import pathToRegexp from 'path-to-regexp'

export default {
  data() {
    return {
      levelList: null // 存储面包屑导航项列表
    }
  },
  // 监听路由变化，更新面包屑
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  // 组件创建时初始化面包屑
  created() {
    this.getBreadcrumb()
  },
  methods: {
    // 获取面包屑数据
    getBreadcrumb() {
      // 只显示有 meta.title 的路由
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]
      // 如果第一个路由不是主页，则在面包屑前添加主页
      //第一个页面重写为主页，不再需要仪表盘了
      // if (!this.isHome(first)) {
      //   matched = [{ path: '/home', meta: { title: '主页' }}].concat(matched)
      // }

      // 过滤出需要在面包屑中显示的路由（meta.breadcrumb 不为 false）
      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    },
    // 判断当前路由是否为主页
    isHome(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      console.log(name.trim().toLocaleLowerCase())
      return name.trim().toLocaleLowerCase() === 'Home'.toLocaleLowerCase()
    },
    // 编译路径，处理动态路由参数
    pathCompile(path) {
      // 解决路由参数问题 https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    // 处理面包屑项点击事件
    handleLink(item) {
      const { redirect, path } = item
      // 如果存在重定向，则跳转到重定向路径
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      // 否则跳转到编译后的路径（处理动态路由参数）
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;  // 不可点击项的颜色
    cursor: text;    // 鼠标指针样式为文本
  }
}
</style>
