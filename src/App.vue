<template>
  <div id="app">
    <!--  通过路由视图来渲染路由组件
     main.js -> App.vue -> router/index.js
    查询路由参数配置进行跳转 -->
    <!-- 一级路由 -->
    <router-view />
  </div>
</template>

<script>
// 给组件添加一个名称
export default {
  name: 'App'
}
</script>
