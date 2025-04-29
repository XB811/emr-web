<template>
  <div class="dashboard-container">
    <!-- 显示用户名的文本区域 -->
    <div class="dashboard-text">username: {{ username }}</div>

    <!-- 使用svg-icon组件显示用户图标 -->
    <svg-icon icon-class="user" />

    <!-- 示例图标容器 -->
    <div>
      <svg-icon icon-class="example"  />
    </div>

  </div>
</template>

<script>
// 导入Vuex的mapGetters辅助函数，用于将store中的getter映射到计算属性
import { mapGetters } from 'vuex'

export default {
  username: 'Dashboard', // 组件名称

  // 计算属性
  computed: {
    // 从Vuex的getters中映射username到组件的计算属性
    ...mapGetters([
      'username' // 获取当前登录用户的用户名
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px; /* 设置dashboard容器的外边距 */
  }
  &-text {
    font-size: 30px; /* 设置文本字体大小 */
    line-height: 46px; /* 设置文本行高 */
  }
}
</style>
